/*
  # Add HEIC Support to Blog Images

  1. Storage Configuration Update
    - Add HEIC and HEIF MIME types to allowed file types
    - Maintain existing 50MB file size limit
    - Keep all existing security policies

  2. Changes
    - Update blog-images bucket to accept image/heic and image/heif
    - No changes to database schema or security policies
*/

-- Update the storage bucket to allow HEIC/HEIF files
UPDATE storage.buckets 
SET allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif']
WHERE id = 'blog-images';