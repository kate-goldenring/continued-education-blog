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
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <span className="inline-block px-3 py-1 bg-blue-600 text-xs font-semibold rounded-full mb-3 uppercase tracking-wide">
              {post.category}
            </span>
            <h3 className="text-xl font-bold mb-2 leading-tight">
              {post.title}
            </h3>
            <p className="text-sm text-gray-200 mb-3 leading-relaxed line-clamp-3">
              {post.excerpt}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-xs text-gray-300">
                <span>{post.date}</span>
                <span className="mx-2">•</span>
                <span>{post.readTime}</span>
              </div>
              <div className="flex items-center text-xs text-gray-300">
                <Camera className="w-3 h-3 mr-1" />
                <span>Kate Goldenring</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}