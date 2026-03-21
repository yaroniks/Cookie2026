import React from 'react';
import { Clock } from 'lucide-react';
import robloxImage from '../assets/Roblox.jpg';

interface NewsCardProps {
  title: string;
  excerpt: string;
  time: string;
  imageUrl?: string;
}

const NewsCard: React.FC<NewsCardProps> = ({ title, excerpt, time, imageUrl }) => {
  const placeholderImage = robloxImage;

  const formatDateTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      
      if (isNaN(date.getTime())) return isoString;

      return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date).replace(',', '');
    } catch (e) {
        console.log(e);
      return isoString;
    }
  };

  return (
    <article className="bg-[#b3c4ec]/50 rounded-xl shadow-sm border border-gray-100/30 p-5 flex flex-col sm:flex-row gap-6 group hover:shadow-lg hover:border-[#3366CC]/30 transition-all duration-300 h-full">

      {imageUrl && (
        <div className="shrink-0 overflow-hidden rounded-lg w-full sm:w-48 md:w-64 h-48 sm:h-auto">
          <img 
            src={imageUrl || placeholderImage}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="flex flex-col grow">
        <div className="grow space-y-3">
          <h3 className="text-xl font-extrabold text-black leading-snug group-hover:text-gray-800 transition-colors">
            {title}
          </h3>
          
          <p className="text-sm text-gray-700 leading-relaxed max-w-2xl opacity-80 group-hover:opacity-100 transition-opacity">
            {excerpt}
          </p>
        </div>

        <div className="mt-5 pt-3 border-t border-gray-100/40 flex items-center justify-end text-xs text-gray-500 space-x-1.5 font-medium">
          <Clock className="h-3.5 w-3.5" />
          <time>{formatDateTime(time)}</time>
        </div>
      </div>
      
    </article>
  );
};

export default NewsCard;