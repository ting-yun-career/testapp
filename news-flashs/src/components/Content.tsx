import React, { useState, useEffect } from 'react';
import { getTags, getNewsByHashtag } from '../api/api';

// Define the type for a news item
interface NewsItem {
  id: string;
  title: string;
  summary: string;
  fullContent: string;
  daysAgo: number;
  tags: string[];
}

const Content: React.FC = () => {
  const [expandedItemId, setExpandedItemId] = React.useState<string | null>(
    null
  );
  const [news, setNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const hashtags = [
          'business',
          'technology',
          'science',
          'health',
          'sports',
        ];
        const data = await getNewsByHashtag(hashtags);
        setNews(data);
      } catch (error) {
        console.error('Error fetching news:', error);
      }
    };

    fetchNews();
  }, []);

  const handleMoreClick = (id: string) => {
    setExpandedItemId(expandedItemId === id ? null : id); // Toggle expanded state
  };

  const getTextColorClass = (days: number) => {
    if (days === 1) return 'text-red-500';
    if (days === 2) return 'text-orange-500';
    if (days === 3) return 'text-amber-800';
    return 'text-black';
  };

  const getBorderColorClass = (days: number) => {
    if (days === 1) return 'border-red-500';
    if (days === 2) return 'border-orange-500';
    if (days === 3) return 'border-amber-800';
    return 'border-black';
  };

  // get all tags by getAllTags
  // useEffect to fetch tags
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const tags = await getTags();
        setSelectedTags(tags);
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    };

    fetchTags();
  }, []);

  const sortedData = [...news].sort((a, b) => a.daysAgo - b.daysAgo);

  const renderNewsItem = (item: NewsItem) => (
    <div key={item.id} className="flex items-center gap-2 px-1 py-2">
      <div className="flex-none flex items-center justify-center">
        <div
          className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold mr-1 ${getBorderColorClass(item.daysAgo)}`}
        >
          <span className={getTextColorClass(item.daysAgo)}>
            {item.daysAgo}
          </span>
        </div>
      </div>
      <div
        className="flex-1 text-left cursor-pointer"
        onClick={() => handleMoreClick(item.id)}
      >
        <b>{item.title}</b> {item.summary}
        {expandedItemId === item.id && (
          <p className="mt-2 text-sm">{item.fullContent}</p>
        )}
        <span className="text-blue-500 text-xs ml-1">
          {expandedItemId === item.id ? 'Collapse' : 'Expand'}
        </span>
        <div className="flex flex-wrap gap-2 mt-1">
          {item.tags.map((tag, index) => (
            <a
              href="#"
              key={index}
              className="text-blue-500 !underline text-xs"
              onClick={(e) => e.stopPropagation()}
            >
              #{tag}
            </a>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="pt-3 pb-2 flex items-center gap-4 px-2 justify-center">
        {selectedTags.map((tag, index) => (
          <a href="#" key={index} className="text-blue-500 underline text-xs">
            #{tag}
          </a>
        ))}
      </div>
      <div className="flex flex-col md:hidden gap-4 px-1">
        <div className="flex-1 flex flex-col gap-4">
          {sortedData.map(renderNewsItem)}
        </div>
      </div>
      <div className="flex flex-col md:flex-row lg:hidden gap-4 px-1">
        <div className="flex-1 flex flex-col gap-4">
          {sortedData.filter((_, index) => index % 2 === 0).map(renderNewsItem)}
        </div>
        <div className="flex-1 flex flex-col gap-4 hidden md:flex">
          {sortedData.filter((_, index) => index % 2 === 1).map(renderNewsItem)}
        </div>
      </div>
      <div className="flex flex-col md:flex-row lg:flex-row gap-4 px-1">
        <div className="flex-1 flex flex-col gap-4">
          {sortedData.filter((_, index) => index % 3 === 0).map(renderNewsItem)}
        </div>

        <div className="flex-1 flex flex-col gap-4 hidden md:flex">
          {sortedData.filter((_, index) => index % 3 === 1).map(renderNewsItem)}
        </div>

        <div className="flex-1 flex flex-col gap-4 hidden lg:flex">
          {sortedData.filter((_, index) => index % 3 === 2).map(renderNewsItem)}
        </div>
      </div>
    </>
  );
};

export default Content;
