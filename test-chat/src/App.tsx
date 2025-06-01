import React, { useLayoutEffect, useState } from 'react';
import Chat from './components/Chat';
import Card from './components/Card';
import { Canvas } from './components/Canvas';
import './App.css';

interface SiteData {
  canvasOffset: { x: number; y: number };
}

const App: React.FC = () => {
  const [siteData, setSiteData] = useState<SiteData>({
    canvasOffset: { x: 0, y: 0 },
  });

  useLayoutEffect(() => {
    const siteData = localStorage.getItem('siteData');
    if (siteData) {
      setSiteData(JSON.parse(siteData));
    }
  }, []);

  return (
    <Canvas initialOffset={siteData.canvasOffset}>
      <Card title="Chat">
        <Chat />
      </Card>
    </Canvas>
  );
};

export default App;
