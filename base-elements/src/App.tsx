import React from 'react';

const App: React.FC = () => {
  return (
    <>
      <div
        className="text-gray-500 p-4 rounded-sm"
        style={{
          backgroundImage:
            'linear-gradient(45deg, var(--checkered-bg) 25%, transparent 25%), linear-gradient(-45deg, var(--checkered-bg) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, var(--checkered-bg) 75%), linear-gradient(-45deg, transparent 75%, var(--checkered-bg) 75%)',
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
        }}
      >
        <div className="text-base">Section Content</div>
      </div>
    </>
  );
};

export default App;
