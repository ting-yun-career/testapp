import { useState } from "react";
import { useViewportSize } from "../../hooks/useViewportSize";
import ConfigPanel from "../ConfigPanel";
import SliderControl from "../SliderControl";
import { prefersReducedMotion } from "../../lib/motion";
import "./style.css";

const SLOT_GAP = 1;

const CIRCLE_RADIUS = 40;

function Orbit() {
  const { width, height } = useViewportSize();
  const [speed, setSpeed] = useState(5);
  const [slotCount, setSlotCount] = useState(90);
  const [startAngle, setStartAngle] = useState(180);
  const [stepsPerLap, setStepsPerLap] = useState(40);
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [restartToken, setRestartToken] = useState(0);
  const [paused, setPaused] = useState(prefersReducedMotion);

  const restart = () => setRestartToken((t) => t + 1);
  const togglePause = () => setPaused((p) => !p);

  const cx = width / 2;
  const cy = height / 2;
  const slotPitch = strokeWidth + SLOT_GAP;

  return (
    <>
      <svg
        key={`${speed}-${slotCount}-${startAngle}-${stepsPerLap}-${strokeWidth}-${restartToken}`}
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
          aria-label={paused ? "Resume animation" : "Pause animation"}
          onClick={togglePause}
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
          {paused ? "RESUME" : "PAUSE"}
        </text>
        <g aria-hidden="true">
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
              onAnimationEnd={i === slotCount - 1 ? restart : undefined}
              style={{
                transformOrigin: `${cx}px ${cy}px`,
                transform: `rotate(${startAngle}deg)`,
                animation: `orbit-draw ${stepsPerLap / speed}s linear ${i / speed}s both`,
                animationPlayState: paused ? "paused" : "running",
              }}
            />
          ))}
        </g>
      </svg>

      <ConfigPanel>
        <SliderControl
          label="Speed"
          value={speed}
          min={1}
          max={20}
          step={1}
          onChange={setSpeed}
        />
        <SliderControl
          label="Ring count"
          value={slotCount}
          min={10}
          max={400}
          step={10}
          onChange={setSlotCount}
        />
        <SliderControl
          label="Start angle"
          value={startAngle}
          min={0}
          max={360}
          step={1}
          format={(v) => `${v}°`}
          onChange={setStartAngle}
        />
        <SliderControl
          label="Steps per lap"
          value={stepsPerLap}
          min={0}
          max={120}
          step={1}
          onChange={setStepsPerLap}
        />
        <SliderControl
          label="Stroke width"
          value={strokeWidth}
          min={1}
          max={10}
          step={1}
          format={(v) => `${v}px`}
          onChange={setStrokeWidth}
        />
      </ConfigPanel>
    </>
  );
}

export default Orbit;
