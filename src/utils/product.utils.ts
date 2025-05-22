import type { Product } from '@/types/product'

// utils/product.utils.ts
export function formatDateToISO(date?: Date | string | null): string | null {
   if (!date) return null
   return typeof date === 'string' ? date : date.toISOString().split('T')[0]
}

export function getNextOrdenSellout(products: Product[]): number {
   if (products.length === 0) return 1
   return Math.max(...products.map((p) => Number(p.ordenSellout) || 0)) + 1
}

export function filterVisibleProducts(products: Product[]) {
   return products.filter((p) => !p.isProductHidden)
}

export function filterHiddenProducts(products: Product[]) {
   return products.filter((p) => p.isProductHidden)
}
