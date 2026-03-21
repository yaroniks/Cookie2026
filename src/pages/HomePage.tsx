import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import NewsCluster from '../components/NewsCluster';
import { fetchNews, searchNews, type NewsItem } from '../api/news';
import { groupNewsByCategory } from '../utils/newsUtils';

interface ClusterData {
  id: number;
  category: string;
  news: NewsItem[];
}

const HomePage: React.FC = () => {
  const [clusters, setClusters] = useState<ClusterData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams] = useSearchParams();
  
  const query = searchParams.get('search');

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        let data: NewsItem[];
        
        if (query) {
          data = await searchNews(query);
        } else {
          data = await fetchNews();
        }
        
        const grouped = groupNewsByCategory(data);
        setClusters(grouped);
      } catch (err) {
        console.error("Ошибка при получении данных:", err);
        setClusters([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [query]);

  return (
    <div className="bg-[#a5bef4] min-h-screen py-10 px-4 sm:px-6">
      <main className="max-w-7xl mx-auto">
        
        {query && (
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-white text-xl font-bold">
              Результаты поиска: <span className="text-[#003289]">«{query}»</span>
            </h2>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-white text-2xl font-black animate-pulse uppercase tracking-tighter">
              Загружаем новости...
            </div>
          </div>
        ) : clusters.length > 0 ? (
          clusters.map((cluster) => (
            <NewsCluster 
              key={cluster.id} 
              category={cluster.category} 
              news={cluster.news.map((n, idx) => ({
                id: n.id || idx, 
                title: n.title,
                excerpt: n.description || "", 
                time: n.date,
                imageUrl: n.image || undefined 
              }))} 
            />
          ))
        ) : (
          <div className="text-center bg-white/20 backdrop-blur-md rounded-3xl p-16 border border-white/30 shadow-xl max-w-2xl mx-auto mt-10">
            <h3 className="text-white text-3xl font-black mb-4">ПУСТО</h3>
            <p className="text-white/80 text-lg">По вашему запросу ничего не найдено.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;