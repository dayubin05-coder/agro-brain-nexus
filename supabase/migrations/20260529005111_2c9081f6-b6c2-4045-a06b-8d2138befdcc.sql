
-- app_logs: structured error/info logs
CREATE TABLE public.app_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  level text NOT NULL CHECK (level IN ('debug','info','warn','error')),
  message text NOT NULL,
  context text,
  url text,
  user_agent text,
  stack text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX app_logs_created_at_idx ON public.app_logs (created_at DESC);
CREATE INDEX app_logs_level_idx ON public.app_logs (level);
CREATE INDEX app_logs_user_id_idx ON public.app_logs (user_id);

GRANT SELECT, INSERT ON public.app_logs TO authenticated;
GRANT ALL ON public.app_logs TO service_role;

ALTER TABLE public.app_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can insert own logs"
  ON public.app_logs FOR INSERT TO authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Admins can read all logs"
  ON public.app_logs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- app_events: lightweight product analytics
CREATE TABLE public.app_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  event text NOT NULL,
  properties jsonb,
  url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX app_events_created_at_idx ON public.app_events (created_at DESC);
CREATE INDEX app_events_event_idx ON public.app_events (event);

GRANT SELECT, INSERT ON public.app_events TO authenticated;
GRANT ALL ON public.app_events TO service_role;

ALTER TABLE public.app_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can insert own events"
  ON public.app_events FOR INSERT TO authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Admins can read all events"
  ON public.app_events FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
