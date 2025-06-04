import React from 'react'

// do not use variant prop
interface IconButtonProps {
  icon: string
  text?: string
  title?: string
  onClick?: () => void
}

const IconButton: React.FC<IconButtonProps> = ({ icon, text, title, onClick }) => {
  const buttonClasses = `p-1 rounded-md transition-colors flex items-center gap-1 hover:bg-gray-700`

  return (
    <button className={buttonClasses} onClick={onClick} title={title}>
      <span className="material-symbols-outlined">{icon}</span>
      {text && <span className="text-sm inline-block">{text}</span>}
    </button>
  )
}

export default IconButton
