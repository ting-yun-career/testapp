import React from 'react';
import mountain from '../assets/mountain.webp';

const SVGMountain: React.FC = () => {
  return (
    <div className="w-[100dvw] h-[100dvh] relative flex items-center justify-center">
      <div className="absolute bottom-0 inset-x-0 border-t border-dashed border-t-gray-500">
        <img
          src={mountain}
          alt="Mountain"
          className="w-full h-auto object-bottom pointer-events-none"
        />
      </div>
      <h1>Hello</h1>
    </div>
  );
};

export default SVGMountain;

