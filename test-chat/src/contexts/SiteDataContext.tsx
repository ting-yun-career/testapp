import { createContext } from 'react'
import type { Position, Size, SiteData } from '../utils/siteDataTypes'

export interface SiteDataContextType {
  siteData: SiteData
  updateCanvasOffset: (offset: Position) => void
  updateCardPosition: (cardId: string, position: Position) => void
  updateCardSize: (cardId: string, size: Size) => void
}

export const SiteDataContext = createContext<SiteDataContextType | undefined>(undefined)
