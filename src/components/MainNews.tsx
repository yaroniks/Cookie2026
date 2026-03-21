import React, { useEffect, useState } from 'react';
import { fetchMainNews, type NewsItem } from '../api/news';

interface MainNewsProps {
  onNewsClick?: (news: NewsItem) => void;
}

const MainNews: React.FC<MainNewsProps> = ({ onNewsClick }) => {
  const [news, setNews] = useState<NewsItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMainNews = async () => {
      setIsLoading(true);
      const data = await fetchMainNews();
      setNews(data);
      setIsLoading(false);
    };
    loadMainNews();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full mb-12 border h-100 bg-white/10 rounded-2xl animate-pulse border-white/20">
        <span className="text-xl font-black tracking-widest text-white uppercase opacity-50">
          Загрузка главного...
        </span>
      </div>
    );
  }

  if (!news) return null;

  return (
    <div 
      className="relative w-full mb-12 overflow-hidden border shadow-2xl cursor-pointer rounded-2xl min-h-100 group border-white/20"
      onClick={() => onNewsClick && onNewsClick(news)}
    >
      {news.image ? (
        <img 
          src={news.image} 
          alt={news.title} 
          className="absolute inset-0 object-cover w-full h-full transition-transform duration-700 group-hover:scale-105" 
        />
      ) : (
        <div className="absolute inset-0 w-full h-full bg-slate-800" />
      )}
      
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />

      <div className="absolute inset-0 flex items-end p-4 sm:p-8">
        <div className="relative z-10 flex flex-col items-start w-full gap-4 sm:flex-row sm:items-end sm:gap-0 sm:-space-x-6">

          <div className="bg-[#3366CC]/95 backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-2xl z-20 w-full sm:w-2/3 border border-blue-400/30 transition-transform duration-300 group-hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1 text-xs font-black tracking-wider text-blue-900 uppercase bg-white rounded-md">
                {news.category || 'Главное'}
              </span>
            </div>
            <h1 className="text-2xl font-black leading-tight text-white sm:text-3xl lg:text-4xl">
              {news.title}
            </h1>
          </div>

          <div className="bg-[#FF9900]/95 backdrop-blur-md p-5 sm:p-6 rounded-2xl shadow-xl z-10 w-full sm:w-1/2 sm:mb-6 border border-orange-300/30 transition-transform duration-300 group-hover:translate-x-1">
            <p className="mb-4 text-sm font-medium text-white/95 sm:text-base line-clamp-3">
              {news.description}
            </p>
            <div className="flex items-center justify-between pt-3 text-xs font-bold tracking-widest text-orange-100 uppercase border-t border-orange-200/20">
              <span className="flex items-center gap-2">
                {news.source}
              </span>
              <span>
                {new Date(news.date).toLocaleDateString('ru-RU')}
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MainNews;