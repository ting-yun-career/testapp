import React, { useState, useEffect, useRef } from 'react';
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
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawGrid = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    // Clear the canvas
    ctx.clearRect(0, 0, width, height);

    // Set point style
    ctx.fillStyle = 'rgba(212, 212, 212, 0.5)'; // neutral-300 with 50% opacity

    // Calculate the center of the viewport
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);

    // Calculate how many grid cells we need in each direction
    const cellsX = Math.ceil(width / GRID_SIZE) + 1;
    const cellsY = Math.ceil(height / GRID_SIZE) + 1;

    // Calculate the offset to ensure points align with the grid
    const offsetX = centerX % GRID_SIZE;
    const offsetY = centerY % GRID_SIZE;

    // Draw points in all directions from the center
    for (let x = -Math.ceil(cellsX / 2); x < Math.ceil(cellsX / 2); x++) {
      for (let y = -Math.ceil(cellsY / 2); y < Math.ceil(cellsY / 2); y++) {
        const pointX = centerX + x * GRID_SIZE - offsetX;
        const pointY = centerY + y * GRID_SIZE - offsetY;
        ctx.fillRect(pointX, pointY, 1, 1);
      }
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match window size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    drawGrid(ctx, canvas.width, canvas.height);
  }, []);

  // Update canvas size when window resizes
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      drawGrid(ctx, canvas.width, canvas.height);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
  );
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
