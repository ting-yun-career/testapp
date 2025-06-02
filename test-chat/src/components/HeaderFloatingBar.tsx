import React from 'react';
import IconButton from './IconButton';

const HeaderFloatingBar: React.FC = () => {
  return (
    <div className="absolute top-8 left-1/2 -translate-x-1/2 min-w-[500px] bg-[#1e1e1e] rounded-lg p-2 shadow-lg flex items-center gap-2 border border-gray-800 z-50">
      <IconButton icon="menu" />

      <div className="flex items-center gap-2 mx-auto">
        <IconButton icon="eye" />
        <IconButton icon="plus" />
        <IconButton icon="square" />
        <IconButton icon="circle" />
      </div>

      <div className="flex items-center gap-2">
        <IconButton text="Share" variant="primary" icon="share" />
        <IconButton text="Library" icon="menu" />
      </div>
    </div>
  );
};

export default HeaderFloatingBar;
