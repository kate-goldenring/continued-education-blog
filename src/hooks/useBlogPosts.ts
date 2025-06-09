import { useState, useEffect } from 'react';
import { BlogPost } from '../types/BlogPost';
import { blogPosts as initialBlogPosts } from '../data/blogPosts';

export function useBlogPosts() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(() => {
    try {
      const saved = localStorage.getItem('blogPosts');
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log('Loaded blog posts from localStorage:', parsed.length, 'posts');
        return parsed;
      }
    } catch (error) {
      console.error('Error loading blog posts from localStorage:', error);
    }
    console.log('Using initial blog posts:', initialBlogPosts.length, 'posts');
    return initialBlogPosts;
  });

  useEffect(() => {
    try {
      console.log('Saving blog posts to localStorage:', blogPosts.length, 'posts');
      localStorage.setItem('blogPosts', JSON.stringify(blogPosts));
    } catch (error) {
      console.error('Error saving blog posts to localStorage:', error);
    }
  }, [blogPosts]);

  const addBlogPost = (postData: Omit<BlogPost, 'id' | 'date' | 'readTime'>) => {
    console.log('Adding new blog post:', postData.title);
    
    const newPost: BlogPost = {
      ...postData,
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      readTime: calculateReadTime(postData.content),
      images: postData.images || []
    };
    
    console.log('Created new post with ID:', newPost.id);
    
    setBlogPosts(prev => {
      const updated = [newPost, ...prev];
      console.log('Updated blog posts array, new length:', updated.length);
      return updated;
    });
    
    return newPost;
  };

  const updateBlogPost = (id: string, postData: Omit<BlogPost, 'id' | 'date' | 'readTime'>) => {
    console.log('Updating blog post with ID:', id);
    
    setBlogPosts(prev => {
      const updated = prev.map(post => 
        post.id === id 
          ? { 
              ...postData, 
              id, 
              date: post.date, 
              readTime: calculateReadTime(postData.content),
              images: postData.images || []
            }
          : post
      );
      console.log('Updated blog posts array after edit, length:', updated.length);
      return updated;
    });
  };

  const deleteBlogPost = (id: string) => {
    console.log('Deleting blog post with ID:', id);
    setBlogPosts(prev => {
      const updated = prev.filter(post => post.id !== id);
      console.log('Updated blog posts array after delete, length:', updated.length);
      return updated;
    });
  };

  const getBlogPost = (id: string) => {
    const post = blogPosts.find(post => post.id === id);
    console.log('Getting blog post with ID:', id, 'found:', !!post);
    return post;
  };

  return {
    blogPosts,
    addBlogPost,
    updateBlogPost,
    deleteBlogPost,
    getBlogPost
  };
}

function calculateReadTime(content: string): string {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}