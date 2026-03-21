import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import NewsCluster, { type SimpleNewsItem } from '../components/NewsCluster';
import { fetchNews, searchNews, type NewsItem } from '../api/news';
import { groupNewsByCategory } from '../utils/newsUtils';
import NewsModal from '../components/NewsModal';
import type { NewsDetail, Entity } from '../components/NewsModal';

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
        setClusters(groupNewsByCategory(data) as unknown as ClusterData[]);
      } catch (err) {
        console.error(err);
        setClusters([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [query, categoryParam]);

  const handleOpenNews = (newsItem: SimpleNewsItem) => {
    const mockEntities: Entity[] = [
      { name: 'Илон Маск', type: 'person' },
      { name: 'Уфа', type: 'location' },
      { name: 'SpaceX', type: 'organization' },
      { name: 'Событие дня', type: 'event' }
    ];

    setSelectedNews({
      title: newsItem.title,
      excerpt: newsItem.excerpt,
      time: newsItem.time,
      imageUrl: newsItem.imageUrl,
      source: 'SparkNews',
      entities: mockEntities.sort(() => 0.5 - Math.random()).slice(0, 3)
    });
    setIsModalOpen(true);
  };

  return (
    <div className="bg-[#a5bef4] min-h-screen py-10 px-4">
      <NewsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} article={selectedNews} />
      <main className="mx-auto max-w-7xl">
        {isLoading ? (
          <div className="flex items-center justify-center h-64 text-2xl font-black text-white animate-pulse">
            ЗАГРУЖАЕМ НОВОСТИ...
          </div>
        ) : (
          clusters.map((cluster) => (
            <NewsCluster 
              key={cluster.category}
              category={cluster.category} 
              news={cluster.news.map(n => ({
                title: n.title,
                excerpt: n.description || "", 
                time: n.date,
                imageUrl: n.image || undefined 
              }))} 
              onNewsClick={handleOpenNews}
            />
          ))
        )}
      </main>
    </div>
  );
};

export default HomePage;