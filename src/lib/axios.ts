import axios from 'axios';

//http://localhost:8000/api/v1

const api = axios.create({
  baseURL: 'https://spark-news.ru/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;