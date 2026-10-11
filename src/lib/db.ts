import 'server-only'
import type { Collection } from 'mongodb'
import { getDb } from './mongo'
import type {
  Category,
  CategorySlug,
  HeroSlide,
  Order,
  OrderStatus,
  PaymentStatus,
  Product,
  Review,
  StoreSettings,
} from '@/data/types'
import { defaultCategories, defaultHeroSlides } from '@/data/categories'

async function products(): Promise<Collection<Product>> {
  const db = await getDb()
  return db.collection<Product>('products')
}

async function orders(): Promise<Collection<Order>> {
  const db = await getDb()
  return db.collection<Order>('orders')
}

async function categoriesCol(): Promise<Collection<Category>> {
  const db = await getDb()
  return db.collection<Category>('categories')
}

async function heroSlidesCol(): Promise<Collection<HeroSlide>> {
  const db = await getDb()
  return db.collection<HeroSlide>('heroSlides')
}

interface SettingsDoc extends StoreSettings {
  key: 'store'
}

async function settingsCol(): Promise<Collection<SettingsDoc>> {
  const db = await getDb()
  return db.collection<SettingsDoc>('settings')
}

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  name: 'ARA',
  tagline: 'Beauty, refined.',
  supportEmail: 'hello@ara.store',
  currency: 'USD',
  description:
    'Clean, considered cosmetics for every ritual — skincare, makeup and fragrance, shipped worldwide.',
}

const LIFESTYLE_CATEGORY_SLUGS = [
  'water-bottles',
  'kitchen-products',
  'kids-accessories',
  'watches',
  'ladies-hand-bags',
  'thermos-bottles',
  'electric-frames',
]

const LEGACY_STORE_NAMES = new Set([
  'Thread & Gear',
  'Home & Kitchen',
  'HomieShops',
  'Homie Shops',
])

function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

const stripId = <T extends { _id?: unknown }>(doc: T): Omit<T, '_id'> => {
  const { _id, ...rest } = doc
  void _id
  return rest
}

// ----- Products -----

export async function listProducts(): Promise<Product[]> {
  try {
    const col = await products()
    const docs = await col.find({}).sort({ createdAt: -1 }).toArray()
    return docs.map(stripId) as Product[]
  } catch (err) {
    console.error('listProducts failed', err)
    return []
  }
}

export async function getProductById(id: string): Promise<Product | undefined> {
  try {
    const col = await products()
    const doc = await col.findOne({ id })
    return doc ? (stripId(doc) as Product) : undefined
  } catch (err) {
    console.error('getProductById failed', err)
    return undefined
  }
}

export async function getProductBySlug(
  slug: string,
): Promise<Product | undefined> {
  try {
    const col = await products()
    const doc = await col.findOne({ slug })
    return doc ? (stripId(doc) as Product) : undefined
  } catch (err) {
    console.error('getProductBySlug failed', err)
    return undefined
  }
}

export async function getProductsByCategory(
  categorySlug: string,
): Promise<Product[]> {
  try {
    const col = await products()
    const docs = await col
      .find({ category: categorySlug as CategorySlug })
      .sort({ createdAt: -1 })
      .toArray()
    return docs.map(stripId) as Product[]
  } catch (err) {
    console.error('getProductsByCategory failed', err)
    return []
  }
}

export async function getRelatedProducts(
  product: Product,
  limit = 4,
): Promise<Product[]> {
  try {
    const col = await products()
    const docs = await col
      .find({ category: product.category, id: { $ne: product.id } })
      .limit(limit)
      .toArray()
    return docs.map(stripId) as Product[]
  } catch (err) {
    console.error('getRelatedProducts failed', err)
    return []
  }
}

export async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const col = await products()
    const docs = await col.find({ featured: true }).toArray()
    return docs.map(stripId) as Product[]
  } catch (err) {
    console.error('getFeaturedProducts failed', err)
    return []
  }
}

export async function countProducts(): Promise<number> {
  try {
    const col = await products()
    return await col.countDocuments({ status: 'active' })
  } catch (err) {
    console.error('countProducts failed', err)
    return 0
  }
}

export async function countCustomers(): Promise<number> {
  try {
    const col = await orders()
    const emails = await col.distinct('email')
    return emails.length
  } catch (err) {
    console.error('countCustomers failed', err)
    return 0
  }
}

