type TextControlProps = {
  label: string;
  value: string;
  maxLength?: number;
  onChange: (value: string) => void;
};

function TextControl({ label, value, maxLength, onChange }: TextControlProps) {
  return (
    <label className="block">
      <div className="mb-1 text-xs text-neutral-500">{label}</div>
      <input
        type="text"
        value={value}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border-b border-black/20 bg-transparent pb-1 text-sm text-neutral-800 outline-none transition-colors focus:border-black/50"
      />
    </label>
  );
}

export default TextControl;
