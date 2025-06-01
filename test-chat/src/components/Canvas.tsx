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
const GRID_POINTS = 400;
const SCROLLING_SPEED = 2;

const Grid: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawGrid = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    offset: Position
  ) => {
    ctx.clearRect(0, 0, width, height);
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

    canvas.width = window.innerWidth * 2;
    canvas.height = window.innerHeight * 2;

    drawGrid(ctx, canvas.width, canvas.height, { x: 0, y: 0 });
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = window.innerWidth * 2;
      canvas.height = window.innerHeight * 2;

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

  const totalGridWidth = GRID_POINTS * GRID_SIZE;
  const totalGridHeight = GRID_POINTS * GRID_SIZE;

  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    e.preventDefault();

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
      className="fixed inset-0 overflow-hidden bg-[#121212] border border-white"
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
            border: '1px solid red',
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
