import type { Product, ProductForm } from '@/types/product'
import { formatDateToISO } from './formatDate'

export function getVisibleProducts(products: Product[]) {
   return products.filter((p) => !p.isProductHidden)
}

export function getHiddenProducts(products: Product[]) {
   return products.filter((p) => p.isProductHidden)
}

export function formatProductDates(formData: ProductForm) {
   return {
      ...formData,
      startDate: formatDateToISO(formData.startDate),
      endDate: formatDateToISO(formData.endDate),
   }
}

export function getNextorderSellout(products: Product[]): number {
   if (products.length === 0) return 1
   return Math.max(...products.map((p) => Number(p.orderSellout) || 0)) + 1
}

export function getDefaultAddProductForm(nextorderSellout: number) {
   return {
      orderSellout: nextorderSellout,
      category: '',
      title: '',
      urlProduct: '',
      urlImage: '',
      startDate: undefined,
      endDate: undefined,
      offerState: '',
      isProductHidden: false,
   }
}
