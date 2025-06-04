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
}

export const DEFAULT_SITE_DATA: SiteData = {
  canvasOffset: { x: 0, y: 0 },
  cards: {
    card1: {
      id: 'card1',
      title: 'Card 1',
      type: 'chat',
      size: { width: 500, height: 300 },
      position: { x: 0, y: 0 },
      isMinimized: false,
    },
  },
}
