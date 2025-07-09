/**
 * Utility functions for handling Flickr image embeds
 */

export interface FlickrImageData {
  photoId: string;
  userId: string;
  photographer: string; // User-provided photographer name
  albumId?: string;
  title: string;
  imageUrl: string;
  width: number;
  height: number;
  alt: string;
  embedUrl: string;
  flickrPageUrl: string;
}

/**
 * Parse Flickr embed HTML to extract image data
 */
export function parseFlickrEmbed(embedHtml: string): FlickrImageData | null {
  try {
    // Create a temporary DOM element to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = embedHtml;
    
    const link = tempDiv.querySelector('a[data-flickr-embed="true"]');
    const img = tempDiv.querySelector('img');
    
    if (!link || !img) {
      return null;
    }
    
    const href = link.getAttribute('href') || '';
    const src = img.getAttribute('src') || '';
    const title = link.getAttribute('title') || img.getAttribute('alt') || '';
    const alt = img.getAttribute('alt') || title;
    const width = parseInt(img.getAttribute('width') || '0');
    const height = parseInt(img.getAttribute('height') || '0');
    
    // Extract photo ID and user ID from Flickr URL
    const photoMatch = href.match(/\/photos\/([^\/]+)\/(\d+)/);
    const albumMatch = href.match(/\/album-(\d+)/);
    
    if (!photoMatch) {
      return null;
    }
    
    const userId = photoMatch[1];
    
    return {
      photoId: photoMatch[2],
      userId,
      photographer: '', // Will be set by user input
      albumId: albumMatch ? albumMatch[1] : undefined,
      title,
      imageUrl: src,
      width,
      height,
      alt,
      embedUrl: href,
      flickrPageUrl: href
    };
  } catch (error) {
    console.error('Error parsing Flickr embed:', error);
    return null;
  }
}

/**
 * Get Flickr user profile URL
 */
export function getFlickrUserUrl(data: FlickrImageData): string {
  return `https://www.flickr.com/photos/${data.userId}/`;
}

/**
 * Check if a URL is a Flickr image URL
 */
export function isFlickrImageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes('flickr.com') || urlObj.hostname.includes('staticflickr.com');
  } catch {
    return false;
  }
}

/**
 * Generate Flickr embed HTML from image data
 */
export function generateFlickrEmbed(data: FlickrImageData): string {
  return `<a data-flickr-embed="true" href="${data.embedUrl}" title="${data.title}"><img src="${data.imageUrl}" width="${data.width}" height="${data.height}" alt="${data.alt}"/></a><script async src="//embedr.flickr.com/assets/client-code.js" charset="utf-8"></script>`;
}

/**
 * Extract just the image URL from Flickr embed HTML
 */
export function extractFlickrImageUrl(embedHtml: string): string | null {
  const data = parseFlickrEmbed(embedHtml);
  return data ? data.imageUrl : null;
}

/**
 * Get different sizes of Flickr images
 */
export function getFlickrImageSizes(baseUrl: string) {
  // Flickr URL format: https://live.staticflickr.com/server/id_secret_size.jpg
  const urlParts = baseUrl.split('_');
  if (urlParts.length < 2) return { original: baseUrl };
  
  const baseWithoutSize = urlParts.slice(0, -1).join('_');
  const extension = urlParts[urlParts.length - 1].split('.')[1];
  
  return {
    thumbnail: `${baseWithoutSize}_t.${extension}`, // 100px on longest side
    small: `${baseWithoutSize}_m.${extension}`,     // 240px on longest side
    medium: `${baseWithoutSize}_z.${extension}`,    // 640px on longest side
    large: `${baseWithoutSize}_b.${extension}`,     // 1024px on longest side
    original: `${baseWithoutSize}_6k.${extension}`, // 6K size
    huge: `${baseWithoutSize}_h.${extension}`       // 1600px on longest side
  };
}