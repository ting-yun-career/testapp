import React from 'react'
import Chat from './components/Chat'
import { Canvas } from './components/Canvas'
import { SiteDataProvider } from './contexts/SiteDataProvider'
import { useSiteData } from './contexts/useSiteData'
import './App.css'
import Card from './components/Card'

const AppContent: React.FC = () => {
  const { siteData, updateCanvasOffset, updateCard, removeCard } = useSiteData()
  return (
    <Canvas initialOffset={siteData.canvasOffset} onOffsetChange={updateCanvasOffset}>
      {siteData.cards &&
        Object.entries(siteData.cards).map(([id, data]) => (
          <Card key={id} data={data} onChange={updateCard} onClose={removeCard}>
            <Chat />
          </Card>
        ))}
    </Canvas>
  )
}

const App: React.FC = () => {
  return (
    <SiteDataProvider>
      <AppContent />
    </SiteDataProvider>
  )
}

export default App
