import React, { useState } from 'react'
import type { ReactNode, WheelEvent } from 'react'
import type { Position } from '../utils/siteDataTypes'
import { useSiteData } from '../contexts/useSiteData'
import HeaderFloatingBar from './HeaderFloatingBar'
import FooterFloatingBar from './FooterFloatingBar'

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
  const { siteData, toggleWidgetPanel } = useSiteData()

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

  return (
    <div
      className="fixed inset-0 overflow-hidden bg-[#121212] border border-white"
      onWheel={handleWheel}
      style={{ touchAction: 'none' }}
    >
      <HeaderFloatingBar />

      <div
        className="fixed left-0 top-0 bottom-0 bg-[#080811] border-r border-white transition-all duration-300 ease-in-out z-20"
        style={{ width: siteData.widgetPanel.isOpen ? '250px' : '0' }}
      >
        <div
          className="absolute top-0 left-[calc(100%)] cursor-pointer hover:text-[orange] p-2 bg-[#080811] border-[#e1e1e1] border-b border-r border-[#080811]"
          onClick={toggleWidgetPanel}
        >
          <span className="material-symbols-outlined mt-1 !text-4xl" title="Toggle Widget Panel">
            shelf_auto_hide
          </span>
        </div>
        {/* Content of your flyout panel */}
      </div>

      <div
        className="absolute"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px)`,
        }}
      >
        {children}
      </div>

      <FooterFloatingBar />

      {status && (
        <div className="fixed bottom-1 left-1 bg-[#1e1e1e] bg-opacity-50 text-gray-400 px-2 py-0 text-sm">{status}</div>
      )}
    </div>
  )
}
