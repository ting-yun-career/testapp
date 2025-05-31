import React, { useState } from 'react';
import type { ReactNode } from 'react';

interface CardActionButtonProps {
  onClick: () => void;
  title: string;
  svgPath: ReactNode;
}

const CardActionButton: React.FC<CardActionButtonProps> = ({
  onClick,
  title,
  svgPath,
}) => {
  return (
    <button
      onClick={onClick}
      className="p-1 bg-slate-800 hover:bg-slate-700 hover:cursor-pointer rounded"
      title={title}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4 text-white"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        {svgPath}
      </svg>
    </button>
  );
};

interface CardProps {
  title: string;
  children: ReactNode;
  onClose?: () => void;
}

const Card: React.FC<CardProps> = ({ title, children, onClose }) => {
  const [isMinimized, setIsMinimized] = useState(false);

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <div className="min-w-xl max-w-2xl mx-auto my-8 border-[1px] border-[#1a1a2a] rounded-md overflow-hidden bg-[#2a2b2e]">
      <div className="flex justify-between items-center px-4 py-2 bg-[#323337]">
        <h2 className="font-semibold text-lg text-white">{title}</h2>
        <div className="flex gap-2">
          <CardActionButton
            onClick={handleMinimize}
            title={isMinimized ? 'Maximize' : 'Minimize'}
            svgPath={
              isMinimized ? (
                <path
                  fillRule="evenodd"
                  d="M3 7a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 13a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              ) : (
                <path
                  fillRule="evenodd"
                  d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              )
            }
          />
          {onClose && (
            <CardActionButton
              onClick={onClose}
              title="Close"
              svgPath={
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              }
            />
          )}
        </div>
      </div>
      <div className={`transition-all duration-300`}>
        {!isMinimized && children}
      </div>
    </div>
  );
};

export default Card;
