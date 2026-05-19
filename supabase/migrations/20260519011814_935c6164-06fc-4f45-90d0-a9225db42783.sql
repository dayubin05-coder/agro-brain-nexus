-- Revoke default execution privileges from public for SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_tables_rls_status() FROM PUBLIC, anon, authenticated;

-- Grant execution to service_role (and postgres already has it)
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.update_updated_at() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_tables_rls_status() TO service_role;

-- Ensure get_tables_rls_status can be called by authenticated users if needed for the dashboard, 
-- but it's safer to keep it restricted or use a specific policy.
-- Given the dashboard context, we'll allow authenticated users to run the audit function specifically.
GRANT EXECUTE ON FUNCTION public.get_tables_rls_status() TO authenticated;
