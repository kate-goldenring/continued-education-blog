/*
  # Fix Storage Policies for Blog Images

  This migration ensures proper storage policies are in place for the blog-images bucket.
  It addresses RLS policy violations during image uploads.

  1. Storage Policies
    - Ensure proper policies exist for blog-images bucket
    - Fix any permission issues with authenticated uploads
    - Enable public read access

  2. Troubleshooting
    - Drop and recreate policies to ensure they're correct
    - Add debugging information
*/

-- First, let's make sure the bucket exists and is properly configured
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'blog-images',
  'blog-images',
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Drop all existing policies for blog-images to start fresh
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname LIKE '%blog%'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON storage.objects';
    END LOOP;
END $$;

-- Create comprehensive storage policies
-- Policy 1: Allow public read access to blog images
CREATE POLICY "blog_images_public_read"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'blog-images');

-- Policy 2: Allow authenticated users to upload blog images
CREATE POLICY "blog_images_authenticated_upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'blog-images');

-- Policy 3: Allow authenticated users to update blog images
CREATE POLICY "blog_images_authenticated_update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'blog-images')
WITH CHECK (bucket_id = 'blog-images');

-- Policy 4: Allow authenticated users to delete blog images
CREATE POLICY "blog_images_authenticated_delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'blog-images');

-- Also create a more permissive policy for authenticated users to manage all operations
CREATE POLICY "blog_images_authenticated_all"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'blog-images')
WITH CHECK (bucket_id = 'blog-images');