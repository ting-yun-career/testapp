import React from 'react';
import data from './data.json';

const Content: React.FC = () => {
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

  const selectedTags = [
    'business',
    'technology',
    'science',
    'health',
    'sports',
  ];

  return (
    <>
      <div className="pt-3 pb-2 flex items-center gap-4 px-2 justify-center">
        {selectedTags.map((tag, index) => (
          <a href="#" key={index} className="text-blue-500 underline text-xs">
            #{tag}
          </a>
        ))}
      </div>
      <div className="columns-1 md:columns-2 lg:columns-3 gap-0 px-1">
        {[...data]
          .sort((a, b) => a.daysAgo - b.daysAgo)
          .map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-1 py-2 min-h-12 break-inside-avoid"
            >
              <div className="flex-none flex items-center justify-center">
                <div
                  className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold mr-1 ${getBorderColorClass(item.daysAgo)}`}
                >
                  <span className={getTextColorClass(item.daysAgo)}>
                    {item.daysAgo}
                  </span>
                </div>
              </div>
              <div className="flex-1 text-left">
                <b>{item.title}</b> {item.summary}
                <div className="flex flex-wrap gap-2 mt-1">
                  {item.tags.map((tag, index) => (
                    <a
                      href="#"
                      key={index}
                      className="text-blue-500 !underline text-xs"
                    >
                      #{tag}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ))}
      </div>
    </>
  );
};

export default Content;