export async function addProductReview(
  slug: string,
  review: Omit<Review, 'id' | 'date'>,
): Promise<Product | undefined> {
  const col = await products()
  const existing = await col.findOne({ slug })
  if (!existing) return undefined
  const newReview: Review = {
    ...review,
    id: `r-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    date: new Date().toISOString().slice(0, 10),
  }
  const reviews = [...(existing.reviews ?? []), newReview]
  const reviewCount = reviews.length
  const rating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
  const result = await col.findOneAndUpdate(
    { slug },
    { $set: { reviews, reviewCount, rating: Number(rating.toFixed(2)) } },
    { returnDocument: 'after' },
  )
  return result ? (stripId(result) as Product) : undefined
}

export async function createProduct(
  input: Omit<Product, 'id' | 'createdAt'>,
): Promise<Product> {
  const col = await products()
  const product: Product = {
    ...input,
    id: `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
  }
  await col.insertOne({ ...product })
  return product
}

export async function updateProduct(
  id: string,
  patch: Partial<Product>,
): Promise<Product | undefined> {
  const col = await products()
  const { id: _drop, ...safePatch } = patch
  void _drop
  const result = await col.findOneAndUpdate(
    { id },
    { $set: safePatch },
    { returnDocument: 'after' },
  )
  return result ? (stripId(result) as Product) : undefined
}

export async function deleteProduct(id: string): Promise<boolean> {
  const col = await products()
  const result = await col.deleteOne({ id })
  return result.deletedCount > 0
}

// ----- Orders -----

export async function listOrders(): Promise<Order[]> {
  const col = await orders()
  const docs = await col.find({}).sort({ date: -1 }).toArray()
  return docs.map(stripId) as Order[]
}

export async function getOrder(id: string): Promise<Order | undefined> {
  const col = await orders()
  const doc = await col.findOne({ id })
  return doc ? (stripId(doc) as Order) : undefined
}

async function nextOrderId(): Promise<string> {
  const col = await orders()
  const docs = await col.find({}, { projection: { id: 1 } }).toArray()
  const nums = docs
    .map((o) => Number(String(o.id).replace(/[^0-9]/g, '')))
    .filter((n) => Number.isFinite(n))
  const next = (nums.length ? Math.max(...nums) : 10240) + 1
  return `ARA-${next}`
}

export async function createOrder(
  input: Omit<Order, 'id' | 'date' | 'status' | 'paymentStatus'> & {
    status?: OrderStatus
    paymentStatus?: PaymentStatus
  },
): Promise<Order> {
  const col = await orders()
  const order: Order = {
    ...input,
    id: await nextOrderId(),
    status: input.status ?? 'pending',
    paymentStatus: input.paymentStatus ?? 'unpaid',
    date: new Date().toISOString().slice(0, 10),
  }
  await col.insertOne({ ...order })
  return order
}

export async function updateOrder(
  id: string,
  patch: Partial<Order>,
): Promise<Order | undefined> {
  const col = await orders()
  const { id: _drop, ...safePatch } = patch
  void _drop
  const result = await col.findOneAndUpdate(
    { id },
    { $set: safePatch },
    { returnDocument: 'after' },
  )
  return result ? (stripId(result) as Order) : undefined
}

export async function getOrderByStripeSession(
  sessionId: string,
): Promise<Order | undefined> {
  const col = await orders()
  const doc = await col.findOne({ stripeCheckoutSessionId: sessionId })
  return doc ? (stripId(doc) as Order) : undefined
}

export async function getOrderByPaymentIntent(
  paymentIntentId: string,
): Promise<Order | undefined> {
  const col = await orders()
  const doc = await col.findOne({ stripePaymentIntentId: paymentIntentId })
  return doc ? (stripId(doc) as Order) : undefined
}

export async function decrementStockForOrder(order: Order): Promise<void> {
  const col = await products()
  await Promise.all(
    order.items.map((item) =>
      col.updateOne(
        { id: item.productId },
        { $inc: { stock: -item.quantity } },
      ),
    ),
  )
}

export async function markOrderPaid(
  id: string,
  details: {
    stripeCheckoutSessionId?: string
    stripePaymentIntentId?: string
  },
): Promise<Order | undefined> {
  const existing = await getOrder(id)
  if (!existing) return undefined
  if (existing.paymentStatus === 'paid') return existing

  await decrementStockForOrder(existing)
  return updateOrder(id, {
    paymentStatus: 'paid',
    status: 'processing',
    paymentMethod: 'stripe',
    ...details,
  })
}

export async function updateOrderStatus(
  id: string,
  status: Order['status'],
): Promise<Order | undefined> {
  const col = await orders()
  const result = await col.findOneAndUpdate(
    { id },
    { $set: { status } },
    { returnDocument: 'after' },
  )
  return result ? (stripId(result) as Order) : undefined
}

// ----- Categories -----

