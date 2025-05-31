import React, { useState } from 'react';
import Chat from './components/Chat';
import Card from './components/Card';
import { Canvas } from './components/Canvas';
import './App.css';

const App: React.FC = () => {
  const [showChat, setShowChat] = useState(true);

  if (!showChat) {
    return null;
  }

  return (
    <Canvas>
      <Card title="Chat" onClose={() => setShowChat(false)}>
        <Chat />
      </Card>
    </Canvas>
  );
};

export default App;
