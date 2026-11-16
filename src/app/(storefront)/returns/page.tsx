import { ContentPage } from '@/components/storefront/ContentPage'
import { DEFAULT_RETURNS_DATA, getReturnsData } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const returns = await getReturnsData().catch(() => DEFAULT_RETURNS_DATA)

  const paragraphs = (returns.content || '')
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)

  return (
    <ContentPage
      title={returns.title || 'Returns'}
      lede={returns.lede || 'If it isn’t right, send it back within 30 days.'}
    >
      <div className="space-y-4">
        {paragraphs.map((p, idx) => (
          <p key={idx} className="whitespace-pre-line">
            {p}
          </p>
        ))}
      </div>
    </ContentPage>
  )
}
