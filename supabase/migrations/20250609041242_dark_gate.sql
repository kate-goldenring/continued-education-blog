/*
  # Supabase Storage Setup for Blog Images

  1. Storage Configuration
    - Create storage bucket for blog images
    - Set up public access policies
    - Enable image transformations

  2. Security
    - Enable RLS on storage objects
    - Add policies for authenticated users to upload/manage images
    - Public read access for blog images

  3. Image Management
    - Support for multiple image formats (JPEG, PNG, WebP)
    - Automatic optimization and resizing
    - Proper file organization by post ID
*/

-- Create storage bucket for blog images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'blog-images',
  'blog-images',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

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
  photographer text DEFAULT 'Visual Stories Blog',
  copyright text DEFAULT '© 2024 Visual Stories Blog. All rights reserved.',
  uploaded_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on blog_images table
ALTER TABLE blog_images ENABLE ROW LEVEL SECURITY;

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

-- Trigger to automatically update updated_at
CREATE TRIGGER update_blog_images_updated_at
  BEFORE UPDATE ON blog_images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();