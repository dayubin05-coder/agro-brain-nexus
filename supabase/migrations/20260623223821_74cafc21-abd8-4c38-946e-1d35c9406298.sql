
REVOKE ALL ON public.spatial_ref_sys FROM anon, authenticated, public;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.assign_default_role() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_updated_at() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.st_estimatedextent(text, text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.st_estimatedextent(text, text, text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.st_estimatedextent(text, text, text, boolean) FROM anon, authenticated, public;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;

DROP POLICY IF EXISTS "Anyone can view active announcements" ON public.marketplace_anuncios;
CREATE POLICY "Authenticated can view active announcements"
  ON public.marketplace_anuncios FOR SELECT TO authenticated
  USING (status = 'ativo' OR auth.uid() = user_id);
REVOKE SELECT ON public.marketplace_anuncios FROM anon;

DROP POLICY IF EXISTS "Users can insert their own audit reports" ON public.security_audit_reports;
CREATE POLICY "Users can insert their own audit reports"
  ON public.security_audit_reports FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own audit reports" ON public.security_audit_reports;
CREATE POLICY "Users can update their own audit reports"
  ON public.security_audit_reports FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
