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
const GRID_POINTS = 400; // Number of points in each direction

const Grid: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
      requestAnimationFrame(checkOffset);
    };

    const animationFrameId = requestAnimationFrame(checkOffset);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
  );
};

export const Canvas: React.FC<CanvasProps> = ({ children }) => {
  const [offset, setOffset] = useState<Position>({ x: 0, y: 0 });

  // The actual size of our grid in pixels
  const totalGridWidth = GRID_POINTS * GRID_SIZE;
  const totalGridHeight = GRID_POINTS * GRID_SIZE;

  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    e.preventDefault();

    setOffset((prev) => {
      // Calculate new offsets based on wheel delta
      let newX = prev.x;
      let newY = prev.y;

      if (e.shiftKey) {
        // Horizontal scrolling
        newX -= e.deltaY;
      } else {
        // Vertical scrolling
        newY -= e.deltaY;
      }

      // Constrain offsets to valid range:
      // - Never allow positive offsets (can't scroll past origin)
      // - Never allow scrolling past the grid boundaries

      // X constraints
      newX = Math.min(0, newX); // Can't go past left edge

      // Y constraints
      newY = Math.min(0, newY); // Can't go past top edge

      console.log('Offset:', { x: newX, y: newY });
      return { x: newX, y: newY };
    });
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
        className="absolute"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px)`,
        }}
      >
        <div
          style={{
            width: `${totalGridWidth}px`,
            height: `${totalGridHeight}px`,
            position: 'relative',
          }}
        >
          <Grid />
          {children}
        </div>
      </div>
    </div>
  );
};
