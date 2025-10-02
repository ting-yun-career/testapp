import React, { useState, useEffect } from 'react';
import NewsList from './components/NewsList';
import { getNews } from './api/api';
import type { NewsItem } from './types.d';

const App: React.FC = () => {
  const [newsItems, setNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async (): Promise<void> => {
    const response = await getNews();
    setNews(response.data);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-black mb-4">News Flash Admin</h1>
      <div className="mb-4">
        <button className="text-xs bg-green-600 text-white px-3 py-2 rounded">
          Refresh
        </button>
      </div>
      <NewsList newsItems={newsItems} />
    </div>
  );
};

export default App;
