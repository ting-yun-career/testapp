import type { HTMLInputTypeAttribute } from 'react'

type TextControlProps = {
  label: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  type?: HTMLInputTypeAttribute
  value: string
}

export default function TextControl({
  label,
  onChange,
  placeholder,
  required = false,
  type = 'text',
  value,
}: TextControlProps) {
  return (
    <label className="mt-6 block">
      <span className="mb-[0.7rem] block text-[0.95rem] font-semibold text-white/95">
        {label}
        {required ? <span className="text-red-400"> *</span> : ''}
      </span>
      <input
        className="min-h-[3.55rem] w-full rounded-[3px] border border-white/18 bg-black/18 px-4 text-white outline-none placeholder:text-white/42"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        value={value}
      />
    </label>
  )
}
