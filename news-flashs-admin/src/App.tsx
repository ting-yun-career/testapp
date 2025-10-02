import React, { useState, useEffect } from 'react';
import NewsList from './components/NewsList';
import NewsForm from './components/NewsForm';
import { getNews, createNews, updateNews, deleteNews } from './api/api';
import type { NewsItem } from './types.d';

const App: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [isFormVisible, setIsFormVisible] = useState<boolean>(false);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async (): Promise<void> => {
    const response = await getNews();
    setNews(response.data);
  };

  const handleSave = async (newsItem: Omit<NewsItem, 'id'>): Promise<void> => {
    if (selectedNews) {
      await updateNews(selectedNews.id, newsItem);
    } else {
      await createNews(newsItem);
    }
    fetchNews();
    setSelectedNews(null);
    setIsFormVisible(false);
  };

  const handleEdit = (newsItem: NewsItem): void => {
    setSelectedNews(newsItem);
    setIsFormVisible(true);
  };

  const handleDelete = async (id: string): Promise<void> => {
    await deleteNews(id);
    fetchNews();
  };

  const handleCancel = (): void => {
    setSelectedNews(null);
    setIsFormVisible(false);
  };

  const handleAddNew = (): void => {
    setSelectedNews(null);
    setIsFormVisible(true);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-black mb-4">News Flash Admin</h1>
      <div className="mb-4">
        <button
          onClick={handleAddNew}
          className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          Add News
        </button>
      </div>
      {isFormVisible && (
        <div className="mb-4">
          <NewsForm
            selectedNews={selectedNews}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      )}
      <NewsList news={news} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
};

export default App;
