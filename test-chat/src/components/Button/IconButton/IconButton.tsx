import React from 'react'

interface IconButtonProps {
  icon: string
  text?: string
  title?: string
  onClick?: () => void
}

const IconButton: React.FC<IconButtonProps> = ({ icon, text, title, onClick }) => {
  return (
    <button
      className="rounded-md transition-colors flex items-center gap-1 hover:bg-gray-700 rounded-sm px-1"
      onClick={onClick}
      title={title}
    >
      <span className="material-symbols-outlined !text-xl">{icon}</span>
      {text && <span className="inline-block text-sm">{text}</span>}
    </button>
  )
}

export default IconButton
