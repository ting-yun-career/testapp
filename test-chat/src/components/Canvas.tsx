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
  const [viewportSize, setViewportSize] = useState<Position>({
    x: window.innerWidth,
    y: window.innerHeight,
  });
  const viewportRef = useRef<HTMLDivElement>(null);

  // Calculate the canvas size as 1.5x the viewport or the grid extent, whichever is larger
  const canvasWidth = Math.max(GRID_POINTS * GRID_SIZE, viewportSize.x * 1.5);
  const canvasHeight = Math.max(GRID_POINTS * GRID_SIZE, viewportSize.y * 1.5);

  // Update viewport size when resized
  useEffect(() => {
    const updateViewportSize = () => {
      if (viewportRef.current) {
        setViewportSize({
          x: viewportRef.current.clientWidth,
          y: viewportRef.current.clientHeight,
        });
      }
    };

    updateViewportSize();
    const handleResize = () => {
      updateViewportSize();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    e.preventDefault();

    if (e.shiftKey) {
      setOffset((prev) => {
        const newX = prev.x - e.deltaY;

        let minX = 0;
        if (canvasWidth > viewportSize.x) {
          minX = -(canvasWidth - viewportSize.x);
        }

        return {
          x: Math.min(0, Math.max(minX, newX)),
          y: prev.y,
        };
      });
    } else {
      setOffset((prev) => {
        const newY = prev.y - e.deltaY;

        let minY = 0;
        if (canvasHeight > viewportSize.y) {
          minY = -(canvasHeight - viewportSize.y);
        }

        return {
          x: prev.x,
          y: Math.min(0, Math.max(minY, newY)),
        };
      });
    }
  };

  // Export offset to window for draggable components to access
  useEffect(() => {
    window.__CANVAS_OFFSET__ = offset;
  }, [offset]);

  // Add debug info for development
  useEffect(() => {
    console.log({
      offset,
      viewportSize,
      canvasWidth,
      canvasHeight,
      minAllowedX:
        canvasWidth > viewportSize.x ? -(canvasWidth - viewportSize.x) : 0,
      minAllowedY:
        canvasHeight > viewportSize.y ? -(canvasHeight - viewportSize.y) : 0,
      actualBoundaries: `X: [${canvasWidth > viewportSize.x ? -(canvasWidth - viewportSize.x) : 0}, 0], Y: [${canvasHeight > viewportSize.y ? -(canvasHeight - viewportSize.y) : 0}, 0]`,
    });
  }, [offset, viewportSize, canvasWidth, canvasHeight]);

  return (
    <div
      ref={viewportRef}
      className="fixed inset-0 overflow-hidden bg-[#121212]"
      onWheel={handleWheel}
    >
      <div
        className="absolute"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px)`,
          width: `${canvasWidth}px`,
          height: `${canvasHeight}px`,
        }}
      >
        <Grid />
        {children}
      </div>
    </div>
  );
};
