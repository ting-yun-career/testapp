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
      className={`rounded-md transition-colors flex items-center gap-1 hover:bg-gray-700`}
      onClick={onClick}
      title={title}
    >
      <span className="material-symbols-outlined">{icon}</span>
      {text && <span className="text-sm inline-block">{text}</span>}
    </button>
  )
}

export default IconButton
