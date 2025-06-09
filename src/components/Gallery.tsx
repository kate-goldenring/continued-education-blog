import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { useBlogPosts } from '../hooks/useBlogPosts';
import { Category } from '../types/BlogPost';
import FilterBar from './FilterBar';
import PhotoCard from './PhotoCard';

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const navigate = useNavigate();
  const { blogPosts } = useBlogPosts();

  const filteredPosts = activeCategory === 'all' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === activeCategory);

  const handlePostClick = (postId: string) => {
    navigate(`/post/${postId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <h1 className="text-4xl font-bold text-gray-900">Continued Education</h1>
              <button
                onClick={() => navigate('/admin')}
                className="ml-6 p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                title="Admin Panel"
              >
                <Settings className="w-6 h-6" />
              </button>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A collection of adventures, experiences, and moments captured through photography and words
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filter Bar */}
        <FilterBar 
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />

        {/* Photo Gallery */}
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6">
          {filteredPosts.map((post) => (
            <PhotoCard
              key={post.id}
              post={post}
              onClick={() => handlePostClick(post.id)}
            />
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-xl text-gray-500">No posts found in this category.</p>
          </div>
        )}
      </main>
    </div>
  );
}