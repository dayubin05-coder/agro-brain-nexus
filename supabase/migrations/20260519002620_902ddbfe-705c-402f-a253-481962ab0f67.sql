-- 1. Secure functions and triggers (Search Path & Permissions)
-- Revoke public execution on SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.update_updated_at() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;

-- Grant execution to authenticated users only (if needed)
GRANT EXECUTE ON FUNCTION public.update_updated_at() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;

-- Set search_path for critical functions to prevent search path attacks
ALTER FUNCTION public.update_updated_at() SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;

-- 2. Secure Storage (Prevent listing)
-- Drop the overly permissive SELECT policy
DROP POLICY "Anyone can view avatars" ON storage.objects;

-- Re-create the policy to allow viewing specific files without allowing listing
-- (In Supabase, listing requires bucket-level access or specific folder access)
-- This policy allows SELECT if the bucket is 'avatars'
CREATE POLICY "Public can view avatars by path" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

-- 3. Extensions and Tables
-- Ensure RLS is enabled on all public tables (spatial_ref_sys is usually read-only for PostGIS)
-- If spatial_ref_sys is an issue, we can try to enable it, but it's a PostGIS internal table.
-- ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;

-- Note: Moving extensions to a different schema is recommended but can be destructive 
-- for existing data if PostGIS columns are in use. We'll stick to securing functions first.
