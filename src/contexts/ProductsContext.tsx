// contexts/ProductsContext.ts
import { createContext } from 'react'
import type { useProductsProvider } from '../hooks/useProductsProvider'

export const ProductsContext = createContext<
   ReturnType<typeof useProductsProvider> | undefined
>(undefined)