async function seedCategoriesIfEmpty(col: Collection<Category>): Promise<void> {
  const anyDoc = await col.findOne({})
  if (anyDoc) return
  const now = new Date().toISOString()
  const docs: Category[] = defaultCategories.map((seed, i) => ({
    ...seed,
    id: makeId('cat'),
    hidden: false,
    sortOrder: seed.sortOrder ?? (i + 1) * 10,
    createdAt: now,
  }))
  if (docs.length) await col.insertMany(docs.map((d) => ({ ...d })))
}

async function migrateToCosmeticsCategories(
  col: Collection<Category>,
): Promise<void> {
  await col.updateMany(
    { slug: { $in: LIFESTYLE_CATEGORY_SLUGS } },
    { $set: { hidden: true } },
  )

  const now = new Date().toISOString()
  for (const seed of defaultCategories) {
    const matches = await col.find({ slug: seed.slug }).toArray()
    if (matches.length === 0) {
      await col.insertOne({
        ...seed,
        id: makeId('cat'),
        hidden: false,
        sortOrder: seed.sortOrder ?? 10,
        createdAt: now,
      })
      continue
    }
    if (matches.length > 1) {
      const keep = matches[0] as Category
      await col.deleteMany({
        slug: seed.slug,
        id: { $ne: keep.id },
      })
    }
    await col.updateOne(
      { slug: seed.slug },
      { $set: { hidden: false, name: seed.name, short: seed.short } },
    )
  }
}

const sortCategories = (a: Category, b: Category) => {
  const sa = a.sortOrder ?? Number.MAX_SAFE_INTEGER
  const sb = b.sortOrder ?? Number.MAX_SAFE_INTEGER
  if (sa !== sb) return sa - sb
  return a.name.localeCompare(b.name)
}

export async function listCategories(): Promise<Category[]> {
  try {
    const col = await categoriesCol()
    await seedCategoriesIfEmpty(col)
    await migrateToCosmeticsCategories(col)
    const docs = await col.find({}).toArray()
    return (docs.map(stripId) as Category[]).sort(sortCategories)
  } catch (err) {
    console.error('listCategories failed', err)
    return []
  }
}

export async function listVisibleCategories(): Promise<Category[]> {
  const all = await listCategories()
  return all.filter((c) => !c.hidden)
}

export async function getCategoryBySlug(
  slug: string,
): Promise<Category | undefined> {
  try {
    const col = await categoriesCol()
    await seedCategoriesIfEmpty(col)
    await migrateToCosmeticsCategories(col)
    const doc = await col.findOne({ slug })
    return doc ? (stripId(doc) as Category) : undefined
  } catch (err) {
    console.error('getCategoryBySlug failed', err)
    return undefined
  }
}

export async function getCategoryById(
  id: string,
): Promise<Category | undefined> {
  const col = await categoriesCol()
  const doc = await col.findOne({ id })
  return doc ? (stripId(doc) as Category) : undefined
}

export async function createCategory(
  input: Omit<Category, 'id' | 'createdAt'>,
): Promise<Category> {
  const col = await categoriesCol()
  const category: Category = {
    ...input,
    id: makeId('cat'),
    createdAt: new Date().toISOString(),
  }
  await col.insertOne({ ...category })
  return category
}

export async function updateCategory(
  id: string,
  patch: Partial<Category>,
): Promise<Category | undefined> {
  const col = await categoriesCol()
  const { id: _drop, ...safePatch } = patch
  void _drop
  const result = await col.findOneAndUpdate(
    { id },
    { $set: safePatch },
    { returnDocument: 'after' },
  )
  return result ? (stripId(result) as Category) : undefined
}

export async function deleteCategory(id: string): Promise<boolean> {
  const col = await categoriesCol()
  const result = await col.deleteOne({ id })
  return result.deletedCount > 0
}

export async function isCategorySlugTaken(
  slug: string,
  excludeId?: string,
): Promise<boolean> {
  const col = await categoriesCol()
  const doc = await col.findOne({ slug })
  if (!doc) return false
  if (excludeId && (doc as Category).id === excludeId) return false
  return true
}

// ----- Hero Slides -----

async function seedHeroSlidesIfEmpty(
  col: Collection<HeroSlide>,
): Promise<void> {
  const anyDoc = await col.findOne({})
  if (anyDoc) return
  const now = new Date().toISOString()
  const docs: HeroSlide[] = defaultHeroSlides.map((seed, i) => ({
    ...seed,
    id: makeId('slide'),
    hidden: false,
    sortOrder: seed.sortOrder ?? (i + 1) * 10,
    createdAt: now,
  }))
  if (docs.length) await col.insertMany(docs.map((d) => ({ ...d })))
}

