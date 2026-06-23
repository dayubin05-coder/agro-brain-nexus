
-- Lock down SECURITY DEFINER functions that should only run from triggers/internal code
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.assign_default_role() FROM PUBLIC, anon, authenticated;

-- has_role is used inside RLS policies; keep authenticated EXECUTE but drop anon/public
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;

-- Restrict PostGIS spatial_ref_sys from being publicly readable via PostgREST
REVOKE SELECT ON TABLE public.spatial_ref_sys FROM anon, authenticated;
