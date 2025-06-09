/*
  # Update Storage Size Limit for High-Quality Images

  1. Storage Configuration Update
    - Increase file size limit from 10MB to 50MB for high-quality images
    - Maintain existing security policies and bucket configuration

  2. Changes
    - Update blog-images bucket file_size_limit to 52428800 bytes (50MB)
    - No changes to security policies or allowed file types
*/

-- Update the storage bucket to allow 50MB files
UPDATE storage.buckets 
SET file_size_limit = 52428800  -- 50MB in bytes
WHERE id = 'blog-images';