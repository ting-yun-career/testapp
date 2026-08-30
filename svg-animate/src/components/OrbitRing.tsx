import { useViewportSize } from "../hooks/useViewportSize";

const SLOT_GAP = 1;

const CIRCLE_RADIUS = 40;

type OrbitRingProps = {
  speed?: number;
  slotCount?: number;
  startAngle?: number;
  stepsPerLap?: number;
  strokeWidth?: number;
};

function OrbitRing({
  speed = 5,
  slotCount = 200,
  startAngle = 180,
  stepsPerLap = 40,
  strokeWidth = 3,
}: OrbitRingProps) {
  const { width, height } = useViewportSize();

  const cx = width / 2;
  const cy = height / 2;
  const slotPitch = strokeWidth + SLOT_GAP;

  return (
    <svg
      className="pointer-events-none fixed inset-0 -z-10"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
    >
      <circle
        cx={cx}
        cy={cy}
        r={CIRCLE_RADIUS}
        className="fill-neutral-800/10"
      />
      {Array.from({ length: slotCount }, (_, i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={CIRCLE_RADIUS + SLOT_GAP + (i + 0.5) * slotPitch}
          fill="none"
          className="stroke-neutral-800/40"
          strokeWidth={strokeWidth}
          pathLength={360}
          strokeDasharray={360}
          style={{
            transformOrigin: `${cx}px ${cy}px`,
            transform: `rotate(${startAngle}deg)`,
            animation: `orbit-draw ${stepsPerLap / speed}s linear ${i / speed}s both`,
          }}
        />
      ))}
    </svg>
  );
}

export default OrbitRing;
