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
  const lastOffsetRef = useRef<Position>({ x: 0, y: 0 });

  const drawGrid = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    offset: Position
  ) => {
    console.log('drawGrid');
    // Clear the canvas
    ctx.clearRect(0, 0, width, height);

    // Set point style
    ctx.fillStyle = 'rgba(212, 212, 212, 0.5)'; // neutral-300 with 50% opacity

    for (let x = 0; x <= GRID_POINTS; x++) {
      for (let y = 0; y <= GRID_POINTS; y++) {
        const pointX = x * GRID_SIZE - offset.x;
        const pointY = y * GRID_SIZE - offset.y;
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
    const checkOffset = () => {
      console.log('checkOffset');
      const currentOffset = window.__CANVAS_OFFSET__ || { x: 0, y: 0 };

      // Only redraw if offset has changed
      if (
        currentOffset.x !== lastOffsetRef.current.x ||
        currentOffset.y !== lastOffsetRef.current.y
      ) {
        console.log('redraw');
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        drawGrid(ctx, canvas.width, canvas.height, currentOffset);
        lastOffsetRef.current = { ...currentOffset };
      }

      requestAnimationFrame(checkOffset);
    };

    const animationFrameId = requestAnimationFrame(checkOffset);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none border border-white"
    />
  );
};

export const Canvas: React.FC<CanvasProps> = ({ children }) => {
  const [offset, setOffset] = useState<Position>({ x: 0, y: 0 });

  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    if (e.shiftKey) {
      setOffset((prev) => {
        // Calculate new x offset
        const newX = prev.x - e.deltaY;

        // Limit x scrolling to the range [0, GRID_POINTS * GRID_SIZE]
        return {
          x: Math.min(Math.max(0, newX), GRID_POINTS * GRID_SIZE),
          y: prev.y,
        };
      });
    } else {
      setOffset((prev) => {
        // Calculate new y offset
        const newY = prev.y - e.deltaY;

        // Limit y scrolling to the range [0, GRID_POINTS * GRID_SIZE]
        return {
          x: prev.x,
          y: Math.min(Math.max(0, newY), GRID_POINTS * GRID_SIZE),
        };
      });
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
