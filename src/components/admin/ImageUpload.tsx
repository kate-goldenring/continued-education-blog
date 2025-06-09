import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader, AlertCircle, Check } from 'lucide-react';
import { imageService, ImageUploadResult } from '../../services/imageService';

interface ImageUploadProps {
  onImageUploaded: (result: ImageUploadResult) => void;
  onError?: (error: string) => void;
  className?: string;
  accept?: string;
  multiple?: boolean;
  folder?: string;
}

export default function ImageUpload({
  onImageUploaded,
  onError,
  className = '',
  accept = 'image/*',
  multiple = false,
  folder
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList) => {
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadProgress('Preparing upload...');

    try {
      const file = files[0]; // Handle single file for now

      // Validate file
      const validation = imageService.validateImageFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      setUploadProgress('Uploading image...');

      // Upload image
      const result = await imageService.uploadImage(file, folder);

      setUploadProgress('Upload complete!');
      onImageUploaded(result);

      // Clear progress after a short delay
      setTimeout(() => {
        setUploadProgress(null);
      }, 2000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      onError?.(errorMessage);
      setUploadProgress(null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleInputChange}
        className="hidden"
      />

      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : isUploading
            ? 'border-gray-300 bg-gray-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50 cursor-pointer'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={!isUploading ? openFileDialog : undefined}
      >
        {isUploading ? (
          <div className="flex flex-col items-center">
            <Loader className="w-8 h-8 text-blue-600 animate-spin mb-3" />
            <p className="text-sm text-gray-600">{uploadProgress}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
              <ImageIcon className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG, WebP up to 10MB
            </p>
          </div>
        )}

        {dragActive && (
          <div className="absolute inset-0 bg-blue-50 bg-opacity-50 rounded-lg flex items-center justify-center">
            <div className="text-blue-600 font-medium">Drop image here</div>
          </div>
        )}
      </div>
    </div>
  );
}