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
  const ratio = (snapped - min) / (max - min);
  const markerPosition = `calc(1.5px + (100% - 3px) * ${ratio})`;

  return (
    <label className="block text-neutral-800">
      <div className="mb-1 flex items-baseline justify-between text-xs text-neutral-500">
        <span>{label}</span>
        <span className="tabular-nums text-neutral-800">
          {format ? format(value) : value}
        </span>
      </div>
      <div className="relative h-[14px] w-full">
        <div
          className="absolute top-1/2 left-0 h-[3px] -translate-y-1/2 bg-current"
          style={{ width: markerPosition }}
        />
        <div
          className="absolute top-0 h-[14px] w-[3px] -translate-x-1/2 bg-current"
          style={{ left: markerPosition }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="slider-control absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </div>
    </label>
  );
}

export default SliderControl;
