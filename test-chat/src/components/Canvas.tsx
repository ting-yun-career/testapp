import React, { useState, useEffect } from 'react'
import type { ReactNode, WheelEvent } from 'react'
import type { Position } from '../utils/siteDataTypes'
import HeaderFloatingBar from './HeaderFloatingBar'

declare global {
  interface Window {
    __CANVAS_OFFSET__: Position
  }
}

const SCROLLING_STEP = 16
const SCROLLING_SPEED = 3

interface CanvasProps {
  children: ReactNode
  initialOffset: Position
  status?: string
  onOffsetChange?: (offset: Position) => void
}
export const Canvas: React.FC<CanvasProps> = ({ children, initialOffset, status, onOffsetChange }) => {
  const [offset, setOffset] = useState<Position>(initialOffset)

  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    const newOffset = (prev: Position) => {
      let newX = prev.x
      let newY = prev.y

      const directionX = e.deltaY < 0 ? -1 : 1
      const directionY = e.deltaY < 0 ? -1 : 1

      if (e.shiftKey) {
        newX -= directionX * SCROLLING_STEP * SCROLLING_SPEED
      } else {
        newY -= directionY * SCROLLING_STEP * SCROLLING_SPEED
      }

      return { x: newX, y: newY }
    }

    setOffset((prev) => {
      const updatedOffset = newOffset(prev)
      onOffsetChange?.(updatedOffset)
      return updatedOffset
    })
  }

  useEffect(() => {
    window.__CANVAS_OFFSET__ = offset
  }, [offset])

  return (
    <div
      className="fixed inset-0 overflow-hidden bg-[#121212] border border-white"
      onWheel={handleWheel}
      style={{ touchAction: 'none' }}
    >
      <HeaderFloatingBar />
      <div
        className="absolute"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px)`,
        }}
      >
        {children}
      </div>
      {status && (
        <div className="fixed bottom-1 left-1 bg-[#1e1e1e] bg-opacity-50 text-gray-400 px-2 py-0 text-sm">{status}</div>
      )}
    </div>
  )
}
