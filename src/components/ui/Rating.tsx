import { IconStar } from '@/components/icons'
import { cn } from '@/lib/cn'

interface RatingProps {
  value: number
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  count?: number
  className?: string
}

export function Rating({ value, size = 'sm', showValue, count, className }: RatingProps) {
  const px = size === 'lg' ? 18 : size === 'md' ? 16 : 14
  const stars = Array.from({ length: 5 }, (_, i) => i + 1)
  return (
    <div className={cn('inline-flex items-center gap-1.5', className)}>
      <div className="flex items-center gap-0.5">
        {stars.map((n) => (
          <IconStar
            key={n}
            width={px}
            height={px}
            className={cn(
              n <= Math.round(value) ? 'text-amber-400' : 'text-ink-200',
            )}
          />
        ))}
      </div>
      {showValue && (
        <span className="text-xs font-medium text-ink-600">
          {value.toFixed(1)}
          {count !== undefined && (
            <span className="text-ink-400 font-normal"> ({count})</span>
          )}
        </span>
      )}
    </div>
  )
}
