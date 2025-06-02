import React, { useState, useEffect } from 'react'
import Chat from './components/Chat'
import Card from './components/Card'
import { Canvas } from './components/Canvas'
import './App.css'

const DEFAULT_SITE_DATA: SiteData = {
  canvasOffset: { x: 0, y: 0 },
}

interface SiteData {
  canvasOffset: { x: number; y: number }
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
