import React from 'react';
import data from './data.json';

const Content: React.FC = () => {
  return (
    <>
      <div className="hidden md:block my-1">topper</div>
      <div className="columns-1 md:columns-2 lg:columns-3 gap-0">
        <div className="">
          {data.map((item, i) => (
            <div key={i} className="flex items-center gap-2 px-1 py-1 min-h-12">
              <div className="flex-none flex items-center justify-center">
                <span className="material-symbols-outlined">
                  radio_button_unchecked
                </span>
              </div>
              <div className="flex-1 text-left">
                <b>
                  ({item.daysAgo} days) {item.title}
                </b>{' '}
                {item.summary}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Content;
