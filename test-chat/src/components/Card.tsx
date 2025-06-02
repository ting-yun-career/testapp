import React, { useState } from 'react'
import type { ReactNode } from 'react'
import { useDraggable } from '../hooks/useDraggable'
import IconButton from './Button/IconButton/IconButton'

interface CardProps {
  title: string
  children: ReactNode
  onClose?: () => void
}

const Card: React.FC<CardProps> = ({ title, children, onClose }) => {
  const [isMinimized, setIsMinimized] = useState(false)
  const [size, setSize] = useState({ width: 500, height: 300 })
  const [isResizing, setIsResizing] = useState(false)

  const { handleMouseDown, handleMouseMove, handleMouseUp, style } = useDraggable({
    dragHandleClassName: 'card-header',
  })

  const handleMinimize = () => {
    setIsMinimized(!isMinimized)
  }

  const startResize = (e: React.MouseEvent, direction: string) => {
    e.preventDefault()
    setIsResizing(true)

    const startX = e.clientX
    const startY = e.clientY
    const startWidth = size.width
    const startHeight = size.height

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX
      const deltaY = moveEvent.clientY - startY

      setSize({
        width: Math.max(200, startWidth + (direction.includes('e') ? deltaX : 0)),
        height: Math.max(100, startHeight + (direction.includes('s') ? deltaY : 0)),
      })
    }

    const onMouseUp = () => {
      setIsResizing(false)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  return (
    <div
      className={`fixed border-[1px] border-[#1a1a2a] rounded-md bg-[#2a2b2e] flex flex-col ${isResizing ? 'select-none' : ''}`}
      style={{
        ...style,
        width: `${size.width}px`,
        height: isMinimized ? 'auto' : `${size.height}px`,
        minWidth: '200px',
        minHeight: '100px',
        overflow: 'hidden',
      }}
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
          {onClose && <IconButton icon="close" onClick={onClose} title="Close" />}
        </div>
      </div>
      <div className={`flex-grow overflow-auto ${isMinimized ? 'hidden' : 'block'}`}>
        <div className="h-full overflow-y-scroll scrollbar-hide">{children}</div>
      </div>
      {/* Resize handle */}
      <div
        className="absolute bottom-3 right-3 w-3 h-3 cursor-se-resize opacity-50 hover:opacity-100 transition-opacity"
        onMouseDown={(e) => startResize(e, 'se')}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 3 3"
          fill="currentColor"
          className="w-full h-full text-gray-400"
        >
          <polygon points="3,3 3,0 0,3" fill="currentColor" />
        </svg>
      </div>
    </div>
  )
}

export default Card
