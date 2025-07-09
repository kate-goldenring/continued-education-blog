/*
  # Add Image Metadata Support to Blog Posts

  1. Schema Changes
    - Add `image_metadata` column to `blog_posts` table
    - JSONB type for flexible metadata storage (Flickr data, photographer info, etc.)
    - Default to empty object for existing posts

  2. Use Cases
    - Store Flickr photographer attribution and metadata
    - Store custom image metadata for any image source
    - Maintain backward compatibility with existing posts

  3. Data Structure
    The image_metadata column will store data like:
    ```json
    {
      "https://image-url.jpg": {
        "type": "flickr",
        "photographer": "John Doe",
        "photoId": "12345",
        "userId": "user123",
        "title": "Beautiful Sunset",
        "flickrPageUrl": "https://flickr.com/photos/...",
        "width": 1920,
        "height": 1080
      }
    }
    ```

  4. Backward Compatibility
    - Existing posts will have empty metadata object
    - New posts can store rich metadata for proper attribution
    - Supabase-uploaded images continue to use existing metadata system
*/

-- Add image_metadata column to blog_posts table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'blog_posts' AND column_name = 'image_metadata'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN image_metadata jsonb DEFAULT '{}';
  END IF;
END $$;

-- Create index on image_metadata for better query performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_image_metadata 
ON blog_posts USING gin (image_metadata);

-- Add comment to document the column purpose
COMMENT ON COLUMN blog_posts.image_metadata IS 'Stores metadata for images including Flickr attribution, photographer info, and other image-specific data';