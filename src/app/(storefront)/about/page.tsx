import { ContentPage } from '@/components/storefront/ContentPage'
import { DEFAULT_ABOUT_DATA, getAboutData } from '@/lib/db'
import { IconMail, IconMapPin, IconPhone } from '@/components/icons'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const about = await getAboutData().catch(() => DEFAULT_ABOUT_DATA)

  const paragraphs = (about.story || '')
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)

  const hasContactInfo = Boolean(about.address || about.email || about.phone)

  return (
    <ContentPage
      title={about.title || 'About ARA'}
      lede={about.lede || 'A quiet cosmetics house for everyday skin, color and scent.'}
    >
      <div className="space-y-4">
        {paragraphs.map((p, idx) => (
          <p key={idx} className="whitespace-pre-line">
            {p}
          </p>
        ))}
      </div>

      {hasContactInfo && (
        <div className="mt-10 rounded-2xl border border-ink-100 bg-white p-6 shadow-card sm:p-7">
          <h2 className="text-base font-semibold text-ink-900">
            Contact &amp; Store Location
          </h2>
          <p className="mt-1 text-xs text-ink-500">
            Reach out to our team or find our store details below.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {about.address && (
              <div className="flex items-start gap-3 sm:col-span-2">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-ink-100 text-ink-700">
                  <IconMapPin width={16} height={16} />
                </span>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-ink-400">
                    Address
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-ink-900 whitespace-pre-line">
                    {about.address}
                  </p>
                </div>
              </div>
            )}

            {about.email && (
              <div className="flex items-start gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-ink-100 text-ink-700">
                  <IconMail width={16} height={16} />
                </span>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-ink-400">
                    Email
                  </p>
                  <a
                    href={`mailto:${about.email}`}
                    className="mt-0.5 inline-block text-sm font-medium text-brand-700 underline-offset-2 hover:underline"
                  >
                    {about.email}
                  </a>
                </div>
              </div>
            )}

            {about.phone && (
              <div className="flex items-start gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-ink-100 text-ink-700">
                  <IconPhone width={16} height={16} />
                </span>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-ink-400">
                    Contact Number
                  </p>
                  <a
                    href={`tel:${about.phone}`}
                    className="mt-0.5 inline-block text-sm font-medium text-ink-900 hover:text-brand-700"
                  >
                    {about.phone}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </ContentPage>
  )
}
