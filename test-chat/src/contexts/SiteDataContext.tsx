import { createContext } from 'react'
import type { Position, SiteData, Card } from '../utils/siteDataTypes'

export interface SiteDataContextType {
  siteData: SiteData
  updateCanvasOffset: (offset: Position) => void
  addCard: (newCard: Card) => void
  updateCard: (newCard: Card) => void
  removeCard: (id: string) => void
  toggleWidgetPanel: () => void
}

export const SiteDataContext = createContext<SiteDataContextType | undefined>(undefined)
