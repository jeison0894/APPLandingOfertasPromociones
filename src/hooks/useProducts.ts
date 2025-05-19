import { ProductsContext } from '@/contexts/ProductsContext'
import { useContext } from 'react'

export function useProducts() {
   const context = useContext(ProductsContext)

   if (context === undefined) {
      throw new Error('useProducts debe usarse dentro de un <ProductsProvider>')
   }
   return context
}
