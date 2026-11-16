import { ContentPage } from '@/components/storefront/ContentPage'
import { DEFAULT_CONTACT_DATA, getContactData } from '@/lib/db'
import { IconClock, IconMail, IconPhone } from '@/components/icons'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const contact = await getContactData().catch(() => DEFAULT_CONTACT_DATA)

  const paragraphs = (contact.content || '')
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)

  const hasContactInfo = Boolean(contact.email || contact.phone || contact.hours)

  return (
    <ContentPage
      title={contact.title || 'Contact & Order Help'}
      lede={contact.lede || 'Questions about an order, a formula, or shipping? We are here.'}
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
            Customer Support Channels
          </h2>
          <p className="mt-1 text-xs text-ink-500">
            Reach out through our direct support lines below. Include your order number for faster assistance.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {contact.email && (
              <div className="flex items-start gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-ink-100 text-ink-700">
                  <IconMail width={16} height={16} />
                </span>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-ink-400">
                    Support Email
                  </p>
                  <a
                    href={`mailto:${contact.email}`}
                    className="mt-0.5 inline-block text-sm font-medium text-brand-700 underline-offset-2 hover:underline"
                  >
                    {contact.email}
                  </a>
                </div>
              </div>
            )}

            {contact.phone && (
              <div className="flex items-start gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-ink-100 text-ink-700">
                  <IconPhone width={16} height={16} />
                </span>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-ink-400">
                    Helpline / Phone
                  </p>
                  <a
                    href={`tel:${contact.phone}`}
                    className="mt-0.5 inline-block text-sm font-medium text-ink-900 hover:text-brand-700"
                  >
                    {contact.phone}
                  </a>
                </div>
              </div>
            )}

            {contact.hours && (
              <div className="flex items-start gap-3 sm:col-span-2">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-ink-100 text-ink-700">
                  <IconClock width={16} height={16} />
                </span>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-ink-400">
                    Operating Hours
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-ink-900">
                    {contact.hours}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </ContentPage>
  )
}
