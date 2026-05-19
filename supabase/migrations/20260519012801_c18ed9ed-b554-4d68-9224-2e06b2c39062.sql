-- 1. Fix search_path and permissions for SECURITY DEFINER functions
-- get_tables_rls_status
ALTER FUNCTION public.get_tables_rls_status() SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.get_tables_rls_status() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_tables_rls_status() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_tables_rls_status() TO service_role;

-- handle_new_user (already has search_path, but ensure permissions)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- update_updated_at (already has search_path, but ensure permissions)
REVOKE EXECUTE ON FUNCTION public.update_updated_at() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_updated_at() TO service_role;

-- 2. Enable RLS on all public tables that might have missed it
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND rowsecurity = false
        AND tablename NOT IN ('spatial_ref_sys') -- PostGIS system table
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', r.tablename);
    END LOOP;
END $$;

-- 3. Fix PostGIS functions if they are causing linter issues (optional but good practice)
-- Usually these are managed by the extension, but we can set search_path if needed
-- However, it's safer to focus on custom project functions first.
