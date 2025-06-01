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

const GRID_SIZE = 16;
const GRID_POINTS = 200; // Number of points in each direction

const Grid: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawGrid = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    offset: Position
  ) => {
    // Clear the canvas
    ctx.clearRect(0, 0, width, height);

    // Set point style
    ctx.fillStyle = 'rgba(212, 212, 212, 0.5)'; // neutral-300 with 50% opacity

    // Calculate the viewport center (this will be our (0,0) point)
    const originX = Math.floor(width / 2);
    const originY = Math.floor(height / 2);

    // Draw points in all quadrants
    // Each quadrant will have 200x200 points
    for (let x = -GRID_POINTS; x <= GRID_POINTS; x++) {
      for (let y = -GRID_POINTS; y <= GRID_POINTS; y++) {
        // Calculate the actual pixel position
        const pointX = originX + x * GRID_SIZE + offset.x;
        const pointY = originY + y * GRID_SIZE + offset.y;

        // Only draw if the point is within the viewport
        if (pointX >= 0 && pointX <= width && pointY >= 0 && pointY <= height) {
          ctx.fillRect(pointX, pointY, 1, 1);
        }
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

    drawGrid(ctx, canvas.width, canvas.height, { x: 0, y: 0 });
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

      drawGrid(
        ctx,
        canvas.width,
        canvas.height,
        window.__CANVAS_OFFSET__ || { x: 0, y: 0 }
      );
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Redraw grid when canvas offset changes
  useEffect(() => {
    let animationFrameId: number;

    const updateGrid = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      drawGrid(
        ctx,
        canvas.width,
        canvas.height,
        window.__CANVAS_OFFSET__ || { x: 0, y: 0 }
      );
      animationFrameId = requestAnimationFrame(updateGrid);
    };

    animationFrameId = requestAnimationFrame(updateGrid);
    return () => cancelAnimationFrame(animationFrameId);
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
