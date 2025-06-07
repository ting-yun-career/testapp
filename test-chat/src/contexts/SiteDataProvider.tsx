import React, { useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { Position, SiteData, Card } from '../utils/siteDataTypes'
import { DEFAULT_SITE_DATA, DEFAULT_CARD } from '../utils/siteDataTypes'
import { SiteDataContext } from './SiteDataContext'

export const SiteDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [siteData, setSiteData] = useState<SiteData>(() => {
    const savedData = localStorage.getItem('siteData')
    const parsedData = savedData ? JSON.parse(savedData) : {}
    return {
      canvasOffset: parsedData.canvasOffset || DEFAULT_SITE_DATA.canvasOffset,
      cards: parsedData.cards || DEFAULT_SITE_DATA.cards,
      widgetPanel: parsedData.widgetPanel || DEFAULT_SITE_DATA.widgetPanel,
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

  const addCard = useCallback(() => {
    updateSiteData({
      ...siteData,
      cards: { ...siteData.cards, [DEFAULT_CARD.id]: DEFAULT_CARD },
    })
  }, [siteData, updateSiteData])

  const updateCard = useCallback(
    (newCard: Card) => {
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

  const removeCard = useCallback(
    (id: string) => {
      const newCards = { ...siteData.cards }
      delete newCards[id]

      updateSiteData({
        ...siteData,
        cards: newCards,
      })
    },
    [siteData, updateSiteData]
  )

  const toggleWidgetPanel = useCallback(() => {
    updateSiteData({
      ...siteData,
      widgetPanel: { isOpen: !siteData.widgetPanel.isOpen },
    })
  }, [siteData, updateSiteData])

  return (
    <SiteDataContext.Provider
      value={{
        siteData,
        updateCanvasOffset,
        addCard,
        updateCard,
        removeCard,
        toggleWidgetPanel,
      }}
    >
      {children}
    </SiteDataContext.Provider>
  )
}
