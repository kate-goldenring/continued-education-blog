import { Camera } from 'lucide-react';
import { BlogPost } from '../types/BlogPost';
import { useImageMetadata } from '../hooks/useImageMetadata';

interface PhotoCardProps {
  post: BlogPost;
  onClick: () => void;
}

export default function PhotoCard({ post, onClick }: PhotoCardProps) {
  const { metadata } = useImageMetadata(post.imageUrl);
  
  // Use photographer from image metadata, fallback to default
  const photographer = metadata?.photographer || 'Kate Goldenring';

  return (
    <div 
      className="group cursor-pointer transform transition-all duration-300 hover:scale-102 mb-6"
      onClick={onClick}
    >
      <div className="relative overflow-hidden rounded-2xl shadow-lg group-hover:shadow-2xl transition-shadow duration-300 bg-white">
        {/* Image Container */}
        <div className="relative overflow-hidden">
          <img
            src={post.imageUrl}
            alt={metadata?.altText || post.title}
            className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          
          {/* Gradient Overlay - Always visible but more subtle */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
        </div>
        
        {/* Text Content - Always visible, positioned at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          {/* Category Badge */}
          <span className="inline-block px-3 py-1 bg-blue-600 text-xs font-semibold rounded-full mb-3 uppercase tracking-wide shadow-lg">
            {post.category}
          </span>
          
          {/* Title */}
          <h3 className="text-xl font-bold mb-2 leading-tight drop-shadow-lg">
            {post.title}
          </h3>
          
          {/* Excerpt */}
          <p className="text-sm text-gray-200 mb-3 leading-relaxed line-clamp-3 drop-shadow-md">
            {post.excerpt}
          </p>
          
          {/* Meta Information */}
          <div className="flex items-center justify-between">
            <div className="flex items-center text-xs text-gray-300">
              <span>{post.date}</span>
              <span className="mx-2">•</span>
              <span>{post.readTime}</span>
            </div>
            <div className="flex items-center text-xs text-gray-300">
              <Camera className="w-3 h-3 mr-1" />
              <span>{photographer}</span>
            </div>
          </div>
        </div>
        
        {/* Hover Enhancement Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      </div>
    </div>
  );
}