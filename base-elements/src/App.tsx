import React from 'react';

const App: React.FC = () => {
  return (
    <>
      <div className="bg-white text-black dark:bg-gray-900 dark:text-white">
        hi
      </div>
      <div className="bg-checkerboard text-gray-500 p-4 rounded-sm">
        <div className="font-thin">Thin text</div>
        <div className="font-extralight">Extra light text</div>
        <div className="font-light">Light text</div>
        <div className="font-normal">Normal text</div>
        <div className="font-medium">Medium text</div>
        <div className="font-semibold">Semibold text</div>
        <div className="font-bold">Bold text</div>
        <div className="font-extrabold">Extra bold text</div>
        <div className="font-black">Black text</div>
      </div>
    </>
  );
};

export default App;
