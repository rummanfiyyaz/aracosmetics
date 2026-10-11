'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { CartItem, Product } from '@/data/types'

interface CartState {
  items: CartItem[]
  count: number
  subtotal: number
  isOpen: boolean
  addItem: (product: Product, quantity?: number, variant?: string) => void
  updateQuantity: (id: string, quantity: number) => void
  removeItem: (id: string) => void
  clear: () => void
  openCart: () => void
  closeCart: () => void
}

const CartContext = createContext<CartState | null>(null)

const STORAGE_KEY = 'ara.cart.v1'

function itemKey(productId: string, variant?: string) {
  return variant ? `${productId}::${variant}` : productId
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as CartItem[]) : []
    } catch {
      return []
    }
  })
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      /* ignore */
    }
  }, [items])

  const addItem = useCallback(
    (product: Product, quantity = 1, variant?: string) => {
      const price = product.discountPrice ?? product.price
      const id = itemKey(product.id, variant)
      setItems((prev) => {
        const idx = prev.findIndex((item) => item.id === id)
        if (idx >= 0) {
          const next = [...prev]
          const nextQty = Math.min(
            next[idx].quantity + quantity,
            product.stock || 99,
          )
          next[idx] = { ...next[idx], quantity: nextQty }
          return next
        }
        return [
          ...prev,
          {
            id,
            productId: product.id,
            slug: product.slug,
            name: product.name,
            image: product.images[0],
            price,
            quantity: Math.min(quantity, product.stock || 99),
            variant,
            stock: product.stock,
          },
        ]
      })
    },
    [],
  )

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(1, Math.min(quantity, item.stock || 99)) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    )
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const clear = useCallback(() => setItems([]), [])
  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])

  const value = useMemo<CartState>(() => {
    const count = items.reduce((sum, i) => sum + i.quantity, 0)
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
    return {
      items,
      count,
      subtotal,
      isOpen,
      addItem,
      updateQuantity,
      removeItem,
      clear,
      openCart,
      closeCart,
    }
  }, [items, isOpen, addItem, updateQuantity, removeItem, clear, openCart, closeCart])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
