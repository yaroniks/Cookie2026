import api from '../lib/axios';

export interface EntityFromAPI {
  text: string;
  label: 'PER' | 'LOC' | 'ORG' | string;
}

export interface NewsItem {
  source: string;
  author?: string;
  title: string;
  description: string | null;
  link: string;
  date: string;
  image: string | null;
  category: string;
  entities: EntityFromAPI[];
}

export const fetchNews = async (): Promise<NewsItem[]> => {
  const response = await api.get<NewsItem[]>('/news/');
  return response.data;
};

export const searchNews = async (query: string): Promise<NewsItem[]> => {
  const response = await api.post<NewsItem[]>(`/news/search/${encodeURIComponent(query)}`, {});
  return response.data;
};

export const fetchMainNews = async (): Promise<NewsItem | null> => {
  try {
    const response = await api.get<NewsItem>('/news/main');
    return response.data;
  } catch (error) {
    console.error("Ошибка загрузки главной новости:", error);
    return null;
  }
};