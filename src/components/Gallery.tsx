import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, AlertCircle, RefreshCw, Database } from 'lucide-react';
import { useBlogPosts } from '../hooks/useBlogPosts';
import { Category } from '../types/BlogPost';
import FilterBar from './FilterBar';
import PhotoCard from './PhotoCard';

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const navigate = useNavigate();
  const { blogPosts, loading, error, refreshPosts } = useBlogPosts();

  const filteredPosts = activeCategory === 'all' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === activeCategory);

  const handlePostClick = (postId: string) => {
    navigate(`/post/${postId}`);
  };

  const isSupabaseError = error?.includes('relation "public.blog_posts" does not exist');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <h1 className="text-4xl font-bold text-gray-900">Continued Education</h1>
              <div className="ml-6 flex items-center space-x-2">
                <button
                  onClick={refreshPosts}
                  disabled={loading}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                  title="Refresh posts"
                >
                  <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={() => navigate('/admin')}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                  title="Admin Panel"
                >
                  <Settings className="w-6 h-6" />
                </button>
              </div>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A collection of adventures, experiences, and moments captured through photography and words
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Supabase Setup Error */}
        {isSupabaseError && (
          <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <Database className="w-6 h-6 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Database Setup Required</h3>
                <p className="text-blue-800 mb-4">
                  The blog database table hasn't been created yet. This is normal for a new Supabase project.
                </p>
                
                <div className="bg-white rounded-lg p-4 border border-blue-200 mb-4">
                  <h4 className="font-semibold text-blue-900 mb-2">To fix this issue:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-blue-800 text-sm">
                    <li>Go to your <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">Supabase Dashboard</a></li>
                    <li>Select your project</li>
                    <li>Go to <strong>SQL Editor</strong> in the left sidebar</li>
                    <li>Click <strong>"New query"</strong></li>
                    <li>Copy and paste the migration SQL from your project files</li>
                    <li>Run the query to create the database tables</li>
                  </ol>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <p className="text-yellow-800 text-sm">
                    <strong>Migration files location:</strong> <code className="bg-yellow-100 px-1 rounded">supabase/migrations/</code>
                  </p>
                  <p className="text-yellow-800 text-sm mt-1">
                    Run the files in chronological order (by timestamp in filename).
                  </p>
                </div>

                <button
                  onClick={refreshPosts}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors duration-200"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Check Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* General Error Message */}
        {error && !isSupabaseError && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-red-700 text-sm font-medium">{error}</p>
              <p className="text-red-600 text-xs mt-1">
                Check your internet connection and Supabase configuration.
              </p>
              <button
                onClick={refreshPosts}
                className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
            <span className="text-gray-600">Loading blog posts...</span>
          </div>
        )}

        {/* Filter Bar */}
        {!loading && !isSupabaseError && (
          <FilterBar 
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        )}

        {/* Photo Gallery */}
        {!loading && !isSupabaseError && (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6">
            {filteredPosts.map((post) => (
              <PhotoCard
                key={post.id}
                post={post}
                onClick={() => handlePostClick(post.id)}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredPosts.length === 0 && !error && (
          <div className="text-center py-16">
            <p className="text-xl text-gray-500">No posts found in this category.</p>
          </div>
        )}
      </main>
    </div>
  );
}