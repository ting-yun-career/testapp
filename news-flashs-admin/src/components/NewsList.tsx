import React from 'react';

const NewsList = ({ news, onEdit, onDelete }) => {
  return (
    <ul className="divide-y divide-gray-200">
      {news.map((item) => (
        <li key={item.id} className="py-4">
          <div className="flex space-x-3">
            <div className="flex-1 space-y-1">
              {console.log(item)}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-black">{item.title}</h3>
              </div>
              <p className="text-sm text-black">{item.summary}</p>
              <p className="text-sm text-gray-500">
                Tags: {item.tags.join(', ')}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => onEdit(item)}
                className="rounded-md border px-2 py-2 text-sm font-medium text-black"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="rounded-md border px-2 py-2 text-sm font-medium text-black"
              >
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
