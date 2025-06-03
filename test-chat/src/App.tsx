import React from 'react'
import Chat from './components/Chat'
import type { Card as CardType } from './utils/siteDataTypes'
import { Canvas } from './components/Canvas'
import { SiteDataProvider } from './contexts/SiteDataProvider'
import { useSiteData } from './contexts/useSiteData'
import './App.css'
import Card from './components/Card'

const AppContent: React.FC = () => {
  const { siteData, updateCanvasOffset, updateCard } = useSiteData()
  return (
    <Canvas initialOffset={siteData.canvasOffset} onOffsetChange={updateCanvasOffset}>
      {siteData.cards &&
        Object.entries(siteData.cards).map(([id, card]) => (
          <Card key={id} id={id} title={card.title} onChange={(newCard: CardType) => updateCard(id, newCard)}>
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
