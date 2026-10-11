import type { ReactNode } from 'react'

export function ContentPage({
  title,
  lede,
  children,
}: {
  title: string
  lede?: string
  children: ReactNode
}) {
  return (
    <section className="container-page py-12 lg:py-16">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-semibold text-ink-900 sm:text-4xl">
          {title}
        </h1>
        {lede && (
          <p className="mt-3 text-base leading-relaxed text-ink-500">{lede}</p>
        )}
        <div className="mt-8 space-y-4 text-sm leading-relaxed text-ink-700 sm:text-base">
          {children}
        </div>
      </div>
    </section>
  )
}
