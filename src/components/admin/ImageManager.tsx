import React, { useState } from 'react';
import { Upload, RefreshCw } from 'lucide-react';
import ImageUpload from './ImageUpload';
import ImageGallery from './ImageGallery';
import { ImageUploadResult } from '../../services/imageService';

export default function ImageManager() {
  const [showUpload, setShowUpload] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleImageUploaded = (result: ImageUploadResult) => {
    setUploadError(null);
    setShowUpload(false);
    // Refresh the gallery by changing the key
    setRefreshKey(prev => prev + 1);
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Image Gallery</h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
            <button
              onClick={() => setShowUpload(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Images
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="mb-6">
          <p className="text-gray-600">
            Manage your blog images. Upload new images, view existing ones, and copy URLs for use in your posts.
            All images are automatically optimized and stored securely in Supabase Storage.
          </p>
        </div>

        {/* Upload Section */}
        {showUpload && (
          <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Upload New Images</h3>
              <button
                onClick={() => {
                  setShowUpload(false);
                  setUploadError(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
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
              folder="blog-images"
            />
          </div>
        )}

        {/* Image Gallery */}
        <ImageGallery key={refreshKey} />
      </div>
    </div>
  );
}