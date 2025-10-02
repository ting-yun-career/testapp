import axios from 'axios';

const API_URL = 'http://localhost:3000';

export const getNews = () => axios.get(`${API_URL}/news`);

export const createNews = (newsItem: any) => axios.post(`${API_URL}/news`, newsItem);

export const updateNews = (id: string, newsItem: any) => axios.put(`${API_URL}/news/${id}`, newsItem);

export const deleteNews = (id: string) => axios.delete(`${API_URL}/news/${id}`);
