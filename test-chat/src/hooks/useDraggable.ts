import { useState, useRef } from 'react'
import type { MouseEvent } from 'react'
import type { Position } from '../utils/siteDataTypes'
import { useSiteData } from '../contexts/useSiteData'

interface UseDraggableOptions {
  dragHandleClassName: string
  onDragEnd: (position: Position) => void
  initialPosition?: Position
  id?: string
}

interface UseDraggableReturn {
  position: Position
  isDragging: boolean
  handleMouseDown: (e: MouseEvent) => void
  handleMouseMove: (e: MouseEvent) => void
  handleMouseUp: () => void
  style: {
    transform: string
    cursor: string
  }
}

export function useDraggable(options: UseDraggableOptions): UseDraggableReturn {
  const { siteData } = useSiteData()
  const [position, setPosition] = useState<Position>(options.initialPosition || { x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragOffset = useRef<Position>({ x: 0, y: 0 })

  const handleMouseDown = (e: MouseEvent) => {
    if (options.dragHandleClassName) {
      if (!(e.target as HTMLElement).closest(`.${options.dragHandleClassName}`)) {
        return
      }
    }

    setIsDragging(true)

    const canvasOffset = siteData.canvasOffset || { x: 0, y: 0 }
    dragOffset.current = {
      x: e.clientX - position.x + canvasOffset.x,
      y: e.clientY - position.y + canvasOffset.y,
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const canvasOffset = siteData.canvasOffset || { x: 0, y: 0 }
      const newX = e.clientX - dragOffset.current.x + canvasOffset.x
      const newY = e.clientY - dragOffset.current.y + canvasOffset.y

      setPosition({
        x: newX,
        y: newY,
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    options.onDragEnd(position)
  }

  return {
    position,
    isDragging,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    style: {
      transform: `translate(${position.x}px, ${position.y}px)`,
      cursor: isDragging ? 'grabbing' : 'grab',
    },
  }
}
