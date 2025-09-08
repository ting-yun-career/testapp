import React from 'react';

const Content: React.FC = () => {
  return (
    <div className="columns-1 md:columns-2 lg:columns-3 gap-0">
      <div className="">
        {Array.from({ length: 100 }, (_, i) => (
          <div key={i} className="flex items-center gap-2 px-1 py-1">
            <div className="flex-none">
              <div className="flex-none flex items-center justify-center">
                <span className="material-symbols-outlined w-6 h-6">
                  radio_button_unchecked
                </span>
              </div>
            </div>
            <div className="flex-1 text-left">item {i + 1}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Content;
