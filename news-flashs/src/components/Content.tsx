import React from 'react';

const Content: React.FC = () => {
  return (
    <div className="columns-1 md:columns-2 lg:columns-3 gap-0">
      <div className="">
        {Array.from({ length: 100 }, (_, i) => (
          <div key={i} className="p-2">item {i + 1}</div>
        ))}
      </div>
    </div>
  );
};

export default Content;
