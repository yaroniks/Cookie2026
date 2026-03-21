import type { NewsItem } from '../api/news';

export const groupNewsByCategory = (news: NewsItem[]) => {
  const groups: { [key: string]: NewsItem[] } = {};
  
  news.forEach((item) => {
    if (!groups[item.category]) {
      groups[item.category] = [];
    }
    groups[item.category].push(item);
  });

  return Object.keys(groups).map((category, index) => ({
    id: index,
    category: category,
    news: groups[category]
  }));
};