type SelectControlProps<T extends string> = {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
};

function SelectControl<T extends string>({
  label,
  value,
  options,
  onChange,
}: SelectControlProps<T>) {
  return (
    <div>
      <div className="mb-1 text-xs text-neutral-500">{label}</div>
      <div className="flex gap-1">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex-1 cursor-pointer border px-2 py-1 text-xs transition-colors ${
              value === opt.value
                ? "border-neutral-800 bg-neutral-800/10 text-neutral-800"
                : "border-black/20 text-neutral-500 hover:text-neutral-800"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default SelectControl;
