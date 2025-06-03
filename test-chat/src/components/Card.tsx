import React, { useState, useRef } from 'react'
import type { ReactNode } from 'react'
import type { Card } from '../utils/siteDataTypes'
import { useDraggable } from '../hooks/useDraggable'
import IconButton from './Button/IconButton/IconButton'

interface CardProps {
  data: Card
  children: ReactNode
  onChange: (newCard: Card) => void
  onClose: (cardId: string) => void
}

const Card: React.FC<CardProps> = ({ data, children, onChange, onClose }) => {
  const [isMinimized, setIsMinimized] = useState(data.isMinimized)
  const [size, setSize] = useState(data.size)
  const [isResizing, setIsResizing] = useState(false)
  const sizeRef = useRef(data.size)

  const { position, handleMouseDown, handleMouseMove, handleMouseUp, style } = useDraggable({
    dragHandleClassName: 'card-header',
    initialPosition: data.position,
    onDragEnd: (position) => {
      onChange({
        ...data,
        position,
      })
    },
  })

  const handleMinimize = () => {
    setIsMinimized(!isMinimized)
    onChange({
      ...data,
      isMinimized,
    })
  }

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)

    const startX = e.clientX
    const startY = e.clientY
    const startWidth = size.width
    const startHeight = size.height

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX
      const deltaY = moveEvent.clientY - startY

      const newSize = {
        width: Math.max(200, startWidth + deltaX),
        height: Math.max(100, startHeight + deltaY),
      }

      setSize(newSize)
      sizeRef.current = newSize
    }

    const onMouseUp = () => {
      setIsResizing(false)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      onChange({
        ...data,
        size: sizeRef.current,
        position,
      })
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
        <h2 className="text-lg text-white select-none">{data.title}</h2>
        <div className="flex gap-1">
          <IconButton
            icon={isMinimized ? 'minimizeAlt' : 'minimize'}
            onClick={handleMinimize}
            title={isMinimized ? 'Maximize' : 'Minimize'}
          />
          <IconButton icon="close" onClick={() => onClose(data.id)} title="Close" />
        </div>
      </div>
      <div className={`flex-grow overflow-auto ${isMinimized ? 'hidden' : 'block'}`}>
        <div className="h-full">{children}</div>
      </div>
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-50 hover:opacity-100 transition-opacity"
        onMouseDown={startResize}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 3 3"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.3"
          className="w-full h-full text-gray-400"
        >
          <polygon points="2,2 2,0 0,2" />
        </svg>
      </div>
    </div>
  )
}

export default Card
