import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, ChevronLeft, ChevronRight, X, Camera } from 'lucide-react';
import { useBlogPosts } from '../hooks/useBlogPosts';
import { useImageMetadata, useImageMetadataMap } from '../hooks/useImageMetadata';
import { isFlickrImageUrl } from '../utils/flickrUtils';

export default function BlogPost() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getBlogPost } = useBlogPosts();
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  
  const post = getBlogPost(id || '');
  
  // Get metadata for the main image
  const { metadata: mainImageMetadata } = useImageMetadata(post?.imageUrl || null);
  
  // Get metadata for all gallery images
  const { metadataMap: galleryMetadataMap } = useImageMetadataMap(post?.images || []);

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Post not found</h1>
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Return to gallery
          </button>
        </div>
      </div>
    );
  }

  const renderContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, index) => {
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-4xl font-bold text-gray-900 mb-6 mt-8">{line.slice(2)}</h1>;
      } else if (line.startsWith('## ')) {
        return <h2 key={index} className="text-2xl font-semibold text-gray-800 mb-4 mt-8">{line.slice(3)}</h2>;
      } else if (line.trim() === '') {
        return <div key={index} className="mb-4"></div>;
      } else {
        return <p key={index} className="text-lg text-gray-700 leading-relaxed mb-4">{line}</p>;
      }
    });
  };

  const openLightbox = (index: number) => {
    setSelectedImageIndex(index);
  };

  const closeLightbox = () => {
    setSelectedImageIndex(null);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (selectedImageIndex === null || (!post.images && !post.imageUrl)) return;
    
    const totalImages = (post.images?.length || 0) + (post.imageUrl ? 1 : 0);
    
    if (direction === 'prev') {
      if (selectedImageIndex === -1) {
        // From main image, go to last additional image or stay at main if no additional images
        setSelectedImageIndex(post.images && post.images.length > 0 ? post.images.length - 1 : -1);
      } else if (selectedImageIndex === 0) {
        // From first additional image, go to main image
        setSelectedImageIndex(-1);
      } else {
        setSelectedImageIndex(selectedImageIndex - 1);
      }
    } else {
      if (selectedImageIndex === -1) {
        // From main image, go to first additional image or stay at main if no additional images
        setSelectedImageIndex(post.images && post.images.length > 0 ? 0 : -1);
      } else if (post.images && selectedImageIndex === post.images.length - 1) {
        // From last additional image, go to main image
        setSelectedImageIndex(-1);
      } else {
        setSelectedImageIndex(selectedImageIndex + 1);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigateImage('prev');
    if (e.key === 'ArrowRight') navigateImage('next');
  };

  // Get photographer for main image
  const isMainImageFlickr = isFlickrImageUrl(post?.imageUrl || '');
  
  let mainImagePhotographer = 'Kate Goldenring';
  if (isMainImageFlickr) {
    // Get photographer info from stored metadata if available
    const flickrMetadata = post?.imageMetadata?.[post.imageUrl];
    mainImagePhotographer = flickrMetadata?.photographer || 'Flickr User';
  } else if (mainImageMetadata?.photographer) {
    mainImagePhotographer = mainImageMetadata.photographer;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Gallery
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        <img
          src={post.imageUrl}
          alt={mainImageMetadata?.altText || post.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        
        {/* Hero Image Attribution */}
        <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2">
          <div className="flex items-center text-white text-sm">
            <Camera className="w-4 h-4 mr-2" />
            <span>Photo by {mainImagePhotographer}</span>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Article Header */}
        <header className="mb-12">
          <div className="flex items-center mb-4">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full uppercase tracking-wide">
              {post.category}
            </span>
          </div>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {post.title}
          </h1>
          
          <p className="text-xl text-gray-600 mb-6 leading-relaxed">
            {post.excerpt}
          </p>
          
          <div className="flex items-center text-gray-500 text-sm">
            <Calendar className="w-4 h-4 mr-2" />
            <span className="mr-6">{new Date(post.date).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
            <Clock className="w-4 h-4 mr-2" />
            <span>{post.readTime}</span>
          </div>
        </header>

        {/* Article Body */}
        <div className="prose prose-lg max-w-none mb-12">
          {renderContent(post.content)}
        </div>

        {/* Photo Gallery */}
        {(post.images && post.images.length > 0) || post.imageUrl && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Photo Gallery</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Main Image First */}
              {post.imageUrl && (
                <div
                  className="group cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 relative"
                  onClick={() => openLightbox(-1)} // Use -1 to indicate main image
                >
                  <img
                    src={post.imageUrl}
                    alt={mainImageMetadata?.altText || post.title}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Main Image Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                      Main
                    </span>
                  </div>
                  
                  {/* Image Attribution Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="flex items-center text-white text-xs">
                        <Camera className="w-3 h-3 mr-1" />
                        <span>{mainImagePhotographer}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Additional Images */}
              {post.images && post.images.map((image, index) => {
                const imageMetadata = galleryMetadataMap.get(image);
                const isFlickr = isFlickrImageUrl(image);
                
                let photographer = 'Kate Goldenring';
                if (isFlickr) {
                  const flickrMetadata = post.imageMetadata?.[image];
                  photographer = flickrMetadata?.photographer || 'Flickr User';
                } else if (imageMetadata?.photographer) {
                  photographer = imageMetadata.photographer;
                }
                
                return (
                  <div
                    key={index}
                    className="group cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 relative"
                    onClick={() => openLightbox(index)}
                  >
                    <img
                      src={image}
                      alt={imageMetadata?.altText || `Gallery image ${index + 1}`}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Image Attribution Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="flex items-center text-white text-xs">
                          <Camera className="w-3 h-3 mr-1" />
                          <span>{photographer}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Back to Gallery */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Gallery
          </button>
        </div>
      </article>

      {/* Lightbox Modal */}
      {selectedImageIndex !== null && (post.images || post.imageUrl) && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <div className="relative max-w-7xl max-h-full p-4">
            {/* Display main image if selectedImageIndex is -1, otherwise display gallery image */}
            <img
              src={selectedImageIndex === -1 ? post.imageUrl : post.images![selectedImageIndex]}
              alt={selectedImageIndex === -1 
                ? (mainImageMetadata?.altText || post.title)
                : (galleryMetadataMap.get(post.images![selectedImageIndex])?.altText || `Gallery image ${selectedImageIndex + 1}`)
              }
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors duration-200"
            >
              <X className="w-8 h-8" />
            </button>
            
            {/* Navigation Arrows */}
            {((post.images?.length || 0) + (post.imageUrl ? 1 : 0)) > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateImage('prev');
                  }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors duration-200"
                >
                  <ChevronLeft className="w-12 h-12" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateImage('next');
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors duration-200"
                >
                  <ChevronRight className="w-12 h-12" />
                </button>
              </>
            )}
            
            {/* Image Counter and Attribution */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
              <div className="text-white text-sm mb-2">
                {selectedImageIndex === -1 ? 1 : selectedImageIndex + 2} of {(post.images?.length || 0) + (post.imageUrl ? 1 : 0)}
              </div>
              <div className="bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2">
                <div className="flex items-center text-white text-sm">
                  <Camera className="w-4 h-4 mr-2" />
                  <span>
                    {(() => {
                      if (selectedImageIndex === -1) {
                        return mainImagePhotographer;
                      }
                      
                      const currentImage = post.images![selectedImageIndex];
                      const isFlickr = isFlickrImageUrl(currentImage);
                      
                      if (isFlickr) {
                        const flickrMetadata = post.imageMetadata?.[currentImage];
                        return flickrMetadata?.photographer || 'Flickr User';
                      }
                      return galleryMetadataMap.get(currentImage)?.photographer || 'Kate Goldenring';
                    })()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}