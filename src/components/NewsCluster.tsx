import React from 'react';
import NewsCard from './NewsCard';
import type { NewsItem } from '../api/news';

interface ClusterProps {
  category: string;
  news: NewsItem[];
  onNewsClick: (newsItem: NewsItem) => void;
}

const NewsCluster: React.FC<ClusterProps> = ({ category, news, onNewsClick }) => {
  return (
    <section className="mb-12 overflow-hidden border shadow-2xl rounded-2xl border-white/20">
      <div className="bg-[#5C89E8] text-white py-6 px-6 text-center">
        <h2 className="text-4xl font-light uppercase tracking-widest text-[#E6FFFF]">{category}</h2>
      </div>
      <div className="p-6 bg-white sm:p-10"> 
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {news.map((item, index) => {
            const hasImage = !!item.image;

            const isFirstInRow = (index % 2 === 0);
            const nextItemHasNoImage = news[index + 1] && !news[index + 1].image;
            const prevItemHasNoImage = news[index - 1] && !news[index - 1].image;
            
            let shouldFullWidth = hasImage;
            
            if (!hasImage) {
              const pairedWithNoImage = (isFirstInRow && nextItemHasNoImage) || (!isFirstInRow && prevItemHasNoImage);
              shouldFullWidth = !pairedWithNoImage;
            }

            return (
              <div 
                key={`${item.title}-${index}`} 
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