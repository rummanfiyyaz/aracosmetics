import { ContentPage } from '@/components/storefront/ContentPage'
import { DEFAULT_TERMS_DATA, getTermsData } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const terms = await getTermsData().catch(() => DEFAULT_TERMS_DATA)

  const paragraphs = (terms.content || '')
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)

  return (
    <ContentPage
      title={terms.title || 'Terms of service'}
      lede={terms.lede || 'By placing an order you agree to these terms.'}
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
