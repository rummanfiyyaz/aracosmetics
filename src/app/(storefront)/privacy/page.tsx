import { ContentPage } from '@/components/storefront/ContentPage'
import { DEFAULT_PRIVACY_DATA, getPrivacyData } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const privacy = await getPrivacyData().catch(() => DEFAULT_PRIVACY_DATA)

  const paragraphs = (privacy.content || '')
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)

  return (
    <ContentPage
      title={privacy.title || 'Privacy policy'}
      lede={privacy.lede || 'We collect only what we need to fulfill your order.'}
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
