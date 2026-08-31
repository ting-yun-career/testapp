import { useState } from "react";
import { useViewportSize } from "../../hooks/useViewportSize";
import ConfigPanel from "../ConfigPanel";
import SliderControl from "../SliderControl";
import PauseButton from "../PauseButton";
import { prefersReducedMotion } from "../../lib/motion";
import { useSessionConfig } from "../../lib/sessionConfig";
import "./style.css";

const SLOT_GAP = 1;

const CIRCLE_RADIUS = 40;

const CONFIG_KEY = "orbit-config";

type OrbitConfig = {
  speed: number;
  slotCount: number;
  startAngle: number;
  stepsPerLap: number;
  strokeWidth: number;
};

const DEFAULT_CONFIG: OrbitConfig = {
  speed: 5,
  slotCount: 90,
  startAngle: 180,
  stepsPerLap: 40,
  strokeWidth: 2,
};

function Orbit() {
  const { width, height } = useViewportSize();
  const [config, setConfig] = useSessionConfig<OrbitConfig>(
    CONFIG_KEY,
    DEFAULT_CONFIG,
  );
  const [restartToken, setRestartToken] = useState(0);
  const [paused, setPaused] = useState(prefersReducedMotion);

  const restart = () => setRestartToken((t) => t + 1);
  const togglePause = () => setPaused((p) => !p);

  const { speed, slotCount, startAngle, stepsPerLap, strokeWidth } = config;

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
        <PauseButton paused={paused} onClick={togglePause} radius={CIRCLE_RADIUS} />
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
          onChange={(v) => setConfig((c) => ({ ...c, speed: v }))}
        />
        <SliderControl
          label="Ring count"
          value={slotCount}
          min={10}
          max={400}
          step={10}
          onChange={(v) => setConfig((c) => ({ ...c, slotCount: v }))}
        />
        <SliderControl
          label="Start angle"
          value={startAngle}
          min={0}
          max={360}
          step={1}
          format={(v) => `${v}°`}
          onChange={(v) => setConfig((c) => ({ ...c, startAngle: v }))}
        />
        <SliderControl
          label="Steps per lap"
          value={stepsPerLap}
          min={0}
          max={120}
          step={1}
          onChange={(v) => setConfig((c) => ({ ...c, stepsPerLap: v }))}
        />
        <SliderControl
          label="Stroke width"
          value={strokeWidth}
          min={1}
          max={10}
          step={1}
          format={(v) => `${v}px`}
          onChange={(v) => setConfig((c) => ({ ...c, strokeWidth: v }))}
        />
      </ConfigPanel>
    </>
  );
}

export default Orbit;
