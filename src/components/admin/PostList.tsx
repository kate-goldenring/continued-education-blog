import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Eye, Plus } from 'lucide-react';
import { useBlogPosts } from '../../hooks/useBlogPosts';
import { Category } from '../../types/BlogPost';

export default function PostList() {
  const { blogPosts, deleteBlogPost } = useBlogPosts();
  const [filter, setFilter] = useState<Category>('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const filteredPosts = filter === 'all' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === filter);

  const handleDelete = (id: string) => {
    deleteBlogPost(id);
    setShowDeleteConfirm(null);
  };

  const categories: { key: Category; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'hiking', label: 'Hiking' },
    { key: 'travel', label: 'Travel' },
    { key: 'food', label: 'Food' },
    { key: 'photography', label: 'Photography' },
    { key: 'lifestyle', label: 'Lifestyle' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Blog Posts</h2>
          <Link
            to="/admin/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Link>
        </div>
        
        {/* Filter Bar */}
        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1 text-sm font-medium rounded-full transition-colors duration-200 ${
                filter === key
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Posts List */}
      <div className="divide-y divide-gray-200">
        {filteredPosts.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500">No posts found.</p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <div key={post.id} className="px-6 py-4 hover:bg-gray-50 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{post.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{post.excerpt}</p>
                    <div className="flex items-center mt-2 text-xs text-gray-400">
                      <span className="px-2 py-1 bg-gray-100 rounded-full mr-2">
                        {post.category}
                      </span>
                      <span>{post.date}</span>
                      <span className="mx-2">•</span>
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Link
                    to={`/post/${post.id}`}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                    title="View Post"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <Link
                    to={`/admin/edit/${post.id}`}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                    title="Edit Post"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => setShowDeleteConfirm(post.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200"
                    title="Delete Post"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Post</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this post? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}