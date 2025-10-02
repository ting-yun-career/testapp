import React from 'react';
import type { NewsItem } from '../types.d';

interface NewsListProps {
  newsItems: NewsItem[];
}

const NewsList: React.FC<NewsListProps> = ({ newsItems }) => {
  return (
    <ul className="divide-y divide-gray-200">
      {newsItems.map(({ id, title, summary, tags }) => (
        <li key={id} className="mb-4 text-gray-500 last:mb-0">
          <div className="flex space-x-3">
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">{title}</h3>
              </div>
              <p className="text-sm text-gray-500">{summary}</p>
              <p className="text-sm text-gray-500">
                Tags: <span className="font-semibold">{tags.join(', ')}</span>
              </p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default NewsList;
