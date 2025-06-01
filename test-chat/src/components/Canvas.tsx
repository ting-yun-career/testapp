import React, { useState, useEffect, useMemo } from 'react';
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

const GRID_SIZE = 16; // 1rem = 16px

const Grid: React.FC = () => {
  const points = useMemo(() => {
    const gridPoints = [];
    // Create enough points to cover viewport plus some overflow
    const cols = Math.ceil(window.innerWidth / GRID_SIZE) + 10;
    const rows = Math.ceil(window.innerHeight / GRID_SIZE) + 10;

    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        gridPoints.push(
          <div
            key={`${x}-${y}`}
            className="absolute w-[1px] h-[1px] bg-gray-600/30"
            style={{
              left: `${x * GRID_SIZE}px`,
              top: `${y * GRID_SIZE}px`,
            }}
          />
        );
      }
    }
    return gridPoints;
  }, []);

  return <div className="absolute inset-0">{points}</div>;
};

export const Canvas: React.FC<CanvasProps> = ({ children }) => {
  const [offset, setOffset] = useState<Position>({ x: 0, y: 0 });

  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    if (e.shiftKey) {
      // Horizontal scrolling when shift is pressed
      setOffset((prev) => ({
        x: prev.x - e.deltaY,
        y: prev.y,
      }));
    } else {
      // Normal vertical scrolling
      setOffset((prev) => ({
        x: prev.x,
        y: prev.y - e.deltaY,
      }));
    }
  };

  // Export offset to window for draggable components to access
  useEffect(() => {
    window.__CANVAS_OFFSET__ = offset;
  }, [offset]);

  return (
    <div
      className="fixed inset-0 overflow-hidden bg-[#121212]"
      onWheel={handleWheel}
    >
      <div
        className="absolute min-w-full min-h-full"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px)`,
        }}
      >
        <Grid />
        {children}
      </div>
    </div>
  );
};
