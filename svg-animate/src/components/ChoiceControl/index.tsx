type ChoiceControlProps<T extends string> = {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
};

function ChoiceControl<T extends string>({
  label,
  value,
  options,
  onChange,
}: ChoiceControlProps<T>) {
  return (
    <div className="block">
      <div className="mb-1 text-xs text-neutral-500">{label}</div>
      <div className="flex gap-px border border-black/20 bg-black/20">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`flex-1 cursor-pointer py-1 text-xs transition-colors ${
              option.value === value
                ? "bg-neutral-800 text-[#f5f0e6]"
                : "bg-[#f5f0e6] text-neutral-600 hover:text-neutral-900"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default ChoiceControl;
