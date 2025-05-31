import React, { useState } from 'react';
import Chat from './components/Chat';
import Card from './components/Card';
import './App.css';

const App: React.FC = () => {
  const [showChat, setShowChat] = useState(true);

  if (!showChat) {
    return null;
  }

  return (
    <Card title="Chat" onClose={() => setShowChat(false)}>
      <Chat />
    </Card>
  );
};

export default App;
