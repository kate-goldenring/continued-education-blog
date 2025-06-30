import { useState, useEffect } from 'react';
import { imageService, ImageMetadata } from '../services/imageService';

/**
 * Check if an image URL is from Supabase Storage
 */
function isSupabaseStorageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes('supabase.co') && urlObj.pathname.includes('/storage/');
  } catch {
    return false;
  }
}

/**
 * Hook to fetch image metadata for a single image URL
 */
export function useImageMetadata(imageUrl: string | null) {
  const [metadata, setMetadata] = useState<ImageMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!imageUrl) {
      setMetadata(null);
      setLoading(false);
      setError(null);
      return;
    }

    // Skip fetching metadata for non-Supabase Storage URLs
    if (!isSupabaseStorageUrl(imageUrl)) {
      setMetadata(null);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchMetadata = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await imageService.getImageMetadataByUrl(imageUrl);
        setMetadata(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch image metadata');
        setMetadata(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMetadata();
  }, [imageUrl]);

  return { metadata, loading, error };
}

/**
 * Hook to fetch image metadata for multiple image URLs
 */
export function useImageMetadataMap(imageUrls: string[]) {
  const [metadataMap, setMetadataMap] = useState<Map<string, ImageMetadata>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (imageUrls.length === 0) {
      setMetadataMap(new Map());
      setLoading(false);
      setError(null);
      return;
    }

    // Filter to only include Supabase Storage URLs
    const supabaseUrls = imageUrls.filter(isSupabaseStorageUrl);

    if (supabaseUrls.length === 0) {
      setMetadataMap(new Map());
      setLoading(false);
      setError(null);
      return;
    }

    const fetchMetadata = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await imageService.getImageMetadataByUrls(supabaseUrls);
        setMetadataMap(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch image metadata');
        setMetadataMap(new Map());
      } finally {
        setLoading(false);
      }
    };

    fetchMetadata();
  }, [imageUrls.join(',')]); // Join URLs to create a stable dependency

  return { metadataMap, loading, error };
}