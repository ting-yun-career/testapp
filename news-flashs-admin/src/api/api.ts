import axios from 'axios';
import type { NewsItem } from '../types';

const API_URL = 'http://localhost:3000';

export const getNews = () => axios.get(`${API_URL}/news`);

export const createNews = (newsItem: NewsItem) =>
  axios.post(`${API_URL}/news`, newsItem);

export const updateNews = (id: string, newsItem: NewsItem) =>
  axios.put(`${API_URL}/news/${id}`, newsItem);

export const deleteNews = (id: string) => axios.delete(`${API_URL}/news/${id}`);
