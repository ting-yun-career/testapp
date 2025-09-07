import React from 'react';
import { ModeToggle } from './mode-toggle';

const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-black text-white p-2 flex justify-between items-center font-light">
      <div className="flex items-center">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-3">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <nav>
          <a href="#" className="mr-3 text-sm text-white hover:text-gray-300">Docs</a>
          <a href="#" className="mr-3 text-sm text-white hover:text-gray-300">Components</a>
          <a href="#" className="mr-3 text-sm text-white hover:text-gray-300">Blocks</a>
          <a href="#" className="mr-3 text-sm text-white hover:text-gray-300">Charts</a>
          <a href="#" className="mr-3 text-sm text-white hover:text-gray-300">Themes</a>
          <a href="#" className="text-sm text-white hover:text-gray-300">Colors</a>
        </nav>
      </div>
      <div className="flex items-center">
        <div className="relative mr-3">
          <input type="text" placeholder="Search..." className="bg-gray-900 text-white rounded-md py-1 px-2 text-sm w-48" />
        </div>
        <a href="#" className="mr-3 flex items-center hover:text-gray-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
          </svg>
        </a>
        <ModeToggle />
      </div>
    </header>
  );
};

export default Header;
