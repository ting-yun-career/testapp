import React from 'react';

type IconDefinition = {
  path: string | string[];
};

export const icons: Record<string, IconDefinition> = {
  menu: {
    path: 'M4 6h16M4 12h16M4 18h16',
  },
  eye: {
    path: [
      'M15 12a3 3 0 11-6 0 3 3 0 016 0z',
      'M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
    ],
  },
  plus: {
    path: 'M12 4v16m8-8H4',
  },
  square: {
    path: 'M3 3h18v18H3z',
  },
  circle: {
    path: 'M12 12m-10 0a10 10 0 1 0 20 0a10 10 0 1 0 -20 0',
  },
  share: {
    path: 'M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13',
  },
} as const;

export type IconName = keyof typeof icons;

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
