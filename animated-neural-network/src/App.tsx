import React from 'react';
import Header from './components/Header';
import { ThemeProvider } from './components/theme-provider';

const App: React.FC = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div>
        <Header />
        {/* Your code here */}
      </div>
    </ThemeProvider>
  );
};

export default App;
