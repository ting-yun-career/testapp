import { useState, useRef } from 'react'
import type { MouseEvent } from 'react'
import type { Position } from '../utils/siteDataTypes'

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
  const [position, setPosition] = useState<Position>(options.initialPosition || { x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragOffset = useRef<Position>({ x: 0, y: 0 })

  const startingPosition = useRef<Position>({ x: 0, y: 0 })
  const finalPosition = useRef<Position>({ x: 0, y: 0 })

  const handleMouseDown = (e: MouseEvent) => {
    if (options.dragHandleClassName) {
      if (!(e.target as HTMLElement).closest(`.${options.dragHandleClassName}`)) {
        return
      }
    }

    setIsDragging(true)
    const canvasOffset = window.__CANVAS_OFFSET__ || { x: 0, y: 0 }
    dragOffset.current = {
      x: e.clientX - position.x + canvasOffset.x,
      y: e.clientY - position.y + canvasOffset.y,
    }

    startingPosition.current = {
      x: e.clientX,
      y: e.clientY,
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const canvasOffset = window.__CANVAS_OFFSET__ || { x: 0, y: 0 }
      const newX = e.clientX - dragOffset.current.x + canvasOffset.x
      const newY = e.clientY - dragOffset.current.y + canvasOffset.y

      console.log('handleMouseMove', { newX, newY, canvasOffset })

      setPosition({
        x: newX,
        y: newY,
      })

      finalPosition.current = {
        x: newX,
        y: newY,
      }
    }
  }

  const handleMouseUp = () => {
    console.log('handleMouseUp - BEFORE', {
      isDragging,
      startingPosition: startingPosition.current,
      finalPosition: finalPosition.current,
      position,
    })

    setIsDragging(false)

    console.log('handleMouseUp - AFTER', {
      isDragging,
      startingPosition: startingPosition.current,
      finalPosition: finalPosition.current,
      position,
    })

    if (
      startingPosition.current.x !== finalPosition.current.x ||
      startingPosition.current.y !== finalPosition.current.y
    ) {
      options.onDragEnd(finalPosition.current)
    }
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
