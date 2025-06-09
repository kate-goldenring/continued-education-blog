import React from 'react';
import { Camera } from 'lucide-react';
import { BlogPost } from '../types/BlogPost';

interface PhotoCardProps {
  post: BlogPost;
  onClick: () => void;
}

export default function PhotoCard({ post, onClick }: PhotoCardProps) {
  return (
    <div 
      className="group cursor-pointer transform transition-all duration-300 hover:scale-102 mb-6"
      onClick={onClick}
    >
      <div className="relative overflow-hidden rounded-2xl shadow-lg group-hover:shadow-2xl transition-shadow duration-300">
        <img
          src={post.imageUrl}
          alt={post.title}
          className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <span className="inline-block px-2 py-1 sm:px-3 sm:py-1 bg-blue-600 text-xs font-semibold rounded-full mb-2 sm:mb-3 uppercase tracking-wide">
              {post.category}
            </span>
            <h3 className="text-lg sm:text-xl font-bold mb-2 leading-tight line-clamp-2">
              {post.title}
            </h3>
            <p className="text-sm text-gray-200 line-clamp-2 mb-2 sm:mb-3 leading-relaxed">
              {post.excerpt}
            </p>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center text-gray-300 min-w-0 flex-1 mr-2">
                <span className="truncate">{post.date}</span>
                <span className="mx-1 sm:mx-2 flex-shrink-0">•</span>
                <span className="truncate">{post.readTime}</span>
              </div>
              <div className="flex items-center text-gray-300 flex-shrink-0">
                <Camera className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">Kate Goldenring</span>
                <span className="sm:hidden">KG</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}