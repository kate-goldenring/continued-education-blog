/*
  # Create Blog Images Storage Bucket

  1. Storage Bucket Setup
    - Create blog-images bucket with 50MB limit
    - Enable public access for reading
    - Set allowed MIME types for images

  2. Security Policies
    - Public read access for all images
    - Authenticated upload/update/delete permissions
    - Row Level Security enabled

  3. Image Metadata Table
    - Track image metadata and attribution
    - Support for photographer credits and copyright
    - Automatic timestamps
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
  photographer text DEFAULT 'Kate Goldenring',
  copyright text DEFAULT '© 2024 Continued Education Blog. All rights reserved.',
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