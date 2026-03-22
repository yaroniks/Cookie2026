import React from 'react';
import NewsCard from './NewsCard';
import type { NewsItem } from '../api/news';

interface ClusterProps {
  category: string;
  news: NewsItem[];
  onNewsClick: (newsItem: NewsItem) => void;
  index: number;
}

const NewsCluster: React.FC<ClusterProps> = ({ category, news, onNewsClick, index }) => {
  const headerBg = index % 2 === 0 ? 'bg-[#5C89E8]' : 'bg-[#FF9900]/85';

  return (
    <section className="mb-12 overflow-hidden border shadow-2xl rounded-2xl border-white/20">
      {/* Применяем динамический фон для заголовка */}
      <div className={`${headerBg} text-white py-6 px-6 text-center transition-colors duration-500`}>
        <h2 className="text-4xl font-light uppercase tracking-widest text-[#E6FFFF]">
          {category}
        </h2>
      </div>

      <div className="p-6 bg-white sm:p-10"> 
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {news.map((item, idx) => {
            const hasImage = !!item.image;
            const isFirstInRow = (idx % 2 === 0);
            const nextItemHasNoImage = news[idx + 1] && !news[idx + 1].image;
            const prevItemHasNoImage = news[idx - 1] && !news[idx - 1].image;
            
            let shouldFullWidth = hasImage;
            
            if (!hasImage) {
              const pairedWithNoImage = (isFirstInRow && nextItemHasNoImage) || (!isFirstInRow && prevItemHasNoImage);
              shouldFullWidth = !pairedWithNoImage;
            }

            return (
              <div 
                key={`${item.title}-${idx}`} 
                className={shouldFullWidth ? "lg:col-span-2" : "lg:col-span-1"}
              >
                <NewsCard 
                  title={item.title}
                  excerpt={item.description || ""}
                  time={item.date}
                  imageUrl={item.image || undefined}
                  onClick={() => onNewsClick(item)} 
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default NewsCluster;