export const CURRENCY = 'USD' as const
export const FREE_SHIPPING_THRESHOLD = 75
export const FLAT_SHIPPING = 8.5
export const TAX_RATE = 0.08

export function money(value: number): number {
  return Number(value.toFixed(2))
}

export function toCents(value: number): number {
  return Math.round(money(value) * 100)
}

export function calcOrderTotals(subtotal: number) {
  const shipping =
    subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING
  const tax = money(subtotal * TAX_RATE)
  const total = money(subtotal + shipping + tax)
  return {
    subtotal: money(subtotal),
    shipping,
    tax,
    total,
  }
}
