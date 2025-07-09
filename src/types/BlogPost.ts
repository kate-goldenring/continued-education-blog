export interface BlogPost {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  images: string[];
  excerpt: string;
  content: string;
  date: string;
  readTime: string;
  imageMetadata?: any; // Store Flickr or other image metadata
}

export type Category = 'all' | 'hiking' | 'travel' | 'food' | 'mountaineering' | 'lifestyle';

export interface BlogFormData {
  title: string;
  category: string;
  imageUrl: string;
  images: string[];
  excerpt: string;
  content: string;
  imageMetadata?: any; // Store Flickr or other image metadata
}