import { useState, useEffect } from 'react';
import { BlogPost } from '../types/BlogPost';
import { blogPosts as initialBlogPosts } from '../data/blogPosts';

export function useBlogPosts() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(() => {
    const saved = localStorage.getItem('blogPosts');
    return saved ? JSON.parse(saved) : initialBlogPosts;
  });

  useEffect(() => {
    localStorage.setItem('blogPosts', JSON.stringify(blogPosts));
  }, [blogPosts]);

  const addBlogPost = (postData: Omit<BlogPost, 'id' | 'date' | 'readTime'>) => {
    const newPost: BlogPost = {
      ...postData,
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      readTime: calculateReadTime(postData.content),
      images: postData.images || []
    };
    setBlogPosts(prev => [newPost, ...prev]);
    return newPost;
  };

  const updateBlogPost = (id: string, postData: Omit<BlogPost, 'id' | 'date' | 'readTime'>) => {
    setBlogPosts(prev => prev.map(post => 
      post.id === id 
        ? { 
            ...postData, 
            id, 
            date: post.date, 
            readTime: calculateReadTime(postData.content),
            images: postData.images || []
          }
        : post
    ));
  };

  const deleteBlogPost = (id: string) => {
    setBlogPosts(prev => prev.filter(post => post.id !== id));
  };

  const getBlogPost = (id: string) => {
    return blogPosts.find(post => post.id === id);
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