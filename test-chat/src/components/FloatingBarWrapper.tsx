import React from 'react'

interface FloatingBarWrapperProps {
  children: React.ReactNode
  position: 'top' | 'bottom'
}

const FloatingBarWrapper: React.FC<FloatingBarWrapperProps> = ({ children, position }) => {
  const positionClass = position === 'top' ? 'top-8' : 'bottom-8'
  return (
    <div
      className={`absolute ${positionClass} left-1/2 -translate-x-1/2 min-w-[500px] bg-[#1e1e1e] rounded-lg p-2 shadow-lg flex items-center gap-2 border border-gray-800 z-50`}
    >
      {children}
    </div>
  )
}

export default FloatingBarWrapper
