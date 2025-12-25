import React from 'react';
import mountain from './assets/mountain.webp';

const App: React.FC = () => {
  return (
    <div className="w-[100dvw] h-[100dvh] relative flex items-center justify-center">
      <img
        src={mountain}
        alt="Mountain"
        className="absolute bottom-0 left-0 w-full h-auto object-bottom pointer-events-none"
      />
      <h1>Hello</h1>
    </div>
  );
};

export default App;
