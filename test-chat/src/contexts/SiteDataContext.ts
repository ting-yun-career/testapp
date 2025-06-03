import { createContext } from 'react'
import type { SiteData, Position, Size } from '../utils/siteDataTypes'

export interface SiteDataContextType {
  siteData: SiteData
  updateCanvasOffset: (offset: Position) => void
  updateCardPosition: (cardId: string, position: Position) => void
  updateCardSize: (cardId: string, size: Size) => void
}

export const SiteDataContext = createContext<SiteDataContextType | undefined>(undefined)
