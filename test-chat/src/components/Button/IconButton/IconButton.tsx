import React from 'react'

type IconDefinition = {
  path: string | string[]
}

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
  minimize: {
    path: 'M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z',
  },
  minimizeAlt: {
    path: 'M5 10h14M5 14h14',
  },
  close: {
    path: 'M6 6l12 12M6 18l12-12',
  },
} as const

export type IconName = keyof typeof icons

// do not use variant prop
interface IconButtonProps {
  icon: IconName
  text?: string
  title?: string
  onClick?: () => void
}

const IconButton: React.FC<IconButtonProps> = ({ icon, text, title, onClick }) => {
  const buttonClasses = `p-1 rounded-md transition-colors flex items-center gap-1 hover:bg-gray-700`
  const iconData = icons[icon]

  return (
    <button className={buttonClasses} onClick={onClick} title={title}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`w-4 h-4 `}
        viewBox="0 0 25 25"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      >
        {Array.isArray(iconData.path) ? (
          iconData.path.map((path, index) => <path key={index} strokeLinecap="round" strokeLinejoin="round" d={path} />)
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d={iconData.path} />
        )}
      </svg>
      {text && <span className="text-sm inline-block">{text}</span>}
    </button>
  )
}

export default IconButton
