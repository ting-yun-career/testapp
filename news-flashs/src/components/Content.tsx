import React from 'react';
import data from './data.json';

const Content: React.FC = () => {
  const [expandedItemId, setExpandedItemId] = React.useState<string | null>(
    null
  );

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
              <div className="flex-1 text-left cursor-pointer" onClick={() => handleMoreClick(item.id)}>
                <b>{item.title}</b> {item.summary}
                {expandedItemId === item.id && (
                  <p className="mt-2 text-sm">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Sed do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                    ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    Duis aute irure dolor in reprehenderit in voluptate velit
                    esse cillum dolore eu fugiat nulla pariatur. Excepteur
                    sint occaecat cupidatat non proident, sunt in culpa qui
                    officia deserunt mollit anim id est laborum.
                  </p>
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
          ))}
      </div>
    </>
  );
};

export default Content;
