import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoaderProducts } from './LoaderProducts'
import { useProducts } from '@/hooks/useProducts'
import type { ProductToMoveForm } from '@/types/product'
import { productToMoveSchema } from '@/lib/schemas/product.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import supabase from '@/utils/supabase'
import { useEffect } from 'react'
import Sonner from './Sonner'

export default function FormMoveProduct() {
   const {
      isloadingButton,
      productToMove,
      products,
      setProducts,
      setAllProducts,
      setIsFormOrderSelloutOpen,
      setOpenDrawer,
      setFormIsDirty,
   } = useProducts()

   const {
      register,
      handleSubmit,
      formState: { errors, isDirty },
   } = useForm<ProductToMoveForm>({
      resolver: zodResolver(productToMoveSchema),
      mode: 'onChange',
      defaultValues: {
         neworderSellout: null,
      },
   })

   useEffect(() => {
      setFormIsDirty(isDirty)
   }, [isDirty])

   const onSubmitMoveProduct = async (data: ProductToMoveForm) => {
      const newOrder = Number(data.neworderSellout)
      const oldOrder = Number(productToMove.orderSellout)
      const idToMove = productToMove.id

      if (newOrder === oldOrder) {
         Sonner({
            message: 'El nuevo Orden Sellout no puede ser igual al actual',
            sonnerState: 'error',
         })
         return
      }

      if (!idToMove) return

      // Copia productos para modificar sin mutar original
      let updatedProducts = products.map((p) => ({ ...p }))

      // Ajustar orden de productos afectados
      updatedProducts = updatedProducts.map((p) => {
         if (p.id === idToMove) {
            return { ...p, orderSellout: newOrder }
         }

         const movingUp = newOrder < oldOrder

         if (
            movingUp &&
            p.orderSellout >= newOrder &&
            p.orderSellout < oldOrder
         ) {
            return { ...p, orderSellout: p.orderSellout + 1 }
         }

         if (
            !movingUp &&
            p.orderSellout > oldOrder &&
            p.orderSellout <= newOrder
         ) {
            return { ...p, orderSellout: p.orderSellout - 1 }
         }

         return p
      })

      // Hacer upsert masivo en Supabase
      const { error } = await supabase
         .from('listProducts')
         .upsert(updatedProducts, { onConflict: 'id' })

      if (error) {
         console.error('Error al actualizar productos:', error)
         Sonner({
            message: 'Error al actualizar el orden de productos',
            sonnerState: 'error',
         })
      } else {
         // Actualizar estado local con productos nuevos
         setProducts(updatedProducts)
         setAllProducts((prev) =>
            prev.map((p) => {
               const updated = updatedProducts.find((up) => up.id === p.id)
               return updated ? updated : p
            })
         )

         Sonner({
            message: 'Orden actualizado correctamente',
            sonnerState: 'success',
         })

         setIsFormOrderSelloutOpen(false)
         setOpenDrawer(false)
      }
   }

   return (
      <form className="space-y-5" onSubmit={handleSubmit(onSubmitMoveProduct)}>
         <h3 className="mb-5 font-bold border-b-1 pb-3">
            Cambiar Orden Sellout
         </h3>
         <p className="text-xs text-muted-foreground">
            {productToMove.orderSellout} - {productToMove.title}
         </p>
         <div className="*:not-first:mt-1 mb-3 w-full">
            <Label className="text-sm font-medium" htmlFor="neworderSellout">
               Nuevo Orden Sellout
            </Label>
            <Input
               className="peer w-full"
               id="neworderSellout"
               placeholder="Ingresa el nuevo orden sellout"
               aria-invalid={!!errors.neworderSellout}
               {...register('neworderSellout')}
            />
            {errors.neworderSellout && (
               <p
                  className="peer-aria-invalid:text-destructive mt-2 text-xs"
                  role="alert"
                  aria-live="polite">
                  {errors.neworderSellout.message}
               </p>
            )}
         </div>

         <Button type="submit" className="w-full" disabled={isloadingButton}>
            {isloadingButton ? <LoaderProducts /> : 'Enviar'}
         </Button>
      </form>
   )
}
