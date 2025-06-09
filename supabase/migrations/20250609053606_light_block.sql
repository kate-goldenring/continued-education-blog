/*
  # Restore Blog Image Storage Setup

  This migration restores the complete blog image storage system that was accidentally removed.

  1. Storage Configuration
    - Create 'blog-images' storage bucket with 50MB file limit
    - Enable public access for reading images
    - Support for JPEG, PNG, WebP, GIF, HEIC, and HEIF formats

  2. Database Tables
    - Create blog_images table for image metadata tracking
    - Include photographer attribution and copyright fields
    - Support for alt text and captions for accessibility

  3. Security
    - Enable Row Level Security (RLS) on all tables
    - Public read access for images and metadata
    - Authenticated user permissions for image management

  4. Storage Policies
    - Public read access to blog images
    - Authenticated upload/update/delete permissions

  5. Default Values
    - Photographer defaults to "Kate Goldenring"
    - Copyright defaults to "© 2024 Continued Education Blog. All rights reserved."
*/

-- Create storage bucket for blog images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'blog-images',
  'blog-images',
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif']
) ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'];

-- Create a table to track image metadata and attribution
CREATE TABLE IF NOT EXISTS blog_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  original_name text NOT NULL,
  storage_path text NOT NULL,
  public_url text NOT NULL,
  file_size bigint NOT NULL,
  mime_type text NOT NULL,
  width integer,
  height integer,
  alt_text text,
  caption text,
  photographer text DEFAULT 'Kate Goldenring',
  copyright text DEFAULT '© 2024 Continued Education Blog. All rights reserved.',
  uploaded_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on blog_images table
ALTER TABLE blog_images ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Authenticated users can manage image metadata" ON blog_images;
DROP POLICY IF EXISTS "Public can read image metadata" ON blog_images;

-- Policy: Authenticated users can manage image metadata
CREATE POLICY "Authenticated users can manage image metadata"
ON blog_images
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy: Public can read image metadata
CREATE POLICY "Public can read image metadata"
ON blog_images
FOR SELECT
TO public
USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_blog_images_updated_at ON blog_images;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_blog_images_updated_at
  BEFORE UPDATE ON blog_images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Storage policies for blog-images bucket
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