import type { z } from 'zod'

export type Product = {
   id?: string
   ordenSellout: number
   category: string
   title: string
   urlProduct: string
   urlImage: string
   startDate: string
   endDate: string
   offerState: string
   isProductHidden: boolean
}
export type ProductForm = z.infer<typeof productFormSchema>



export type ProductToMove = {
   id?: string
   newOrdenSellout: string
}
export type ProductToMoveForm = z.infer<typeof productToMoveSchema>
