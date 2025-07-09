import React, { useState } from 'react';
import { ExternalLink, Image as ImageIcon, AlertCircle, Check } from 'lucide-react';
import { parseFlickrEmbed, FlickrImageData } from '../../utils/flickrUtils';

interface FlickrImageInputProps {
  onImageSelect: (imageUrl: string, metadata?: FlickrImageData) => void;
  className?: string;
}

export default function FlickrImageInput({ onImageSelect, className = '' }: FlickrImageInputProps) {
  const [embedCode, setEmbedCode] = useState('');
  const [parsedData, setParsedData] = useState<FlickrImageData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleEmbedChange = (value: string) => {
    setEmbedCode(value);
    setError(null);
    
    if (value.trim()) {
      const data = parseFlickrEmbed(value);
      if (data) {
        setParsedData(data);
        setShowPreview(true);
      } else {
        setParsedData(null);
        setShowPreview(false);
        setError('Invalid Flickr embed code. Please paste the complete embed HTML from Flickr.');
      }
    } else {
      setParsedData(null);
      setShowPreview(false);
    }
  };

  const handleUseImage = () => {
    if (parsedData) {
      onImageSelect(parsedData.imageUrl, parsedData);
      // Reset form
      setEmbedCode('');
      setParsedData(null);
      setShowPreview(false);
      setError(null);
    }
  };

  return (
    <div className={`bg-white border border-gray-300 rounded-lg p-6 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
          <ExternalLink className="w-5 h-5 mr-2" />
          Embed from Flickr
        </h3>
        <p className="text-sm text-gray-600">
          Paste the complete Flickr embed code to use an image from your Flickr account.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Flickr Embed Code
          </label>
          <textarea
            value={embedCode}
            onChange={(e) => handleEmbedChange(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder='Paste your Flickr embed code here (e.g., <a data-flickr-embed="true" href="...">...)'
          />
          <p className="text-xs text-gray-500 mt-1">
            To get embed code: Go to your Flickr photo → Click "Share" → Copy the embed code
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {showPreview && parsedData && (
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Preview</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <img
                  src={parsedData.imageUrl}
                  alt={parsedData.alt}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Title:</span>
                  <span className="ml-2 text-gray-600">{parsedData.title}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Dimensions:</span>
                  <span className="ml-2 text-gray-600">{parsedData.width} × {parsedData.height}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Photo ID:</span>
                  <span className="ml-2 text-gray-600">{parsedData.photoId}</span>
                </div>
                {parsedData.albumId && (
                  <div>
                    <span className="font-medium text-gray-700">Album ID:</span>
                    <span className="ml-2 text-gray-600">{parsedData.albumId}</span>
                  </div>
                )}
                <div className="pt-2">
                  <a
                    href={parsedData.embedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    View on Flickr
                  </a>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleUseImage}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                <Check className="w-4 h-4 mr-2" />
                Use This Image
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}