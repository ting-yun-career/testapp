import { useState } from 'react'
import { HOURS } from '../lib/constants'

function toMinutes(value: string) {
  const [h, m] = value.split(':').map(Number)
  return Number.isFinite(h) && Number.isFinite(m) ? h * 60 + m : null
}

function computeStatus() {
  const now = new Date()
  const day = now.getDay()

  const row = HOURS.find((h) => h.day === day)
  if (!row) return { today: day, status: null }

  const open = toMinutes(row.openTime)
  const close = toMinutes(row.closeTime)
  const mins = now.getHours() * 60 + now.getMinutes()
  const isOpen = open !== null && close !== null && mins >= open && mins < close
  return { today: day, status: { text: isOpen ? 'Open now' : 'Closed now', open: isOpen } }
}

/** Ported from js/hours.js: highlights today's row and reports whether the
    salon is open right now. Computed once via a lazy initializer (not an
    effect) since "today" and "now" only need the visitor's clock at mount. */
export function useHours() {
  const [{ today, status }] = useState(computeStatus)
  return { today, status }
}
