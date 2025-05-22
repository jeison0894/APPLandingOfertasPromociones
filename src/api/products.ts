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
