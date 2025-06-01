import React, { useState, useEffect } from 'react';
import type { ReactNode, WheelEvent } from 'react';

interface Position {
  x: number;
  y: number;
}

interface CanvasProps {
  children: ReactNode;
}

declare global {
  interface Window {
    __CANVAS_OFFSET__: Position;
  }
}

const GRID_SIZE = 16;
const SCROLLING_SPEED = 2;

export const Canvas: React.FC<CanvasProps> = ({ children }) => {
  const [offset, setOffset] = useState<Position>({ x: 0, y: 0 });

  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    setOffset((prev) => {
      // Calculate new offsets based on wheel delta
      let newX = prev.x;
      let newY = prev.y;

      // Get the scroll direction (positive or negative)
      const directionX = e.deltaY < 0 ? -1 : 1;
      const directionY = e.deltaY < 0 ? -1 : 1;

      if (e.shiftKey) {
        newX -= directionX * GRID_SIZE * SCROLLING_SPEED;
      } else {
        newY -= directionY * GRID_SIZE * SCROLLING_SPEED;
      }

      console.log('Offset:', { x: newX, y: newY });
      return { x: newX, y: newY };
    });
  };

  useEffect(() => {
    window.__CANVAS_OFFSET__ = offset;
  }, [offset]);

  return (
    <div
      className="fixed inset-0 overflow-hidden bg-[#121212]"
      onWheel={handleWheel}
      style={{ touchAction: 'none' }}
    >
      <div
        className="absolute"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
};
