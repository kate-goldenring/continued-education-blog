import { useState, useEffect, useCallback } from 'react';
import { BlogPost, BlogFormData } from '../types/BlogPost';
import { blogService } from '../services/blogService';
import { subscriptionService } from '../services/subscriptionService';

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
      
      // Send email notifications to subscribers
      try {
        console.log('Sending email notifications to subscribers...');
        const emailResult = await subscriptionService.notifySubscribersOfNewPost({
          id: newPost.id,
          title: newPost.title,
          excerpt: newPost.excerpt
        });
        
        if (emailResult.success) {
          console.log(`Email notifications sent to ${emailResult.sentCount} subscribers`);
        } else {
          console.warn('Some email notifications failed:', emailResult.errors);
        }
      } catch (emailError) {
        console.error('Failed to send email notifications:', emailError);
        // Don't throw here - post creation succeeded, email is secondary
      }
      
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
    if (post) {
      console.log('Getting blog post with ID:', id, 'found:', !!post);
      // Ensure imageMetadata is available for proper attribution
      if (post.imageMetadata) {
        console.log('Post has image metadata for attribution');
      }
    }
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