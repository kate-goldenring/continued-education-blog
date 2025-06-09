/*
  # Complete Blog Setup Migration

  This migration sets up everything needed for the Continued Education blog:

  1. Storage Configuration
    - Create 'blog-images' storage bucket with 50MB file limit
    - Enable public access for reading images
    - Set up authenticated user permissions for upload/delete

  2. Database Tables
    - Create blog_images table for image metadata tracking
    - Include photographer attribution and copyright fields
    - Support for alt text and captions for accessibility

  3. Security
    - Enable Row Level Security (RLS) on all tables
    - Public read access for images and metadata
    - Authenticated user permissions for image management

  4. Default Values
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
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Enable RLS on storage objects (if not already enabled)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects'
  ) THEN
    ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Authenticated users can upload blog images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update blog images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete blog images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access to blog images" ON storage.objects;

-- Policy: Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload blog images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'blog-images');

-- Policy: Allow authenticated users to update their uploaded images
CREATE POLICY "Authenticated users can update blog images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'blog-images');

-- Policy: Allow authenticated users to delete their uploaded images
CREATE POLICY "Authenticated users can delete blog images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'blog-images');

-- Policy: Allow public read access to blog images
CREATE POLICY "Public read access to blog images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'blog-images');

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

-- Update any existing records that might have old default values
UPDATE blog_images 
SET photographer = 'Kate Goldenring' 
WHERE photographer = 'Visual Stories Blog' OR photographer = 'Continued Education';

UPDATE blog_images 
SET copyright = '© 2024 Continued Education Blog. All rights reserved.' 
WHERE copyright LIKE '%Visual Stories Blog%';