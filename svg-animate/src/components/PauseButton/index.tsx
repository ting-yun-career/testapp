const DEFAULT_RADIUS = 40;

type PauseButtonProps = {
  paused: boolean;
  onClick: () => void;
  radius?: number;
};

function PauseButton({ paused, onClick, radius = DEFAULT_RADIUS }: PauseButtonProps) {
  return (
    <>
      <circle cx="50%" cy="50%" r={radius} className="fill-[#f5f0e6]" />
      <circle
        cx="50%"
        cy="50%"
        r={radius}
        role="button"
        aria-label={paused ? "Resume animation" : "Pause animation"}
        onClick={onClick}
        className="pointer-events-auto cursor-pointer fill-neutral-800/10 outline-none transition-colors hover:fill-neutral-800/20 active:fill-neutral-800/30"
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        aria-hidden="true"
        className="pointer-events-none font-geo text-[10px] fill-neutral-800/70 select-none"
      >
        {paused ? "RESUME" : "PAUSE"}
      </text>
    </>
  );
}

export default PauseButton;
