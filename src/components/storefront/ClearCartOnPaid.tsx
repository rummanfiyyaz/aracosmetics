'use client'

import { useEffect } from 'react'
import { useCart } from '@/context/CartContext'

export function ClearCartOnPaid({ paid }: { paid: boolean }) {
  const { clear, items } = useCart()

  useEffect(() => {
    if (paid && items.length > 0) clear()
  }, [paid, items.length, clear])

  return null
}
