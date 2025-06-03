import React from 'react'
import Chat from './components/Chat'
import Card from './components/Card'
import { Canvas } from './components/Canvas'
import { SiteDataProvider } from './contexts/SiteDataContext'
import { useSiteData } from './contexts/useSiteData'
import './App.css'

const AppContent: React.FC = () => {
  const { siteData, updateCanvasOffset } = useSiteData()
  return (
    <Canvas initialOffset={siteData.canvasOffset} onOffsetChange={updateCanvasOffset}>
      {siteData.cards &&
        Object.entries(siteData.cards).map(([id, card]) => (
          <Card key={id} id={id} title={card.title}>
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
