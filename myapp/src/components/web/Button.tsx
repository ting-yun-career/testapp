import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonProps = {
  children: ReactNode
  variant?: 'ghost' | 'solid'
} & ButtonHTMLAttributes<HTMLButtonElement>

export default function Button({
  children,
  variant = 'solid',
  ...props
}: ButtonProps) {
  const baseClassName =
    'min-w-[8.5rem] cursor-pointer rounded-[3px] border border-transparent px-[1.4rem] py-[0.9rem] text-base font-semibold transition'
  const variantClassName =
    variant === 'solid'
      ? 'bg-slate-100 text-[#111] hover:bg-slate-200:text-[#222]'
      : 'bg-transparent text-white/72 hover:text-white'

  return (
    <button
      className={`${baseClassName} ${variantClassName}`}
      type="button"
      {...props}
    >
      {children}
    </button>
  )
}
