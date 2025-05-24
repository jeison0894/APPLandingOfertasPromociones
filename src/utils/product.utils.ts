import type { Product, ProductForm } from '@/types/product'
import { formatDateToISO } from './formatDate'
import { parseDate } from '@internationalized/date'
import supabase from './supabase'

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
      orderSellout: String(nextorderSellout),
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

export function getDefaultResetForm() {
   return {
      orderSellout: 0,
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

export function getDefaultEditProductForm(product: Product) {
   return {
      orderSellout: product.orderSellout?.toString() || '',
      category: product.category,
      title: product.title,
      urlProduct: product.urlProduct,
      urlImage: product.urlImage,
      startDate: product.startDate ? parseDate(product.startDate) : undefined,
      endDate: product.endDate ? parseDate(product.endDate) : undefined,
      offerState: product.offerState,
      isProductHidden: product.isProductHidden ?? false,
   }
}

export function reorderOrderSellout(products: Product[]): Product[] {
   return products
      .slice()
      .sort((a, b) => a.orderSellout - b.orderSellout)
      .map((p, i) => ({ ...p, orderSellout: i + 1 }))
}

export function updateAllProducts(
   products: Product[],
   idProduct: string,
   product: Product
): Product[] {
   return products.map((p) => (p.id === idProduct ? product : p))
}

export async function getMaxOrderSellout(): Promise<number> {
   const { data, error } = await supabase
      .from('listProducts')
      .select('orderSellout')
      .not('isProductHidden', 'eq', true)
      .order('orderSellout', { ascending: false })
      .limit(1)

   if (error) throw error

   return data?.[0]?.orderSellout ?? 0
}

export function moveProductToEnd(
   products: Product[],
   idProduct: string,
   updatedProduct: Product
): Product[] {
   const filtered = products.filter((p) => p.id !== idProduct)
   return [...filtered, updatedProduct]
}
