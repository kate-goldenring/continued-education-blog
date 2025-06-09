import React, { useState, useEffect } from 'react';
import { Copy, Trash2, Edit3, Eye, X, Check, AlertCircle } from 'lucide-react';
import { imageService, ImageMetadata } from '../../services/imageService';

interface ImageGalleryProps {
  onImageSelect?: (imageUrl: string) => void;
  showSelectButton?: boolean;
  className?: string;
}

export default function ImageGallery({ 
  onImageSelect, 
  showSelectButton = false, 
  className = '' 
}: ImageGalleryProps) {
  const [images, setImages] = useState<ImageMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<ImageMetadata | null>(null);
  const [editingImage, setEditingImage] = useState<ImageMetadata | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      setLoading(true);
      setError(null);
      const imageList = await imageService.getImages();
      setImages(imageList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const handleDeleteImage = async (id: string) => {
    try {
      await imageService.deleteImage(id);
      setImages(prev => prev.filter(img => img.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete image');
    }
  };

  const handleUpdateMetadata = async (id: string, metadata: Partial<ImageMetadata>) => {
    try {
      await imageService.updateImageMetadata(id, metadata);
      setImages(prev => prev.map(img => 
        img.id === id ? { ...img, ...metadata } : img
      ));
      setEditingImage(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update image');
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading images...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
          <div>
            <p className="text-red-700 font-medium">Error loading images</p>
            <p className="text-red-600 text-sm">{error}</p>
            <button
              onClick={loadImages}
              className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {images.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No images uploaded yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map((image) => (
            <div
              key={image.id}
              className="group relative bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={image.publicUrl}
                  alt={image.altText || image.originalName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>

              {/* Overlay with actions */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                  <button
                    onClick={() => setSelectedImage(image)}
                    className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors duration-200"
                    title="View details"
                  >
                    <Eye className="w-4 h-4 text-gray-700" />
                  </button>
                  
                  <button
                    onClick={() => handleCopyUrl(image.publicUrl)}
                    className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors duration-200"
                    title="Copy URL"
                  >
                    {copiedUrl === image.publicUrl ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-700" />
                    )}
                  </button>

                  {showSelectButton && onImageSelect && (
                    <button
                      onClick={() => onImageSelect(image.publicUrl)}
                      className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-200"
                      title="Select image"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => setEditingImage(image)}
                    className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors duration-200"
                    title="Edit metadata"
                  >
                    <Edit3 className="w-4 h-4 text-gray-700" />
                  </button>

                  <button
                    onClick={() => setDeleteConfirm(image.id)}
                    className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors duration-200"
                    title="Delete image"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>

              {/* Image info */}
              <div className="p-3">
                <p className="text-xs text-gray-600 truncate" title={image.originalName}>
                  {image.originalName}
                </p>
                <p className="text-xs text-gray-400">
                  {(image.fileSize / 1024 / 1024).toFixed(1)} MB
                  {image.width && image.height && (
                    <span> • {image.width}×{image.height}</span>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Detail Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-full overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Image Details</h3>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <img
                    src={selectedImage.publicUrl}
                    alt={selectedImage.altText || selectedImage.originalName}
                    className="w-full rounded-lg"
                  />
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Original Name</label>
                    <p className="text-sm text-gray-900">{selectedImage.originalName}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Dimensions</label>
                    <p className="text-sm text-gray-900">
                      {selectedImage.width}×{selectedImage.height} pixels
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">File Size</label>
                    <p className="text-sm text-gray-900">
                      {(selectedImage.fileSize / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Photographer</label>
                    <p className="text-sm text-gray-900">{selectedImage.photographer}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Copyright</label>
                    <p className="text-sm text-gray-900">{selectedImage.copyright}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Public URL</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={selectedImage.publicUrl}
                        readOnly
                        className="flex-1 text-sm bg-gray-50 border border-gray-300 rounded px-3 py-2"
                      />
                      <button
                        onClick={() => handleCopyUrl(selectedImage.publicUrl)}
                        className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Metadata Modal */}
      {editingImage && (
        <EditImageModal
          image={editingImage}
          onSave={handleUpdateMetadata}
          onCancel={() => setEditingImage(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Image</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this image? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteImage(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
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

// Edit Image Modal Component
interface EditImageModalProps {
  image: ImageMetadata;
  onSave: (id: string, metadata: Partial<ImageMetadata>) => void;
  onCancel: () => void;
}

function EditImageModal({ image, onSave, onCancel }: EditImageModalProps) {
  const [formData, setFormData] = useState({
    altText: image.altText || '',
    caption: image.caption || '',
    photographer: image.photographer,
    copyright: image.copyright
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(image.id, formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Image Metadata</h3>
              <button
                type="button"
                onClick={onCancel}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alt Text
                </label>
                <input
                  type="text"
                  value={formData.altText}
                  onChange={(e) => setFormData(prev => ({ ...prev, altText: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the image for accessibility"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Caption
                </label>
                <textarea
                  value={formData.caption}
                  onChange={(e) => setFormData(prev => ({ ...prev, caption: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional caption for the image"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photographer
                </label>
                <input
                  type="text"
                  value={formData.photographer}
                  onChange={(e) => setFormData(prev => ({ ...prev, photographer: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Copyright
                </label>
                <input
                  type="text"
                  value={formData.copyright}
                  onChange={(e) => setFormData(prev => ({ ...prev, copyright: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}