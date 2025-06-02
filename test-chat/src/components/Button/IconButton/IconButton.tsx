import React from 'react';
import { icons } from './icons';
import type { IconName } from './icons';

interface IconButtonProps {
  icon: IconName;
  text?: string;
  onClick?: () => void;
  variant?: 'default' | 'primary';
}

const IconButton: React.FC<IconButtonProps> = ({
  icon,
  text,
  onClick,
  variant = 'default',
}) => {
  const baseClasses =
    'p-2 rounded-md transition-colors flex items-center gap-2';
  const variantClasses = {
    default: 'hover:bg-gray-700',
    primary: 'bg-indigo-500 hover:bg-indigo-600',
  };

  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${text ? 'px-4 py-1.5' : ''}`;
  const iconData = icons[icon];

  return (
    <button className={buttonClasses} onClick={onClick}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={text ? 'w-4 h-4' : 'w-5 h-5'}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        {Array.isArray(iconData.path) ? (
          iconData.path.map((path, index) => (
            <path
              key={index}
              strokeLinecap="round"
              strokeLinejoin="round"
              d={path}
            />
          ))
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d={iconData.path}
          />
        )}
      </svg>
      {text && <span className="text-sm">{text}</span>}
    </button>
  );
};

export default IconButton;
