import React, { useEffect, useLayoutEffect, useState } from 'react'
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

  useEffect(() => {
    setInterval(() => {
      console.log('saving siteData...')
      localStorage.setItem(
        'siteData',
        JSON.stringify({
          canvasOffset: window.__CANVAS_OFFSET__,
        })
      )
    }, 5000)
  }, [])

  return (
    <>
      <Canvas initialOffset={siteData.canvasOffset}>
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
