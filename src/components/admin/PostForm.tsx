import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X, Eye, Plus, Trash2, Image as ImageIcon, Upload, AlertCircle } from 'lucide-react';
import { useBlogPosts } from '../../hooks/useBlogPosts';
import { BlogFormData } from '../../types/BlogPost';
import ImageUpload from './ImageUpload';
import ImageGallery from './ImageGallery';
import { ImageUploadResult } from '../../services/imageService';

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
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [selectingImageFor, setSelectingImageFor] = useState<'main' | number | null>(null);
  const [postLoaded, setPostLoaded] = useState(false);

  // Load post data for editing - only run once when component mounts and data is available
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
      } else {
        console.warn('Post not found for ID:', id);
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

  const handleImageUploaded = (result: ImageUploadResult) => {
    setUploadError(null);
    
    // Update the form data based on what we're selecting for
    if (selectingImageFor === 'main') {
      setFormData(prev => ({ ...prev, imageUrl: result.publicUrl }));
    } else if (typeof selectingImageFor === 'number') {
      setFormData(prev => ({
        ...prev,
        images: prev.images.map((img, i) => i === selectingImageFor ? result.publicUrl : img)
      }));
    }
    
    // Close the upload modal and reset selection
    setSelectingImageFor(null);
    setShowImageUpload(false);
  };

  const handleImageSelected = (imageUrl: string) => {
    if (selectingImageFor === 'main') {
      setFormData(prev => ({ ...prev, imageUrl: imageUrl }));
    } else if (typeof selectingImageFor === 'number') {
      setFormData(prev => ({
        ...prev,
        images: prev.images.map((img, i) => i === selectingImageFor ? imageUrl : img)
      }));
    }
    
    setSelectingImageFor(null);
    setShowImageGallery(false);
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
    setShowImageGallery(true);
  };

  const openImageUploader = (target: 'main' | number) => {
    setSelectingImageFor(target);
    setShowImageUpload(true);
  };

  const closeModals = () => {
    setShowImageGallery(false);
    setShowImageUpload(false);
    setSelectingImageFor(null);
    setUploadError(null);
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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
          <span className="text-gray-600">Loading...</span>
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
                  <option value="photography">Photography</option>
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
                      className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors duration-200"
                      title="Select from gallery"
                    >
                      <ImageIcon className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openImageUploader('main')}
                      className="px-3 py-2 bg-blue-100 border border-blue-300 rounded-md hover:bg-blue-200 transition-colors duration-200"
                      title="Upload new image"
                    >
                      <Upload className="w-4 h-4" />
                    </button>
                  </div>
                  {formData.imageUrl && (
                    <div className="w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={formData.imageUrl}
                        alt="Main image preview"
                        className="w-full h-full object-cover"
                      />
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
                            className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors duration-200"
                            title="Select from gallery"
                          >
                            <ImageIcon className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openImageUploader(index)}
                            className="px-3 py-2 bg-blue-100 border border-blue-300 rounded-md hover:bg-blue-200 transition-colors duration-200"
                            title="Upload new image"
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
                      
                      {image && (
                        <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                          <img
                            src={image}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
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

      {/* Image Gallery Modal */}
      {showImageGallery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl max-h-full overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Select Image</h3>
                <button
                  onClick={closeModals}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <ImageGallery
                onImageSelect={handleImageSelected}
                showSelectButton={true}
                className="max-h-96 overflow-y-auto"
              />
            </div>
          </div>
        </div>
      )}

      {/* Image Upload Modal */}
      {showImageUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Upload Image</h3>
                <button
                  onClick={closeModals}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {uploadError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-700 text-sm">{uploadError}</p>
                </div>
              )}

              <ImageUpload
                onImageUploaded={handleImageUploaded}
                onError={setUploadError}
                folder="blog-posts"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}