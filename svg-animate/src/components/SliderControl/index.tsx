import "./style.css";

type SliderControlProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  format?: (value: number) => string;
};

function SliderControl({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
}: SliderControlProps) {
  const snapped = Math.min(
    max,
    Math.max(min, min + Math.round((value - min) / step) * step),
  );
  const percent = ((snapped - min) / (max - min)) * 100;

  return (
    <label className="block">
      <div className="mb-1 flex items-baseline justify-between text-xs text-neutral-500">
        <span>{label}</span>
        <span className="tabular-nums text-neutral-800">
          {format ? format(value) : value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="slider-control text-neutral-800"
        style={{
          background: `linear-gradient(to right, currentColor ${percent}%, transparent ${percent}%)`,
        }}
      />
    </label>
  );
}

export default SliderControl;
