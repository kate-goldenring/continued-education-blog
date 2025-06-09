import { supabase } from '../lib/supabase';
import { BlogPost, BlogFormData } from '../types/BlogPost';

export interface DatabaseBlogPost {
  id: string;
  title: string;
  category: string;
  image_url: string;
  images: string[];
  excerpt: string;
  content: string;
  read_time: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

class BlogService {
  /**
   * Convert database format to app format
   */
  private mapDatabaseToApp(dbPost: DatabaseBlogPost): BlogPost {
    return {
      id: dbPost.id,
      title: dbPost.title,
      category: dbPost.category,
      imageUrl: dbPost.image_url,
      images: dbPost.images || [],
      excerpt: dbPost.excerpt,
      content: dbPost.content,
      readTime: dbPost.read_time,
      date: new Date(dbPost.created_at).toISOString().split('T')[0]
    };
  }

  /**
   * Convert app format to database format
   */
  private mapAppToDatabase(appPost: BlogFormData): Omit<DatabaseBlogPost, 'id' | 'read_time' | 'created_at' | 'updated_at'> {
    return {
      title: appPost.title,
      category: appPost.category,
      image_url: appPost.imageUrl,
      images: appPost.images || [],
      excerpt: appPost.excerpt,
      content: appPost.content
    };
  }

  /**
   * Get all blog posts
   */
  async getAllPosts(): Promise<BlogPost[]> {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch blog posts: ${error.message}`);
      }

      return data.map(this.mapDatabaseToApp);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      throw error instanceof Error ? error : new Error('Failed to fetch blog posts');
    }
  }

  /**
   * Get a single blog post by ID
   */
  async getPost(id: string): Promise<BlogPost | null> {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Post not found
        }
        throw new Error(`Failed to fetch blog post: ${error.message}`);
      }

      return this.mapDatabaseToApp(data);
    } catch (error) {
      console.error('Error fetching blog post:', error);
      throw error instanceof Error ? error : new Error('Failed to fetch blog post');
    }
  }

  /**
   * Create a new blog post
   */
  async createPost(postData: BlogFormData): Promise<BlogPost> {
    try {
      const dbData = this.mapAppToDatabase(postData);

      const { data, error } = await supabase
        .from('blog_posts')
        .insert(dbData)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create blog post: ${error.message}`);
      }

      return this.mapDatabaseToApp(data);
    } catch (error) {
      console.error('Error creating blog post:', error);
      throw error instanceof Error ? error : new Error('Failed to create blog post');
    }
  }

  /**
   * Update an existing blog post
   */
  async updatePost(id: string, postData: BlogFormData): Promise<BlogPost> {
    try {
      const dbData = this.mapAppToDatabase(postData);

      const { data, error } = await supabase
        .from('blog_posts')
        .update(dbData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update blog post: ${error.message}`);
      }

      return this.mapDatabaseToApp(data);
    } catch (error) {
      console.error('Error updating blog post:', error);
      throw error instanceof Error ? error : new Error('Failed to update blog post');
    }
  }

  /**
   * Delete a blog post
   */
  async deletePost(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete blog post: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting blog post:', error);
      throw error instanceof Error ? error : new Error('Failed to delete blog post');
    }
  }

  /**
   * Get posts by category
   */
  async getPostsByCategory(category: string): Promise<BlogPost[]> {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch blog posts by category: ${error.message}`);
      }

      return data.map(this.mapDatabaseToApp);
    } catch (error) {
      console.error('Error fetching blog posts by category:', error);
      throw error instanceof Error ? error : new Error('Failed to fetch blog posts by category');
    }
  }

  /**
   * Search posts by title or content
   */
  async searchPosts(query: string): Promise<BlogPost[]> {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .or(`title.ilike.%${query}%,content.ilike.%${query}%,excerpt.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to search blog posts: ${error.message}`);
      }

      return data.map(this.mapDatabaseToApp);
    } catch (error) {
      console.error('Error searching blog posts:', error);
      throw error instanceof Error ? error : new Error('Failed to search blog posts');
    }
  }
}

export const blogService = new BlogService();