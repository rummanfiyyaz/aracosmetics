import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Tone = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'sale'

const toneClasses: Record<Tone, string> = {
  default: 'bg-ink-100 text-ink-700',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-rose-100 text-rose-700',
  info: 'bg-brand-100 text-brand-700',
  sale: 'bg-rose-600 text-white',
}

export function Badge({
  tone = 'default',
  children,
  className,
}: {
  tone?: Tone
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
