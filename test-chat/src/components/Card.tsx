import React, { useState } from 'react';
import type { ReactNode } from 'react';
import { useDraggable } from '../hooks/useDraggable';
import IconButton from './Button/IconButton/IconButton';

interface CardProps {
  title: string;
  children: ReactNode;
  onClose?: () => void;
}

const Card: React.FC<CardProps> = ({ title, children, onClose }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const { handleMouseDown, handleMouseMove, handleMouseUp, style } =
    useDraggable({
      dragHandleClassName: 'card-header',
    });

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <div
      className="fixed min-w-xl max-w-2xl border-[1px] border-[#1a1a2a] rounded-md overflow-hidden bg-[#2a2b2e]"
      style={style}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="card-header flex justify-between items-center px-4 py-2 bg-[#323337] cursor-grab active:cursor-grabbing">
        <h2 className="text-lg text-white select-none">{title}</h2>
        <div className="card-actions">
          <IconButton
            icon={isMinimized ? 'minimizeAlt' : 'minimize'}
            onClick={handleMinimize}
            title={isMinimized ? 'Maximize' : 'Minimize'}
          />
          {onClose && (
            <IconButton icon="close" onClick={onClose} title="Close" />
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
