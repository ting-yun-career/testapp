import React from 'react';
import { NewsItem } from '../types';

interface NewsListProps {
  news: NewsItem[];
  onEdit: (newsItem: NewsItem) => void;
  onDelete: (id: string) => void;
}

const NewsList: React.FC<NewsListProps> = ({ news, onEdit, onDelete }) => {
  return (
    <ul className="divide-y divide-gray-200">
      {news.map((item) => (
        <li key={item.id} className="py-4">
          <div className="flex space-x-3">
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">{item.title}</h3>
              </div>
              <p className="text-sm text-gray-500">{item.content}</p>
              <p className="text-sm text-gray-500">Tags: {item.tags.join(', ')}</p>
            </div>
            <div className="flex space-x-2">
              <button onClick={() => onEdit(item)} className="rounded-md bg-yellow-500 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-600">
                Edit
              </button>
              <button onClick={() => onDelete(item.id)} className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
                Delete
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default NewsList;
