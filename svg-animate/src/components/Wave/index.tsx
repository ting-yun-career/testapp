import { useState } from "react";
import { useViewportSize } from "../../hooks/useViewportSize";
import ConfigPanel from "../ConfigPanel";

const CIRCLE_RADIUS = 40;

function Wave() {
  const { width, height } = useViewportSize();
  const [restartToken, setRestartToken] = useState(0);

  const restart = () => setRestartToken((t) => t + 1);

  const cx = width / 2;
  const cy = height / 2;

  return (
    <>
      <svg
        key={restartToken}
        className="pointer-events-none fixed inset-0"
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
      >
        <circle
          cx={cx}
          cy={cy}
          r={CIRCLE_RADIUS}
          role="button"
          aria-label="Restart animation"
          onClick={restart}
          className="pointer-events-auto cursor-pointer fill-neutral-800/10 outline-none transition-colors hover:fill-neutral-800/20 active:fill-neutral-800/30"
        />
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="middle"
          aria-hidden="true"
          className="pointer-events-none font-geo text-[10px] fill-neutral-800/70 select-none"
        >
          RESET
        </text>
      </svg>

      <ConfigPanel>{null}</ConfigPanel>
    </>
  );
}

export default Wave;
