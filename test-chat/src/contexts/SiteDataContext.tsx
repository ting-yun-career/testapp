import React, { createContext, useState, useContext, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { Position, Size, Card, SiteData } from '../utils/siteDataTypes'
import { DEFAULT_SITE_DATA } from '../utils/siteDataTypes'

interface SiteDataContextType {
  siteData: SiteData
  updateCanvasOffset: (offset: Position) => void
  updateCardPosition: (cardId: string, position: Position) => void
  updateCardSize: (cardId: string, size: Size) => void
}

const SiteDataContext = createContext<SiteDataContextType | undefined>(undefined)

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

  const updateCardPosition = useCallback(
    (cardId: string, position: Position) => {
      if (!siteData.cards[cardId]) return

      updateSiteData({
        ...siteData,
        cards: {
          ...siteData.cards,
          [cardId]: {
            ...siteData.cards[cardId],
            position,
          },
        },
      })
    },
    [siteData, updateSiteData]
  )

  const updateCardSize = useCallback(
    (cardId: string, size: Size) => {
      if (!siteData.cards[cardId]) return

      updateSiteData({
        ...siteData,
        cards: {
          ...siteData.cards,
          [cardId]: {
            ...siteData.cards[cardId],
            size,
          },
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
        updateCardPosition,
        updateCardSize,
      }}
    >
      {children}
    </SiteDataContext.Provider>
  )
}

export const useSiteData = () => {
  const context = useContext(SiteDataContext)
  if (context === undefined) {
    throw new Error('useSiteData must be used within a SiteDataProvider')
  }
  return context
}
