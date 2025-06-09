import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X, Upload, Eye, Plus, Trash2 } from 'lucide-react';
import { useBlogPosts } from '../../hooks/useBlogPosts';
import { BlogFormData } from '../../types/BlogPost';

export default function PostForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addBlogPost, updateBlogPost, getBlogPost } = useBlogPosts();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    category: 'lifestyle',
    imageUrl: '',
    images: [],
    excerpt: '',
    content: ''
  });

  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isEditing && id) {
      const post = getBlogPost(id);
      if (post) {
        setFormData({
          title: post.title,
          category: post.category,
          imageUrl: post.imageUrl,
          images: post.images || [],
          excerpt: post.excerpt,
          content: post.content
        });
      }
    }
  }, [id, isEditing, getBlogPost]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (isEditing && id) {
        updateBlogPost(id, formData);
      } else {
        addBlogPost(formData);
      }
      navigate('/admin');
    } catch (error) {
      console.error('Error saving post:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addImage = () => {
    if (formData.images.length < 10) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, '']
      }));
    }
  };

  const updateImage = (index: number, url: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => i === index ? url : img)
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const renderPreview = () => {
    const lines = formData.content.split('\n');
    return lines.map((line, index) => {
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-3xl font-bold text-gray-900 mb-4 mt-6">{line.slice(2)}</h1>;
      } else if (line.startsWith('## ')) {
        return <h2 key={index} className="text-xl font-semibold text-gray-800 mb-3 mt-6">{line.slice(3)}</h2>;
      } else if (line.trim() === '') {
        return <div key={index} className="mb-3"></div>;
      } else {
        return <p key={index} className="text-gray-700 leading-relaxed mb-3">{line}</p>;
      }
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Edit Post' : 'New Post'}
          </h2>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
            >
              <Eye className="w-4 h-4 mr-2" />
              {showPreview ? 'Edit' : 'Preview'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {showPreview ? (
          /* Preview Mode */
          <div className="max-w-4xl">
            <div className="mb-8">
              <img
                src={formData.imageUrl || 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=800'}
                alt={formData.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
            <div className="mb-6">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full uppercase tracking-wide mb-4">
                {formData.category}
              </span>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{formData.title}</h1>
              <p className="text-xl text-gray-600 mb-6">{formData.excerpt}</p>
            </div>
            <div className="prose prose-lg max-w-none mb-8">
              {renderPreview()}
            </div>
            
            {/* Preview Gallery */}
            {formData.images.length > 0 && (
              <div className="mb-8">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Photo Gallery</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {formData.images.filter(img => img.trim()).map((image, index) => (
                    <div key={index} className="aspect-square overflow-hidden rounded-lg">
                      <img
                        src={image}
                        alt={`Gallery image ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Edit Mode */
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Title */}
              <div className="lg:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter post title"
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="hiking">Hiking</option>
                  <option value="travel">Travel</option>
                  <option value="food">Food</option>
                  <option value="photography">Photography</option>
                  <option value="lifestyle">Lifestyle</option>
                </select>
              </div>

              {/* Main Image URL */}
              <div>
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  Main Image URL (Gallery Thumbnail)
                </label>
                <div className="flex">
                  <input
                    type="url"
                    id="imageUrl"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    required
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                  <button
                    type="button"
                    className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200 transition-colors duration-200"
                    title="Upload Image"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Excerpt */}
              <div className="lg:col-span-2">
                <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
                  Excerpt
                </label>
                <textarea
                  id="excerpt"
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief description of the post"
                />
              </div>

              {/* Additional Images */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Additional Images (up to 10 total)
                  </label>
                  <button
                    type="button"
                    onClick={addImage}
                    disabled={formData.images.length >= 10}
                    className="inline-flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Image
                  </button>
                </div>
                
                <div className="space-y-3">
                  {formData.images.map((image, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="flex-1 flex">
                        <input
                          type="url"
                          value={image}
                          onChange={(e) => updateImage(index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={`Image ${index + 1} URL`}
                        />
                        <button
                          type="button"
                          className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200 transition-colors duration-200"
                          title="Upload Image"
                        >
                          <Upload className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
                        title="Remove Image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                
                {formData.images.length === 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    No additional images added. Click "Add Image" to include photos in your post gallery.
                  </p>
                )}
              </div>

              {/* Content */}
              <div className="lg:col-span-2">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  required
                  rows={20}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder="Write your post content here. Use # for headings, ## for subheadings."
                />
                <p className="mt-2 text-sm text-gray-500">
                  Use Markdown-style formatting: # for main headings, ## for subheadings
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : (isEditing ? 'Update Post' : 'Create Post')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}