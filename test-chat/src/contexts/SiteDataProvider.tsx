import React, { useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { Position, SiteData, Card } from '../utils/siteDataTypes'
import { DEFAULT_SITE_DATA } from '../utils/siteDataTypes'
import { SiteDataContext } from './SiteDataContext'

export const SiteDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [siteData, setSiteData] = useState<SiteData>(() => {
    const savedData = localStorage.getItem('siteData')
    const parsedData = savedData ? JSON.parse(savedData) : {}
    return {
      canvasOffset: parsedData.canvasOffset || DEFAULT_SITE_DATA.canvasOffset,
      cards: parsedData.cards || DEFAULT_SITE_DATA.cards,
    }
  })

  const updateSiteData = useCallback((newSiteData: SiteData) => {
    setSiteData(newSiteData)
    localStorage.setItem('siteData', JSON.stringify(newSiteData))
  }, [])

  const updateCanvasOffset = useCallback(
    (offset: Position) => {
      updateSiteData({
        ...siteData,
        canvasOffset: offset,
      })
    },
    [siteData, updateSiteData]
  )

  const updateCard = useCallback(
    (newCard: Card) => {
      debugger
      if (!siteData.cards[newCard.id]) return

      updateSiteData({
        ...siteData,
        cards: {
          ...siteData.cards,
          [newCard.id]: newCard,
        },
      })
    },
    [siteData, updateSiteData]
  )

  return (
    <SiteDataContext.Provider
      value={{
        siteData,
        updateCanvasOffset,
        updateCard,
      }}
    >
      {children}
    </SiteDataContext.Provider>
  )
}
