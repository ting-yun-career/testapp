import React, { useState, useEffect } from 'react';
import NewsList from './components/NewsList';
import { getNews, deleteNews } from './api/api';
import type { NewsItem } from './types.d';

const App: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async (): Promise<void> => {
    const response = await getNews();
    setNews(response.data);
  };

  const handleDelete = async (id: string): Promise<void> => {
    await deleteNews(id);
    fetchNews();
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-black mb-4">News Flash Admin</h1>
      <NewsList news={news} onDelete={handleDelete} />
    </div>
  );
};

export default App;
