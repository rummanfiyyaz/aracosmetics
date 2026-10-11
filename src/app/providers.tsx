'use client'

import type { ReactNode } from 'react'
import { ToastProvider } from '@/context/ToastContext'
import { CartProvider } from '@/context/CartContext'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <CartProvider>{children}</CartProvider>
    </ToastProvider>
  )
}
