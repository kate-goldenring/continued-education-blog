import { supabase } from '../lib/supabase';

export interface ImageUploadResult {
  id: string;
  filename: string;
  publicUrl: string;
  width?: number;
  height?: number;
}

export interface ImageMetadata {
  id: string;
  filename: string;
  originalName: string;
  publicUrl: string;
  fileSize: number;
  mimeType: string;
  width?: number;
  height?: number;
  altText?: string;
  caption?: string;
  photographer: string;
  copyright: string;
  createdAt: string;
}

class ImageService {
  private readonly bucketName = 'blog-images';

  /**
   * Upload an image file to Supabase Storage
   */
  async uploadImage(file: File, folder?: string): Promise<ImageUploadResult> {
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = folder ? `${folder}/${fileName}` : fileName;

      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(this.bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        throw new Error('Failed to get public URL');
      }

      // Get image dimensions
      const dimensions = await this.getImageDimensions(file);

      // Save metadata to database
      const { data: metadataData, error: metadataError } = await supabase
        .from('blog_images')
        .insert({
          filename: fileName,
          original_name: file.name,
          storage_path: filePath,
          public_url: urlData.publicUrl,
          file_size: file.size,
          mime_type: file.type,
          width: dimensions.width,
          height: dimensions.height,
          photographer: 'Visual Stories Blog',
          copyright: '© 2024 Visual Stories Blog. All rights reserved.'
        })
        .select()
        .single();

      if (metadataError) {
        // If metadata save fails, clean up the uploaded file
        await this.deleteImage(filePath);
        throw new Error(`Metadata save failed: ${metadataError.message}`);
      }

      return {
        id: metadataData.id,
        filename: fileName,
        publicUrl: urlData.publicUrl,
        width: dimensions.width,
        height: dimensions.height
      };
    } catch (error) {
      console.error('Image upload error:', error);
      throw error instanceof Error ? error : new Error('Image upload failed');
    }
  }

  /**
   * Delete an image from storage and database
   */
  async deleteImage(pathOrId: string): Promise<void> {
    try {
      let storagePath: string;

      // If it looks like a UUID, treat it as an ID and get the path from database
      if (pathOrId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        const { data: imageData, error: fetchError } = await supabase
          .from('blog_images')
          .select('storage_path')
          .eq('id', pathOrId)
          .single();

        if (fetchError || !imageData) {
          throw new Error('Image not found');
        }

        storagePath = imageData.storage_path;

        // Delete from database
        const { error: deleteError } = await supabase
          .from('blog_images')
          .delete()
          .eq('id', pathOrId);

        if (deleteError) {
          throw new Error(`Database deletion failed: ${deleteError.message}`);
        }
      } else {
        // Treat as storage path
        storagePath = pathOrId;
      }

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(this.bucketName)
        .remove([storagePath]);

      if (storageError) {
        throw new Error(`Storage deletion failed: ${storageError.message}`);
      }
    } catch (error) {
      console.error('Image deletion error:', error);
      throw error instanceof Error ? error : new Error('Image deletion failed');
    }
  }

  /**
   * Get all uploaded images with metadata
   */
  async getImages(limit = 50, offset = 0): Promise<ImageMetadata[]> {
    try {
      const { data, error } = await supabase
        .from('blog_images')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new Error(`Failed to fetch images: ${error.message}`);
      }

      return data.map(item => ({
        id: item.id,
        filename: item.filename,
        originalName: item.original_name,
        publicUrl: item.public_url,
        fileSize: item.file_size,
        mimeType: item.mime_type,
        width: item.width,
        height: item.height,
        altText: item.alt_text,
        caption: item.caption,
        photographer: item.photographer,
        copyright: item.copyright,
        createdAt: item.created_at
      }));
    } catch (error) {
      console.error('Failed to fetch images:', error);
      throw error instanceof Error ? error : new Error('Failed to fetch images');
    }
  }

  /**
   * Update image metadata
   */
  async updateImageMetadata(id: string, metadata: Partial<Pick<ImageMetadata, 'altText' | 'caption' | 'photographer' | 'copyright'>>): Promise<void> {
    try {
      const updateData: any = {};
      if (metadata.altText !== undefined) updateData.alt_text = metadata.altText;
      if (metadata.caption !== undefined) updateData.caption = metadata.caption;
      if (metadata.photographer !== undefined) updateData.photographer = metadata.photographer;
      if (metadata.copyright !== undefined) updateData.copyright = metadata.copyright;

      const { error } = await supabase
        .from('blog_images')
        .update(updateData)
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to update metadata: ${error.message}`);
      }
    } catch (error) {
      console.error('Failed to update image metadata:', error);
      throw error instanceof Error ? error : new Error('Failed to update image metadata');
    }
  }

  /**
   * Get optimized image URL with transformations
   */
  getOptimizedImageUrl(publicUrl: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
  } = {}): string {
    // Supabase doesn't have built-in image transformations in the free tier
    // For now, return the original URL
    // In production, you might want to use a service like Cloudinary or ImageKit
    return publicUrl;
  }

  /**
   * Get image dimensions from file
   */
  private getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight
        });
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };

      img.src = url;
    });
  }

  /**
   * Validate image file
   */
  validateImageFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid file type. Please upload JPEG, PNG, WebP, or GIF images.'
      };
    }

    // Check file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File size too large. Please upload images smaller than 50MB.'
      };
    }

    return { valid: true };
  }
}

export const imageService = new ImageService();