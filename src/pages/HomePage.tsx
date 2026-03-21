import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import NewsCluster from '../components/NewsCluster';
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

        const grouped = groupNewsByCategory(data) as unknown as ClusterData[];
        setClusters(grouped);
      } catch (err) {
        console.error("Ошибка загрузки новостей:", err);
        setClusters([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [query, categoryParam]);

  const handleOpenNews = (newsItem: NewsItem) => {

    const mapType = (label: string): Entity['type'] => {
      switch (label) {
        case 'PER': return 'person';
        case 'LOC': return 'location';
        case 'ORG': return 'organization';
        default: return 'event';
      }
    };


    const uniqueEntities = Array.from(
      new Map(newsItem.entities?.map(e => [e.text, e])).values()
    );

    setSelectedNews({
      title: newsItem.title,
      excerpt: newsItem.description || "",
      time: newsItem.date,
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
    <div className="bg-[#a5bef4] min-h-screen py-10 px-4">
      <NewsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        article={selectedNews} 
      />
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
              news={cluster.news} 
              onNewsClick={handleOpenNews}
            />
          ))
        )}
      </main>
    </div>
  );
};

export default HomePage;