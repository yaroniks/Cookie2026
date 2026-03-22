import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import NewsCluster from '../components/NewsCluster';
import { fetchNews, searchNews, type NewsItem } from '../api/news';
import { groupNewsByCategory } from '../utils/newsUtils';
import NewsModal from '../components/NewsModal';
import type { NewsDetail, Entity } from '../components/NewsModal';
import MainNews from '../components/MainNews';
import CurrencyBar from '../components/CurrencyBar';

interface ClusterData {
  category: string;
  news: NewsItem[];
}

const HomePage: React.FC = () => {
  const [clusters, setClusters] = useState<ClusterData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams] = useSearchParams();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsDetail | null>(null);
  
  const query = searchParams.get('search');
  const categoryParam = searchParams.get('category');

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        let data: NewsItem[] = query ? await searchNews(query) : await fetchNews();
        if (categoryParam) {
          data = data.filter(item => item.category === categoryParam);
        }
        const grouped = groupNewsByCategory(data) as unknown as ClusterData[];
        setClusters(grouped);
      } catch (err) {
        console.error("Ошибка загрузки:", err);
        setClusters([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [query, categoryParam]);

  const handleOpenNews = (newsItem: NewsItem) => {
    const mapType = (label: string): Entity['type'] => {
      if (label === 'PER') return 'person';
      if (label === 'LOC') return 'location';
      if (label === 'ORG') return 'organization';
      return 'event';
    };

    const validEntities = (newsItem.entities || []).filter(e => 
      e.text && !['', 'none', 'null'].includes(e.text.trim().toLowerCase())
    );

    const uniqueEntities = Array.from(new Map(validEntities.map(e => [e.text.toLowerCase(), e])).values());

    setSelectedNews({
      title: newsItem.title,
      excerpt: newsItem.description || "",
      time: newsItem.date,
      link: newsItem.link,
      imageUrl: newsItem.image || undefined,
      source: newsItem.source,
      entities: uniqueEntities.map(e => ({ 
        name: e.text, 
        type: mapType(e.label) 
      }))
    });
    setIsModalOpen(true);
  };

  return (
    <div className="bg-[#a5bef4] min-h-screen py-12 px-4 flex flex-col items-center">
      <NewsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        article={selectedNews} 
      />
      
      <main className="w-full max-w-7xl">
        {/* Показываем главную новость и курсы только если нет поиска */}
        {!isLoading && !query && (
          <>
            <div className="pb-8">
              <MainNews onNewsClick={handleOpenNews} />
            </div>
            <CurrencyBar />
          </>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center h-64 text-2xl font-black text-white animate-pulse">
            ЗАГРУЗКА...
          </div>
        ) : (
          <div className="space-y-16">
            {clusters.map((cluster, idx) => (
              <NewsCluster 
                key={cluster.category}
                category={cluster.category} 
                news={cluster.news} 
                onNewsClick={handleOpenNews}
                index={idx}
              />
            ))}
          </div>
        )}

        {!isLoading && clusters.length === 0 && (
          <div className="py-20 text-xl italic font-bold text-center uppercase text-white/70">
            По вашему запросу новостей не нашлось
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;