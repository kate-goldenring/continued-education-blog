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
}

export type Category = 'all' | 'hiking' | 'travel' | 'food' | 'photography' | 'lifestyle';

export interface BlogFormData {
  title: string;
  category: string;
  imageUrl: string;
  images: string[];
  excerpt: string;
  content: string;
}