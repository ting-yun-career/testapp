import React from 'react';

const HeaderFloatingBar: React.FC = () => {
  return (
    <div className="absolute top-8 left-1/2 -translate-x-1/2 min-w-[500px] bg-[#1e1e1e] rounded-lg p-2 shadow-lg flex items-center gap-2 border border-gray-800 z-50">
      <button className="p-2 hover:bg-gray-700 rounded-md transition-colors">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      <div className="flex items-center gap-2 mx-auto">
        <button className="p-2 hover:bg-gray-700 rounded-md transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        </button>
        <button className="p-2 hover:bg-gray-700 rounded-md transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
        <button className="p-2 hover:bg-gray-700 rounded-md transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          </svg>
        </button>
        <button className="p-2 hover:bg-gray-700 rounded-md transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button className="px-4 py-1.5 bg-indigo-500 hover:bg-indigo-600 rounded-md transition-colors text-sm">
          Share
        </button>
        <button className="px-4 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors text-sm flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
          Library
        </button>
      </div>
    </div>
  );
};

export default HeaderFloatingBar;
