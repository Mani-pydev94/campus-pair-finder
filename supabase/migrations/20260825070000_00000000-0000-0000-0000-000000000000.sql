-- Create the avatars storage bucket if it does not exist and mark it public.
-- The app uploads files via supabase.storage.from('avatars').upload(...) and
-- renders them with getPublicUrl(...), so the bucket must be public for <img>
-- to load the bytes unauthenticated. Existing RLS policies on storage.objects
-- are intentionally left untouched.
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;
