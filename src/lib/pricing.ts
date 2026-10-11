export const CURRENCY = 'USD' as const
export const FREE_SHIPPING_THRESHOLD = 0
export const FLAT_SHIPPING = 0
export const TAX_RATE = 0

export function money(value: number): number {
  return Number(value.toFixed(2))
}

export function toCents(value: number): number {
  return Math.round(money(value) * 100)
}

export function calcOrderTotals(subtotal: number) {
  const shipping = 0
  const tax = 0
  const total = money(subtotal)
  return {
    subtotal: money(subtotal),
    shipping,
    tax,
    total,
  }
}
