export type CategorySlug = string

export interface Category {
  id: string
  slug: string
  name: string
  short: string
  description: string
  image: string
  banner: string
  hidden?: boolean
  sortOrder?: number
  createdAt: string
}

export interface HeroSlide {
  id: string
  image: string
  eyebrow: string
  title: string
  highlight?: string
  description: string
  ctaLabel: string
  ctaHref: string
  hidden?: boolean
  sortOrder?: number
  createdAt: string
}

export interface Review {
  id: string
  author: string
  rating: number
  title: string
  body: string
  date: string
}

export interface ProductVariant {
  id: string
  label: string
  swatch?: string
}

export interface Product {
  id: string
  slug: string
  name: string
  category: CategorySlug
  price: number
  discountPrice?: number
  rating: number
  reviewCount: number
  images: string[]
  shortDescription: string
  description: string
  features: string[]
  specifications: Record<string, string>
  variants?: ProductVariant[]
  stock: number
  sku: string
  status: 'active' | 'draft' | 'archived'
  featured?: boolean
  createdAt: string
  reviews: Review[]
}

export interface CartItem {
  id: string
  productId: string
  slug: string
  name: string
  image: string
  price: number
  quantity: number
  variant?: string
  stock: number
}

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export type PaymentStatus = 'unpaid' | 'paid' | 'failed' | 'refunded'

export interface OrderItem {
  productId: string
  slug: string
  name: string
  image: string
  variant?: string
  price: number
  quantity: number
}

export interface ShippingAddress {
  line1: string
  line2?: string
  city: string
  region: string
  postalCode: string
  country: string
}

export interface StoreSettings {
  name: string
  tagline: string
  supportEmail: string
  currency: string
  description: string
}

export interface Order {
  id: string
  customer: string
  email: string
  phone?: string
  items: OrderItem[]
  itemCount: number
  subtotal: number
  shipping: number
  tax: number
  total: number
  address: ShippingAddress
  notes?: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod?: 'stripe'
  stripeCheckoutSessionId?: string
  stripePaymentIntentId?: string
  date: string
}
