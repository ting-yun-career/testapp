import { useEffect, useState } from 'react'

const STROKE_WIDTH = 5
const SLOT_GAP = 1
const SLOT_PITCH = STROKE_WIDTH + SLOT_GAP

const CIRCLE_RADIUS = 40
const STEP_DEGREES = 30 // arc length gained per n seconds
const STEPS_PER_LAP = 360 / STEP_DEGREES
const START_ANGLE = 180 // tail anchored left of the circle, on the horizontal axis

type OrbitRingProps = {
  /** Seconds between spawns. Each arc also grows STEP_DEGREES per n. */
  n?: number
}

function useViewportSize() {
  const [size, setSize] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }))

  useEffect(() => {
    const onResize = () =>
      setSize({ width: window.innerWidth, height: window.innerHeight })
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return size
}

/**
 * A fixed circle ringed by arcs. Every `n` seconds a new arc starts in the next
 * slot outward; each arc keeps its tail anchored at START_ANGLE and grows its
 * leading edge clockwise by STEP_DEGREES per `n`, closing into a full ring
 * after STEPS_PER_LAP * n seconds and staying closed. So inner arcs are older
 * and longer. Slots stop being added once they would leave the viewport.
 */
function OrbitRing({ n = 0.6 }: OrbitRingProps) {
  const { width, height } = useViewportSize()

  const cx = width / 2
  const cy = height / 2
  const maxRadius = Math.hypot(width, height) / 2
  const slotCount = Math.max(
    0,
    Math.floor((maxRadius - CIRCLE_RADIUS - SLOT_GAP) / SLOT_PITCH),
  )

  return (
    <svg
      className="pointer-events-none fixed inset-0 -z-10"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
    >
      <circle cx={cx} cy={cy} r={CIRCLE_RADIUS} className="fill-neutral-800/10" />
      {Array.from({ length: slotCount }, (_, i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={CIRCLE_RADIUS + SLOT_GAP + (i + 0.5) * SLOT_PITCH}
          fill="none"
          className="stroke-neutral-800/40"
          strokeWidth={STROKE_WIDTH}
          pathLength={360}
          strokeDasharray={360}
          style={{
            transformOrigin: `${cx}px ${cy}px`,
            transform: `rotate(${START_ANGLE}deg)`,
            animation: `orbit-draw ${n * STEPS_PER_LAP}s linear ${i * n}s both`,
          }}
        />
      ))}
    </svg>
  )
}

export default OrbitRing
