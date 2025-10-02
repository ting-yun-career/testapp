import React from 'react';
import type { NewsItem } from '../types.d';

interface NewsListProps {
  news: NewsItem[];
  onDelete: (id: string) => void;
}

const NewsList: React.FC<NewsListProps> = ({ news, onDelete }) => {
  return (
    <ul className="divide-y divide-gray-200">
      {news.map((item) => (
        <li key={item.id} className="py-4 text-gray-500">
          <div className="flex space-x-3">
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">{item.title}</h3>
              </div>
              <p className="text-sm text-gray-500">{item.summary}</p>
              <p className="text-sm text-gray-500">
                Tags:{' '}
                <span className="font-semibold">{item.tags.join(', ')}</span>
              </p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default NewsList;
