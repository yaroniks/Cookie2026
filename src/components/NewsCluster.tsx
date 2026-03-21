import React from 'react';
import NewsCard from './NewsCard';

interface ClusterProps {
  category: string;
  news: {
    id: number;
    title: string;
    excerpt: string;
    time: string;
    imageUrl?: string;
  }[];
}

const NewsCluster: React.FC<ClusterProps> = ({ category, news }) => {
  return (
    <section className="mb-12 lg:mb-20 shadow-2xl rounded-2xl overflow-hidden border border-white/20">
      
      <div className="bg-[#5C89E8] text-white py-6 px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-widest text-[#E6FFFF]">
          {category}
        </h2>
      </div>

      <div className="bg-white p-6 sm:p-10"> 
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {news.map((item, index) => {
            const hasImage = !!item.imageUrl;
            
            // По умолчанию делаем карточку на всю ширину (и с фото, и одиночек без фото)
            let colSpan = "lg:col-span-2"; 

            if (!hasImage) {
              // Смотрим на соседей: есть ли картинка у предыдущей или следующей новости?
              const nextNoImage = index < news.length - 1 && !news[index + 1].imageUrl;
              const prevNoImage = index > 0 && !news[index - 1].imageUrl;

              // Если есть хотя бы один сосед тоже без фото, они образуют пару (половинки)
              if (nextNoImage || prevNoImage) {
                colSpan = "lg:col-span-1";
              }
            }

            return (
              <div key={item.id} className={`${colSpan} flex`}>
                <div className="w-full">
                  <NewsCard {...item} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
    </section>
  );
};

export default NewsCluster;