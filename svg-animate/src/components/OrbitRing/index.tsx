import { useState } from "react";
import { useViewportSize } from "../../hooks/useViewportSize";
import ConfigPanel from "../ConfigPanel";
import SliderControl from "../SliderControl";
import "./style.css";

const SLOT_GAP = 1;

const CIRCLE_RADIUS = 40;

function OrbitRing() {
  const { width, height } = useViewportSize();
  const [speed, setSpeed] = useState(5);
  const [slotCount, setSlotCount] = useState(200);
  const [startAngle, setStartAngle] = useState(180);
  const [stepsPerLap, setStepsPerLap] = useState(40);
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [panelOpen, setPanelOpen] = useState(false);

  const cx = width / 2;
  const cy = height / 2;
  const slotPitch = strokeWidth + SLOT_GAP;

  return (
    <>
      <svg
        key={`${speed}-${slotCount}-${startAngle}-${stepsPerLap}-${strokeWidth}`}
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

      <ConfigPanel
        title="Ring animation"
        open={panelOpen}
        onOpenChange={setPanelOpen}
      >
        <SliderControl
          label="Speed"
          value={speed}
          min={0.5}
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
          min={5}
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

export default OrbitRing;
