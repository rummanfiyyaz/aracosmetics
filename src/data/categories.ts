import type { Category, HeroSlide } from './types'

type CategorySeed = Omit<Category, 'id' | 'createdAt'>
type HeroSlideSeed = Omit<HeroSlide, 'id' | 'createdAt'>

export const defaultCategories: CategorySeed[] = [
  {
    slug: 'skincare',
    name: 'Skincare',
    short: 'Clean rituals, visible glow.',
    description:
      'Serums, moisturizers and treatments formulated for everyday skin — gentle, effective and easy to love.',
    image:
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
    banner:
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1600&q=80',
    sortOrder: 10,
  },
  {
    slug: 'makeup',
    name: 'Makeup',
    short: 'Color that feels like skin.',
    description:
      'Lightweight foundations, quiet nudes and statement color — makeup designed to look like you, only fresher.',
    image:
      'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80',
    banner:
      'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1600&q=80',
    sortOrder: 20,
  },
  {
    slug: 'hair',
    name: 'Hair',
    short: 'Soft, healthy, considered.',
    description:
      'Shampoos, treatments and styling essentials that keep hair clean, strong and quietly polished.',
    image:
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    banner:
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1600&q=80',
    sortOrder: 30,
  },
  {
    slug: 'fragrance',
    name: 'Fragrance',
    short: 'A signature, not a shout.',
    description:
      'Modern scents with clean notes — from skin musks to quiet florals, made for all-day wear.',
    image:
      'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80',
    banner:
      'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1600&q=80',
    sortOrder: 40,
  },
  {
    slug: 'body',
    name: 'Body',
    short: 'From shower to soft skin.',
    description:
      'Body oils, washes and lotions that leave skin nourished without heaviness or residue.',
    image:
      'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=800&q=80',
    banner:
      'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=1600&q=80',
    sortOrder: 50,
  },
  {
    slug: 'tools',
    name: 'Tools',
    short: 'The extras that matter.',
    description:
      'Brushes, sponges and applicators chosen for feel and finish — the quiet half of a good routine.',
    image:
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80',
    banner:
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1600&q=80',
    sortOrder: 60,
  },
]

export const defaultHeroSlides: HeroSlideSeed[] = [
  {
    image:
      'https://images.unsplash.com/photo-1570172619604-71b99e3b4020?auto=format&fit=crop&w=1600&q=80',
    eyebrow: 'New arrivals',
    title: 'Skin that looks',
    highlight: 'like itself.',
    description:
      'A considered edit of serums, creams and everyday essentials — formulated to feel light and wear well.',
    ctaLabel: 'Shop Skincare',
    ctaHref: '/skincare',
    sortOrder: 10,
  },
  {
    image:
      'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1600&q=80',
    eyebrow: 'Color',
    title: 'Makeup, made',
    highlight: 'quietly beautiful.',
    description:
      'Soft pigments and clean finishes for days when you want a little more — and days when you want almost nothing.',
    ctaLabel: 'Shop Makeup',
    ctaHref: '/makeup',
    sortOrder: 20,
  },
  {
    image:
      'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1600&q=80',
    eyebrow: 'Scent',
    title: 'Fragrance for',
    highlight: 'close range.',
    description:
      'Modern notes that stay on skin, not in the room. Discover a signature that feels like yours.',
    ctaLabel: 'Shop Fragrance',
    ctaHref: '/fragrance',
    sortOrder: 30,
  },
]

export const RESERVED_SLUGS = new Set([
  'cart',
  'checkout',
  'order',
  'product',
  'admin',
  'api',
  'about',
  'contact',
  'shipping',
  'returns',
  'privacy',
  'terms',
])
