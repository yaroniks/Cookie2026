import api from '../lib/axios';

export interface NewsItem {
  id?: number;
  source: string;
  author?: string;
  title: string;
  description: string | null;
  link: string;
  date: string;
  image: string | null;
  category: string;
  cluster_id?: number;
}

export const fetchNews = async (): Promise<NewsItem[]> => {
  const response = await api.get<NewsItem[]>('/news/');
  return response.data;
};

export const searchNews = async (query: string): Promise<NewsItem[]> => {
  const response = await api.post<NewsItem[]>(`/news/search/${encodeURIComponent(query)}`, {});
  return response.data;
};