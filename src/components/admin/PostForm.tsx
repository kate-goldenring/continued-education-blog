import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X, Eye, Plus, Trash2, Image as ImageIcon, Upload, AlertCircle } from 'lucide-react';
import { useBlogPosts } from '../../hooks/useBlogPosts';
import { BlogFormData } from '../../types/BlogPost';
import ImageUpload from './ImageUpload';
import ImageGallery from './ImageGallery';
import ImageSourceSelector from './ImageSourceSelector';
import { ImageUploadResult } from '../../services/imageService';
import { isFlickrImageUrl } from '../../utils/flickrUtils';

export default function PostForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addBlogPost, updateBlogPost, getBlogPost, loading, error: hookError } = useBlogPosts();
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
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [selectingImageFor, setSelectingImageFor] = useState<'main' | number | null>(null);
  const [postLoaded, setPostLoaded] = useState(false);
  const [postNotFound, setPostNotFound] = useState(false);

  // Load post data for editing - only run when loading is complete
  useEffect(() => {
    if (isEditing && id && !loading && !postLoaded) {
      console.log('Loading post for editing, ID:', id);
      const post = getBlogPost(id);
      if (post) {
        console.log('Found post:', post.title);
        setFormData({
          title: post.title,
          category: post.category,
          imageUrl: post.imageUrl,
          images: post.images || [],
          excerpt: post.excerpt,
          content: post.content
        });
        setPostLoaded(true);
        setPostNotFound(false);
      } else {
        console.warn('Post not found for ID:', id);
        setPostNotFound(true);
        setSaveError('Post not found');
      }
    }
  }, [id, isEditing, getBlogPost, loading, postLoaded]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted, isEditing:', isEditing, 'formData:', formData);
    
    // Validate required fields
    if (!formData.title.trim()) {
      setSaveError('Title is required');
      return;
    }
    if (!formData.excerpt.trim()) {
      setSaveError('Excerpt is required');
      return;
    }
    if (!formData.content.trim()) {
      setSaveError('Content is required');
      return;
    }
    if (!formData.imageUrl.trim()) {
      setSaveError('Main image URL is required');
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      if (isEditing && id) {
        console.log('Updating existing post with ID:', id);
        await updateBlogPost(id, formData);
        console.log('Post updated successfully');
      } else {
        console.log('Creating new post');
        const newPost = await addBlogPost(formData);
        console.log('New post created with ID:', newPost.id);
      }
      
      console.log('Navigating to admin panel');
      navigate('/admin');
    } catch (error) {
      console.error('Error saving post:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save post');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    console.log('Input changed:', name, '=', value);
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear save error when user starts typing
    if (saveError) setSaveError(null);
  };

  const handleImageSelected = (imageUrl: string, metadata?: any) => {
    if (selectingImageFor === 'main') {
      setFormData(prev => ({ ...prev, imageUrl: imageUrl }));
    } else if (typeof selectingImageFor === 'number') {
      setFormData(prev => ({
        ...prev,
        images: prev.images.map((img, i) => i === selectingImageFor ? imageUrl : img)
      }));
    }
    
    setSelectingImageFor(null);
    setShowImageSelector(false);
  };

  const addImage = () => {
    console.log('Adding image, current images:', formData.images.length);
    setFormData(prev => {
      const newImages = [...prev.images, ''];
      console.log('New images array length:', newImages.length);
      return {
        ...prev,
        images: newImages
      };
    });
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

  const openImageSelector = (target: 'main' | number) => {
    setSelectingImageFor(target);
    setShowImageSelector(true);
  };

  const closeModals = () => {
    setShowImageSelector(false);
    setSelectingImageFor(null);
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

  // Show loading state while data is being fetched
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
          <span className="text-gray-600">
            {isEditing ? 'Loading post...' : 'Loading...'}
          </span>
        </div>
      </div>
    );
  }

  // Show post not found error for editing mode
  if (isEditing && postNotFound) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Post Not Found</h2>
          <p className="text-gray-600 mb-6">
            The post you're trying to edit could not be found. It may have been deleted or the URL is incorrect.
          </p>
          <div className="flex justify-center space-x-3">
            <button
              onClick={() => navigate('/admin')}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200"
            >
              Back to Admin
            </button>
            <button
              onClick={() => navigate('/admin/new')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              Create New Post
            </button>
          </div>
        </div>
      </div>
    );
  }

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
        {/* Error Messages */}
        {(saveError || hookError) && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-red-700 text-sm font-medium">
                {saveError || hookError}
              </p>
              {hookError && (
                <p className="text-red-600 text-xs mt-1">
                  Check your internet connection and Supabase configuration.
                </p>
              )}
            </div>
          </div>
        )}

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
                  Title <span className="text-red-500">*</span>
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
                  <option value="mountaineering">Mountaineering</option>
                  <option value="lifestyle">Lifestyle</option>
                </select>
              </div>

              {/* Main Image URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Main Image (Gallery Thumbnail) <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <input
                      type="url"
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleChange}
                      required
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com/image.jpg"
                    />
                    <button
                      type="button"
                      onClick={() => openImageSelector('main')}
                      className="px-3 py-2 bg-blue-100 border border-blue-300 rounded-md hover:bg-blue-200 transition-colors duration-200"
                      title="Select image source"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {formData.imageUrl && (
                    <div className="w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={formData.imageUrl}
                        alt="Main image preview"
                        className="w-full h-full object-cover"
                      />
                      {isFlickrImageUrl(formData.imageUrl) && (
                        <div className="absolute top-1 right-1 bg-blue-600 text-white text-xs px-1 py-0.5 rounded">
                          Flickr
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Excerpt */}
              <div className="lg:col-span-2">
                <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
                  Excerpt <span className="text-red-500">*</span>
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
                    Add Image ({formData.images.length}/10)
                  </button>
                </div>
                
                <div className="space-y-3">
                  {formData.images.map((image, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <div className="flex-1 flex space-x-2">
                          <input
                            type="url"
                            value={image}
                            onChange={(e) => updateImage(index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder={`Image ${index + 1} URL`}
                          />
                          <button
                            type="button"
                            onClick={() => openImageSelector(index)}
                            className="px-3 py-2 bg-blue-100 border border-blue-300 rounded-md hover:bg-blue-200 transition-colors duration-200"
                            title="Select image source"
                          >
                            <Plus className="w-4 h-4" />
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
                      
                      {image && (
                        <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                          <img
                            src={image}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {isFlickrImageUrl(image) && (
                            <div className="absolute top-1 right-1 bg-blue-600 text-white text-xs px-1 py-0.5 rounded">
                              Flickr
                            </div>
                          )}
                        </div>
                      )}
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
                  Content <span className="text-red-500">*</span>
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
                disabled={isSaving || loading}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : (isEditing ? 'Update Post' : 'Create Post')}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Image Source Selector Modal */}
      {showImageSelector && (
        <ImageSourceSelector
          onImageSelected={handleImageSelected}
          onCancel={closeModals}
          title={`Select Image ${selectingImageFor === 'main' ? '(Main)' : `#${(selectingImageFor as number) + 1}`}`}
        />
      )}
    </div>
  );
}