type TextControlProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
};

function TextControl({ label, value, onChange, maxLength }: TextControlProps) {
  return (
    <label className="block">
      <div className="mb-1 text-xs text-neutral-500">{label}</div>
      <input
        type="text"
        value={value}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-black/20 bg-[#f5f0e6] px-2 py-1 text-center text-sm text-neutral-800 focus:border-black/40 focus:outline-none"
      />
    </label>
  );
}

export default TextControl;
