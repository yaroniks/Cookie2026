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

  // Вспомогательная функция для форматирования даты
  const formatDateTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return isoString;
      return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      }).format(date).replace(',', '');
    } catch (e) {
        console.log(e)
      return isoString;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full mb-12 border h-125 bg-slate-800 rounded-3xl animate-pulse border-white/10">
        <span className="text-2xl font-black tracking-widest text-blue-400 uppercase opacity-70">
          SparkNews Главное...
        </span>
      </div>
    );
  }

  if (!news) return null;

  return (
    <div 
      className="relative w-full mb-12 overflow-hidden border shadow-2xl rounded-3xl min-h-125 group border-white/10 bg-slate-950"
    >
      {news.image ? (
        <img 
          src={news.image} 
          alt={news.title} 
          className="absolute inset-0 object-cover w-full h-full" 
        />
      ) : (
        <div className="absolute inset-0 w-full h-full bg-slate-800" />
      )}

      <div className="absolute inset-0 bg-slate-950/40" />

      <div className="absolute inset-y-0 right-0 flex flex-col w-full p-4 space-y-4 sm:w-2/5 md:w-1/3 sm:p-6 md:p-8">

        <div className="bg-[#3366CC]/80 backdrop-blur-md p-6 rounded-2xl border border-blue-400/20 shadow-xl flex-1 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-3">
             <div className="px-2 py-0.5 text-[10px] font-black tracking-wider text-blue-900 uppercase bg-white rounded">
                ЛЕНТА НОВОСТЕЙ
             </div>
          </div>
          <h1 className="text-xl font-black leading-tight text-white sm:text-2xl">
            {news.title}
          </h1>
        </div>

        <div className="bg-[#FF9900]/80 backdrop-blur-md p-6 rounded-2xl border border-orange-300/20 shadow-xl flex flex-col justify-between">
          <div>
             <h3 className="mb-3 text-base font-extrabold tracking-tight text-orange-950">ДЕТАЛИ НОВОСТИ</h3>
             <p className="mb-6 text-sm font-medium leading-relaxed text-white/95 line-clamp-4">
                {news.description || news.title}
             </p>
          </div>

          <div className="space-y-5">

             <a 
               href={news.link}
               target="_blank"
               rel="noopener noreferrer"
               className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 bg-white hover:bg-slate-100 text-[#FF9900] font-bold rounded-xl transition-all shadow-md active:scale-95 text-sm"
             >
               Читать в источнике
               <ExternalLink className="w-4 h-4" />
             </a>

             <div className="flex flex-wrap items-center justify-between gap-3 pt-4 text-xs font-bold tracking-widest text-orange-100 uppercase border-t border-orange-200/20">
               <span className="flex items-center gap-1.5 truncate">
                 <Globe className="w-3.5 h-3.5 text-orange-200" />
                 {news.source || 'RIA'}
               </span>
               <span className="flex items-center gap-1.5">
                 <Clock className="w-3.5 h-3.5 text-orange-200" />
                 {formatDateTime(news.date)}
               </span>
             </div>
          </div>
        </div>

      </div>

      <div 
        className="absolute inset-0 cursor-pointer"
        onClick={() => onNewsClick && onNewsClick(news)}
      />
    </div>
  );
};

export default MainNews;