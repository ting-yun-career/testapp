import { useState, useRef } from 'react';
import type { MouseEvent } from 'react';

interface Position {
  x: number;
  y: number;
}

interface UseDraggableOptions {
  dragHandleClassName?: string;
}

interface UseDraggableReturn {
  position: Position;
  isDragging: boolean;
  handleMouseDown: (e: MouseEvent) => void;
  handleMouseMove: (e: MouseEvent) => void;
  handleMouseUp: () => void;
  style: {
    transform: string;
    cursor: string;
  };
}

export function useDraggable(
  options: UseDraggableOptions = {}
): UseDraggableReturn {
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef<Position>({ x: 0, y: 0 });

  const handleMouseDown = (e: MouseEvent) => {
    // If a drag handle is specified, only start dragging if clicking it
    if (options.dragHandleClassName) {
      if (
        !(e.target as HTMLElement).closest(`.${options.dragHandleClassName}`)
      ) {
        return;
      }
    }

    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return {
    position,
    isDragging,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    style: {
      transform: `translate(${position.x}px, ${position.y}px)`,
      cursor: isDragging ? 'grabbing' : 'default',
    },
  };
}
