// contexts/ProductsProvider.tsx
import { ProductsContext } from './ProductsContext'
import { useProductsProvider } from '../hooks/useProductsProvider'
import type { ReactNode } from 'react'

export function ProductsProvider({ children }: { children: ReactNode }) {
   const value = useProductsProvider()

   return (
      <ProductsContext.Provider value={value}>
         {children}
      </ProductsContext.Provider>
   )
}
