import type { Product, ProductForm } from '@/types/product'
import supabase from '@/utils/supabase'

export async function getAllProducts(): Promise<Product[]> {
   const { data, error } = await supabase.from('listProducts').select('*')
   if (error) throw error
   return data || []
}

export async function addProduct(product: ProductForm) {
   const { data, error } = await supabase
      .from('listProducts')
      .insert([product])
      .select()
   if (error) throw error
   return data || []
}

export async function hasDuplicateOrderSellout(
   product: ProductForm,
   editingProductId: string | null
) {
   const { data, error } = await supabase
      .from('listProducts')
      .select('id')
      .eq('orderSellout', product.orderSellout)
      .neq('id', editingProductId)
      .limit(1)
   if (error) throw error
   return data.length > 0
}

export async function editProduct(
   dataToUpdate: ProductForm,
   editingProductId: string | null
): Promise<Product[]> {
   const { data, error } = await supabase
      .from('listProducts')
      .update(dataToUpdate)
      .eq('id', editingProductId)
      .select()
   if (error) throw error
   return data
}

export async function deleteProduct(id: string) {
   const { error } = await supabase.from('listProducts').delete().eq('id', id)
   if (error) throw error
}

export async function upsertProducts(products: Product[]) {
   const { error } = await supabase
      .from('listProducts')
      .upsert(products, { onConflict: 'id' })
   if (error) throw error
}
