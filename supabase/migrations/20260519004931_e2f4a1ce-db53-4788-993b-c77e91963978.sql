CREATE OR REPLACE FUNCTION public.get_tables_rls_status()
RETURNS TABLE (
    table_name TEXT,
    rls_enabled BOOLEAN,
    policy_count INT,
    evaluation TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
    RETURN QUERY
    WITH table_list AS (
        SELECT 
            n.nspname AS schema_name,
            c.relname AS t_name,
            c.relrowsecurity AS r_enabled
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' 
          AND c.relkind = 'r'
          AND c.relname NOT IN ('spatial_ref_sys')
    ),
    policy_counts AS (
        SELECT 
            schemaname, 
            tablename, 
            count(*)::INT AS p_count
        FROM pg_policies
        GROUP BY schemaname, tablename
    )
    SELECT 
        t.t_name::TEXT,
        t.r_enabled,
        COALESCE(p.p_count, 0),
        CASE 
            WHEN t.r_enabled AND COALESCE(p.p_count, 0) > 0 THEN 'Conforme'
            WHEN t.r_enabled AND COALESCE(p.p_count, 0) = 0 THEN 'Parcial'
            ELSE 'Vulnerável'
        END::TEXT
    FROM table_list t
    LEFT JOIN policy_counts p ON t.schema_name = p.schemaname AND t.t_name = p.tablename
    ORDER BY t.t_name;
END;
$$;

-- Revoke public execution and grant to authenticated users
REVOKE EXECUTE ON FUNCTION public.get_tables_rls_status() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_tables_rls_status() TO authenticated;
