import { useState, useEffect, useCallback } from 'react';
import { BlogPost, BlogFormData } from '../types/BlogPost';
import { blogService } from '../services/blogService';

export function useBlogPosts() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load blog posts from Supabase on mount
  useEffect(() => {
    loadBlogPosts();
  }, []);

  const loadBlogPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading blog posts from Supabase...');
      
      const posts = await blogService.getAllPosts();
      console.log('Loaded blog posts from Supabase:', posts.length, 'posts');
      
      setBlogPosts(posts);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load blog posts';
      console.error('Error loading blog posts:', errorMessage);
      setError(errorMessage);
      setBlogPosts([]); // Clear posts on error
    } finally {
      setLoading(false);
    }
  }, []);

  const addBlogPost = useCallback(async (postData: BlogFormData): Promise<BlogPost> => {
    try {
      console.log('Creating new blog post:', postData.title);
      setError(null);
      
      const newPost = await blogService.createPost(postData);
      console.log('Created new post with ID:', newPost.id);
      
      // Update local state
      setBlogPosts(prev => [newPost, ...prev]);
      
      return newPost;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create blog post';
      console.error('Error creating blog post:', errorMessage);
      setError(errorMessage);
      throw err;
    }
  }, []);

  const updateBlogPost = useCallback(async (id: string, postData: BlogFormData): Promise<void> => {
    try {
      console.log('Updating blog post with ID:', id);
      setError(null);
      
      const updatedPost = await blogService.updatePost(id, postData);
      console.log('Updated blog post successfully');
      
      // Update local state
      setBlogPosts(prev => prev.map(post => 
        post.id === id ? updatedPost : post
      ));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update blog post';
      console.error('Error updating blog post:', errorMessage);
      setError(errorMessage);
      throw err;
    }
  }, []);

  const deleteBlogPost = useCallback(async (id: string): Promise<void> => {
    try {
      console.log('Deleting blog post with ID:', id);
      setError(null);
      
      await blogService.deletePost(id);
      console.log('Deleted blog post successfully');
      
      // Update local state
      setBlogPosts(prev => prev.filter(post => post.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete blog post';
      console.error('Error deleting blog post:', errorMessage);
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Memoize getBlogPost to prevent unnecessary re-renders
  const getBlogPost = useCallback((id: string): BlogPost | undefined => {
    const post = blogPosts.find(post => post.id === id);
    console.log('Getting blog post with ID:', id, 'found:', !!post);
    return post;
  }, [blogPosts]);

  const refreshPosts = useCallback(() => {
    loadBlogPosts();
  }, [loadBlogPosts]);

  return {
    blogPosts,
    loading,
    error,
    addBlogPost,
    updateBlogPost,
    deleteBlogPost,
    getBlogPost,
    refreshPosts
  };
}