async function migrateToCosmeticsSlides(
  col: Collection<HeroSlide>,
): Promise<void> {
  const existing = await col.find({}).toArray()
  const hasCosmetics = existing.some((s) =>
    defaultHeroSlides.some((seed) => seed.ctaHref === s.ctaHref),
  )
  if (hasCosmetics) return

  if (existing.length) {
    await col.updateMany({}, { $set: { hidden: true } })
  }

  const now = new Date().toISOString()
  await col.insertMany(
    defaultHeroSlides.map((seed, i) => ({
      ...seed,
      id: makeId('slide'),
      hidden: false,
      sortOrder: seed.sortOrder ?? (i + 1) * 10,
      createdAt: now,
    })),
  )
}

const sortSlides = (a: HeroSlide, b: HeroSlide) => {
  const sa = a.sortOrder ?? Number.MAX_SAFE_INTEGER
  const sb = b.sortOrder ?? Number.MAX_SAFE_INTEGER
  if (sa !== sb) return sa - sb
  return a.createdAt.localeCompare(b.createdAt)
}

export async function listHeroSlides(): Promise<HeroSlide[]> {
  try {
    const col = await heroSlidesCol()
    await seedHeroSlidesIfEmpty(col)
    await migrateToCosmeticsSlides(col)
    const docs = await col.find({}).toArray()
    return (docs.map(stripId) as HeroSlide[]).sort(sortSlides)
  } catch (err) {
    console.error('listHeroSlides failed', err)
    return []
  }
}

export async function listVisibleHeroSlides(): Promise<HeroSlide[]> {
  const all = await listHeroSlides()
  return all.filter((s) => !s.hidden)
}

export async function getHeroSlideById(
  id: string,
): Promise<HeroSlide | undefined> {
  const col = await heroSlidesCol()
  const doc = await col.findOne({ id })
  return doc ? (stripId(doc) as HeroSlide) : undefined
}

export async function createHeroSlide(
  input: Omit<HeroSlide, 'id' | 'createdAt'>,
): Promise<HeroSlide> {
  const col = await heroSlidesCol()
  const slide: HeroSlide = {
    ...input,
    id: makeId('slide'),
    createdAt: new Date().toISOString(),
  }
  await col.insertOne({ ...slide })
  return slide
}

export async function updateHeroSlide(
  id: string,
  patch: Partial<HeroSlide>,
): Promise<HeroSlide | undefined> {
  const col = await heroSlidesCol()
  const { id: _drop, ...safePatch } = patch
  void _drop
  const result = await col.findOneAndUpdate(
    { id },
    { $set: safePatch },
    { returnDocument: 'after' },
  )
  return result ? (stripId(result) as HeroSlide) : undefined
}

export async function deleteHeroSlide(id: string): Promise<boolean> {
  const col = await heroSlidesCol()
  const result = await col.deleteOne({ id })
  return result.deletedCount > 0
}

// ----- Store settings -----

export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const col = await settingsCol()
    const doc = await col.findOne({ key: 'store' })
    if (!doc) return DEFAULT_STORE_SETTINGS
    const { key: _key, ...rest } = stripId(doc) as SettingsDoc
    void _key
    const merged = { ...DEFAULT_STORE_SETTINGS, ...rest }
    const patch: Partial<StoreSettings> = {}
    if (merged.currency === 'PKR') patch.currency = 'USD'
    if (LEGACY_STORE_NAMES.has(merged.name)) {
      patch.name = DEFAULT_STORE_SETTINGS.name
      patch.tagline = DEFAULT_STORE_SETTINGS.tagline
      patch.description = DEFAULT_STORE_SETTINGS.description
      patch.supportEmail = DEFAULT_STORE_SETTINGS.supportEmail
    }
    if (Object.keys(patch).length > 0) {
      const next = { ...merged, ...patch }
      await col.updateOne(
        { key: 'store' },
        { $set: { ...next, key: 'store' } },
        { upsert: true },
      )
      return next
    }
    return merged
  } catch (err) {
    console.error('getStoreSettings failed', err)
    return DEFAULT_STORE_SETTINGS
  }
}

export async function updateStoreSettings(
  patch: Partial<StoreSettings>,
): Promise<StoreSettings> {
  const col = await settingsCol()
  const current = await getStoreSettings()
  const next: StoreSettings = { ...current, ...patch }
  await col.updateOne(
    { key: 'store' },
    { $set: { ...next, key: 'store' } },
    { upsert: true },
  )
  return next
}
