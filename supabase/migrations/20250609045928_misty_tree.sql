/*
  # Simple Blog Setup Migration

  This migration sets up the blog without trying to modify storage.objects permissions.
  Storage policies will be handled through the Supabase dashboard.

  1. Storage Bucket
    - Create 'blog-images' storage bucket with 50MB file limit
    - Enable public access for reading images

  2. Database Tables
    - Create blog_images table for image metadata tracking
    - Include photographer attribution and copyright fields
    - Support for alt text and captions for accessibility

  3. Security
    - Enable Row Level Security (RLS) on blog_images table
    - Public read access for image metadata
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