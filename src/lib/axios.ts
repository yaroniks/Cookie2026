import axios from 'axios';

const api = axios.create({
  baseURL: 'https://spark-news.ru/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;