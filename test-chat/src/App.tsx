import React, { useState, useEffect } from 'react'
import Chat from './components/Chat'
import Card from './components/Card'
import { Canvas } from './components/Canvas'
import './App.css'

declare global {
  interface Window {
    __CANVAS_OFFSET__: Position
  }
}

export type Position = {
  x: number
  y: number
}

type CardType = 'chat'

const DEFAULT_SITE_DATA: SiteData = {
  canvasOffset: { x: 0, y: 0 },
  cards: [
    {
      title: 'Card 1',
      type: 'chat',
      size: { width: 500, height: 300 },
      position: { x: 0, y: 0 },
    },
    {
      title: 'Card 2',
      type: 'chat',
      size: { width: 500, height: 300 },
      position: { x: 500, y: 0 },
    },
  ],
}

interface SiteData {
  canvasOffset: Position
  cards: {
    title: string
    type: CardType
    size: { width: number; height: number }
    position: Position
  }[]
}

const App: React.FC = () => {
  const siteDataStr = localStorage.getItem('siteData')
  const siteData: SiteData = siteDataStr ? JSON.parse(siteDataStr) : DEFAULT_SITE_DATA
  const [status, setStatus] = useState<string | undefined>(undefined)

  useEffect(() => {
    const saveInterval = setInterval(() => {
      setStatus('Saving...')

      const dataToSave = {
        canvasOffset: window.__CANVAS_OFFSET__,
      }

      localStorage.setItem('siteData', JSON.stringify(dataToSave))

      setTimeout(() => {
        setStatus(undefined)
      }, 1500)
    }, 15000)

    return () => clearInterval(saveInterval)
  }, [])

  return (
    <>
      <Canvas initialOffset={siteData.canvasOffset} status={status}>
        <Card title="Title 1">
          <Chat />
        </Card>
        <Card title="Title 2">
          <Chat />
        </Card>
      </Canvas>
    </>
  )
}

export default App
