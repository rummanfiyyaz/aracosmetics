import Link from 'next/link'
import {
  DEFAULT_STORE_SETTINGS,
  countCustomers,
  countProducts,
  getFeaturedProducts,
  getStoreSettings,
  listVisibleCategories,
  listVisibleHeroSlides,
} from '@/lib/db'
import { HeroCarousel } from '@/components/storefront/HeroCarousel'
import { ProductSlider } from '@/components/storefront/ProductSlider'
import { Button } from '@/components/ui/Button'
import {
  IconChevronRight,
  IconGift,
  IconShield,
  IconTruck,
} from '@/components/icons'
import { formatPrice } from '@/lib/format'
import { FREE_SHIPPING_THRESHOLD } from '@/lib/pricing'

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)}k`
  return `${n}`
}

export async function HomePage() {
  const [featured, productCount, customerCount, categories, slides, settings] =
    await Promise.all([
      getFeaturedProducts().catch((err) => {
        console.error('getFeaturedProducts failed', err)
        return []
      }),
      countProducts(),
      countCustomers(),
      listVisibleCategories(),
      listVisibleHeroSlides(),
      getStoreSettings().catch(() => DEFAULT_STORE_SETTINGS),
    ])

  return (
    <>
      {slides.length > 0 && <HeroCarousel slides={slides} />}

      <section className="border-b border-ink-100 bg-white">
        <div className="container-page grid grid-cols-2 gap-6 py-6 text-sm sm:grid-cols-4">
          <Stat label="Products" value={`${productCount}${productCount > 0 ? '+' : ''}`} />
          <Stat label="Happy customers" value={formatCount(customerCount)} />
          <Stat
            label="Free shipping"
            value={`${formatPrice(FREE_SHIPPING_THRESHOLD)}+`}
          />
          <Stat label="Delivery" value="Worldwide" />
        </div>
      </section>

      {categories.length > 0 && (
        <section className="container-page py-16 lg:py-20">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-brand-600">
                Shop by category
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-ink-900 sm:text-3xl">
                Find your next ritual
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/${c.slug}`}
                className="group relative overflow-hidden rounded-2xl bg-ink-100 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover"
              >
                <div className="aspect-[4/5]">
                  <img
                    src={c.image}
                    alt={c.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 via-ink-900/20 to-transparent" />
                <div className="absolute inset-x-3 bottom-3 sm:inset-x-4 sm:bottom-4">
                  <p className="text-sm font-semibold text-white sm:text-base">
                    {c.name}
                  </p>
                  <p className="mt-0.5 hidden text-xs text-white/80 sm:block">
                    {c.short}
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-white/90">
                    Shop
                    <IconChevronRight width={12} height={12} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="container-page py-6 pb-16 lg:pb-20">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-brand-600">
              Featured
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-ink-900 sm:text-3xl">
              Trending this week
            </h2>
          </div>
          {categories[0] && (
            <Link
              href={`/${categories[0].slug}`}
              className="hidden text-sm font-medium text-ink-700 hover:text-ink-900 sm:inline-flex sm:items-center sm:gap-1"
            >
              View all
              <IconChevronRight width={14} height={14} />
            </Link>
          )}
        </div>
        <ProductSlider
          products={featured}
          emptyMessage="No trending products yet."
          autoScroll
        />
      </section>

      <section className="bg-white py-16 lg:py-20">
        <div className="container-page">
          <div className="mb-10 text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-brand-600">
              Why {settings.name}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-ink-900 sm:text-3xl">
              Quiet luxury. Honest formulas.
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
            <Benefit
              icon={<IconShield />}
              title="Considered formulas"
              body="Every product is chosen for feel, finish and ingredients you can wear every day."
            />
            <Benefit
              icon={<IconTruck />}
              title="Worldwide shipping"
              body={`Free tracked shipping over ${formatPrice(FREE_SHIPPING_THRESHOLD)}.`}
            />
            <Benefit
              icon={<IconGift />}
              title="Easy returns"
              body="30-day returns on unused items. If it isn’t right, send it back."
            />
          </div>
        </div>
      </section>

      <section className="container-page py-16 lg:py-20">
        <div className="relative overflow-hidden rounded-3xl bg-ink-900 px-6 py-14 text-center text-white sm:px-14 sm:py-20">
          <div
            className="absolute inset-0 opacity-50"
            style={{
              backgroundImage:
                'radial-gradient(80% 60% at 50% 0%, rgba(184,107,98,.55), transparent 60%), radial-gradient(80% 60% at 100% 100%, rgba(208,142,133,.35), transparent 60%)',
            }}
          />
          <div className="relative">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Ready for your next ritual?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-white/70 sm:text-base">
              Browse the full edit or start with what your skin needs today.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {categories[0] && (
                <Link href={`/${categories[0].slug}`}>
                  <Button variant="brand" size="lg">
                    Shop the store
                  </Button>
                </Link>
              )}
              {categories[1] && (
                <Link href={`/${categories[1].slug}`}>
                  <Button
                    variant="secondary"
                    size="lg"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    {categories[1].name}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-ink-500">{label}</p>
      <p className="mt-1 text-base font-semibold text-ink-900 sm:text-lg">
        {value}
      </p>
    </div>
  )
}

function Benefit({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode
  title: string
  body: string
}) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-ink-50/60 p-5 shadow-card sm:p-6">
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
        {icon}
      </div>
      <p className="mt-4 text-base font-semibold text-ink-900">{title}</p>
      <p className="mt-1 text-sm text-ink-500">{body}</p>
    </div>
  )
}
