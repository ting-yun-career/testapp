import { v4 as uuidv4 } from 'uuid'

export type Position = {
  x: number
  y: number
}

export type Size = {
  width: number
  height: number
}

export type CardType = 'chat'

export type Card = {
  id: string
  title: string
  type: CardType
  size: Size
  position: Position
  isMinimized: boolean
}

export interface SiteData {
  canvasOffset: Position
  cards: { [key: string]: Card }
  widgetPanel: { isOpen: boolean }
}

export const DEFAULT_CARD: Card = {
  id: uuidv4(),
  title: 'Card 1',
  type: 'chat',
  size: { width: 500, height: 300 },
  position: { x: 0, y: 0 },
  isMinimized: false,
}

export const DEFAULT_SITE_DATA: SiteData = {
  canvasOffset: { x: 0, y: 0 },
  cards: {
    [DEFAULT_CARD.id]: DEFAULT_CARD,
  },
  widgetPanel: { isOpen: true },
}
