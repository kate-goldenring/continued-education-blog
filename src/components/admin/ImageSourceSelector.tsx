import React, { useState } from 'react';
import { Upload, Database, ExternalLink, X } from 'lucide-react';
import ImageUpload from './ImageUpload';
import ImageGallery from './ImageGallery';
import FlickrImageInput from './FlickrImageInput';
import { ImageUploadResult } from '../../services/imageService';
import { FlickrImageData } from '../../utils/flickrUtils';

interface ImageSourceSelectorProps {
  onImageSelected: (imageUrl: string, metadata?: any) => void;
  onCancel: () => void;
  title?: string;
}

export default function ImageSourceSelector({ 
  onImageSelected, 
  onCancel, 
  title = "Select Image Source" 
}: ImageSourceSelectorProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'gallery' | 'flickr'>('gallery');
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleImageUploaded = (result: ImageUploadResult) => {
    setUploadError(null);
    onImageSelected(result.publicUrl, {
      type: 'supabase',
      id: result.id,
      filename: result.filename,
      width: result.width,
      height: result.height
    });
  };

  const handleGalleryImageSelected = (imageUrl: string) => {
    onImageSelected(imageUrl, { type: 'supabase' });
  };

  const handleFlickrImageSelected = (imageUrl: string, flickrData?: FlickrImageData) => {
    onImageSelected(imageUrl, {
      type: 'flickr',
      ...flickrData
    });
  };

  const tabs = [
    { key: 'gallery' as const, label: 'Image Gallery', icon: Database },
    { key: 'upload' as const, label: 'Upload New', icon: Upload },
    { key: 'flickr' as const, label: 'Flickr Embed', icon: ExternalLink }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl max-h-full overflow-auto w-full">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  activeTab === key
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-96">
            {activeTab === 'gallery' && (
              <ImageGallery
                onImageSelect={handleGalleryImageSelected}
                showSelectButton={true}
                className="max-h-96 overflow-y-auto"
              />
            )}

            {activeTab === 'upload' && (
              <div>
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
            )}

            {activeTab === 'flickr' && (
              <FlickrImageInput
                onImageSelect={handleFlickrImageSelected}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}