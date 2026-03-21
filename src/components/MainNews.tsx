import React, { useEffect, useState } from 'react';
import { Clock, Globe, ExternalLink } from 'lucide-react';
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

  const formatDateTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      }).format(date).replace(',', '');
    } catch (e) { console.log(e); return isoString; }
  };

  if (isLoading) return <div className="w-full mb-12 h-100 bg-slate-800 rounded-3xl animate-pulse" />;
  if (!news) return null;

  return (
    <div className="relative w-full mb-12 overflow-hidden border shadow-2xl rounded-3xl min-h-125 lg:h-150 border-white/10 bg-slate-900 group">
      {/* Фоновое фото */}
      {news.image && (
        <img src={news.image} alt="" className="absolute inset-0 object-cover w-full h-full" />
      )}
      <div className="absolute inset-0 bg-slate-950/40" />

      {/* Правая панель с адаптивной шириной */}
      <div className="absolute inset-y-0 right-0 flex flex-col w-full p-4 space-y-3 sm:w-1/2 md:w-2/5 lg:w-1/3 sm:p-6 lg:p-8 sm:space-y-4">
        
        {/* Синий блок (Заголовок) */}
        <div className="bg-[#3366CC]/85 backdrop-blur-md p-5 lg:p-7 rounded-2xl border border-blue-400/20 shadow-xl flex flex-col justify-center min-h-fit">
          <div className="mb-2">
             <span className="px-2 py-0.5 text-[10px] font-black text-blue-900 uppercase bg-white rounded">
                ЛЕНТА НОВОСТЕЙ
             </span>
          </div>
          <h1 className="text-lg font-black leading-tight text-white wrap-break-word sm:text-xl lg:text-2xl">
            {news.title}
          </h1>
        </div>

        <div className="bg-[#FF9900]/85 backdrop-blur-md p-5 lg:p-7 rounded-2xl border border-orange-300/20 shadow-xl flex-1 flex flex-col justify-between overflow-hidden">
          <div className="overflow-hidden">
             <h3 className="mb-2 text-xs font-black tracking-tighter uppercase lg:text-sm text-orange-950">ДЕТАЛИ НОВОСТИ</h3>
             <p className="mb-4 text-xs font-medium leading-relaxed text-white/95 lg:text-base line-clamp-3 sm:line-clamp-4 lg:line-clamp-6">
                {news.description}
             </p>
          </div>

          <div className="mt-auto space-y-4">
             <a href={news.link} target="_blank" rel="noopener" 
                className="flex items-center justify-center gap-2 w-full py-2.5 lg:py-3 bg-white text-[#FF9900] font-bold rounded-xl hover:bg-orange-50 transition-colors text-xs lg:text-sm">
               ИСТОЧНИК <ExternalLink size={14} />
             </a>

             <div className="flex items-center justify-between text-[10px] lg:text-xs font-bold text-orange-100 uppercase pt-3 border-t border-orange-200/20">
               <span className="flex items-center gap-1"><Globe size={12}/> {news.source}</span>
               <span className="flex items-center gap-1"><Clock size={12}/> {formatDateTime(news.date)}</span>
             </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 cursor-pointer" onClick={() => onNewsClick?.(news)} />
    </div>
  );
};

export default MainNews;