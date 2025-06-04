import React from 'react'
import IconButton from './Button/IconButton/IconButton'

const HeaderFloatingBar: React.FC = () => {
  return (
    <div className="absolute top-8 left-1/2 -translate-x-1/2 min-w-[500px] bg-[#1e1e1e] rounded-lg p-2 shadow-lg flex items-center gap-2 border border-gray-800 z-50">
      <IconButton icon="menu" text="Menu" />
    </div>
  )
}

export default HeaderFloatingBar
