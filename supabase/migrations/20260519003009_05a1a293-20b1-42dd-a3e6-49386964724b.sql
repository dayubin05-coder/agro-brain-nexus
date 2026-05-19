-- 1. Create a dedicated schema for extensions to resolve "Extension in Public"
CREATE SCHEMA IF NOT EXISTS extensions;

-- Move compatible extensions to the new schema
ALTER EXTENSION "uuid-ossp" SET SCHEMA extensions;
ALTER EXTENSION pgcrypto SET SCHEMA extensions;
ALTER EXTENSION pg_stat_statements SET SCHEMA extensions;

-- 2. Hardening Storage Policies
-- Refine the policy to prevent listing by checking for a non-empty folder name
DROP POLICY IF EXISTS "Public can view avatars by path" ON storage.objects;

CREATE POLICY "Public can view avatars with explicit path" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] IS NOT NULL);
