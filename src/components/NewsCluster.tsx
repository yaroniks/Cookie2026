import React from 'react';
import NewsCard from './NewsCard';

export interface SimpleNewsItem {
  title: string;
  excerpt: string;
  time: string;
  imageUrl?: string;
}

interface ClusterProps {
  category: string;
  news: SimpleNewsItem[];
  onNewsClick: (newsItem: SimpleNewsItem) => void;
}

const NewsCluster: React.FC<ClusterProps> = ({ category, news, onNewsClick }) => {
  return (
    <section className="mb-12 shadow-2xl rounded-2xl overflow-hidden border border-white/20">
      <div className="bg-[#5C89E8] text-white py-6 px-6 text-center">
        <h2 className="text-3xl font-black uppercase tracking-widest text-[#E6FFFF]">{category}</h2>
      </div>
      <div className="bg-white p-6 sm:p-10"> 
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {news.map((item, index) => (
            <div key={`${item.title}-${index}`} className={!item.imageUrl ? "lg:col-span-1" : "lg:col-span-2"}>
              <NewsCard {...item} onClick={() => onNewsClick(item)} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsCluster;