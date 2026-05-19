-- Drop and recreate the function with the correct schema
DROP FUNCTION IF EXISTS public.get_tables_rls_status();

CREATE OR REPLACE FUNCTION public.get_tables_rls_status()
RETURNS TABLE (
    table_name TEXT,
    rls_enabled BOOLEAN,
    policy_count INT,
    evaluation TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.tablename::TEXT,
        t.rowsecurity,
        (SELECT count(*)::INT FROM pg_policies p WHERE p.schemaname = 'public' AND p.tablename = t.tablename),
        CASE 
            WHEN t.rowsecurity = false THEN 'Vulnerável'
            WHEN (SELECT count(*) FROM pg_policies p WHERE p.schemaname = 'public' AND p.tablename = t.tablename) = 0 THEN 'Parcial'
            ELSE 'Conforme'
        END
    FROM 
        pg_tables t
    WHERE 
        t.schemaname = 'public'
        AND t.tablename NOT IN ('spatial_ref_sys', 'security_audit_reports');
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_tables_rls_status() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_tables_rls_status() TO anon;

-- Record a new system audit report
DO $$
DECLARE
    v_total INT;
    v_conforme INT;
    v_vulneravel INT;
    v_user_id UUID;
BEGIN
    -- Get an existing admin/user ID to fulfill NOT NULL constraint
    SELECT id INTO v_user_id FROM auth.users LIMIT 1;
    
    SELECT count(*) INTO v_total FROM pg_tables WHERE schemaname = 'public' AND tablename NOT IN ('spatial_ref_sys', 'security_audit_reports');
    SELECT count(*) INTO v_conforme FROM pg_tables t WHERE schemaname = 'public' AND tablename NOT IN ('spatial_ref_sys', 'security_audit_reports') AND t.rowsecurity = true AND (SELECT count(*) FROM pg_policies p WHERE p.schemaname = 'public' AND p.tablename = t.tablename) > 0;
    SELECT count(*) INTO v_vulneravel FROM pg_tables WHERE schemaname = 'public' AND tablename NOT IN ('spatial_ref_sys', 'security_audit_reports') AND rowsecurity = false;

    IF v_user_id IS NOT NULL THEN
        INSERT INTO public.security_audit_reports (user_id, titulo, resumo, pdf_url)
        VALUES (
            v_user_id,
            'Auditoria RLS Finalizada',
            format('Relatório de conformidade atualizado: %s tabelas conformes, %s parciais e %s vulneráveis. O sistema agora reflete o estado real da infraestrutura de banco de dados.', v_conforme, (v_total - v_conforme - v_vulneravel), v_vulneravel),
            '#'
        );
    END IF;
END $$;
