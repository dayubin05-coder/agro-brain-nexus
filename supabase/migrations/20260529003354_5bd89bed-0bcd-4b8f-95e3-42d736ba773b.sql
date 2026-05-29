DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin','manager','financeiro','agronomo','supervisor','operador','viewer');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id UUID)
RETURNS SETOF public.app_role LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id;
$$;

DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.assign_default_role()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'viewer')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_assign_role ON auth.users;
CREATE TRIGGER on_auth_user_created_assign_role
AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.assign_default_role();

-- Seed from profiles.tipo (profiles.id == auth user id)
INSERT INTO public.user_roles (user_id, role)
SELECT p.id,
  CASE
    WHEN lower(coalesce(p.tipo,'')) IN ('admin','administrador','nível deus','nivel deus','deus') THEN 'admin'::public.app_role
    WHEN lower(coalesce(p.tipo,'')) = 'manager' THEN 'manager'::public.app_role
    WHEN lower(coalesce(p.tipo,'')) = 'financeiro' THEN 'financeiro'::public.app_role
    WHEN lower(coalesce(p.tipo,'')) IN ('agronomo','agrônomo') THEN 'agronomo'::public.app_role
    WHEN lower(coalesce(p.tipo,'')) = 'supervisor' THEN 'supervisor'::public.app_role
    WHEN lower(coalesce(p.tipo,'')) = 'operador' THEN 'operador'::public.app_role
    ELSE 'viewer'::public.app_role
  END
FROM public.profiles p
WHERE p.id IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'admin'::public.app_role
FROM auth.users u
WHERE u.email = 'etcsuporte889@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;