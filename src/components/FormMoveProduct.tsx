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
import Sooner from './Sooner'
import { useEffect } from 'react'

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
         newOrdenSellout: productToMove.orderSellout,
      },
   })

   useEffect(() => {
      setFormIsDirty(isDirty) 
   }, [isDirty])

   const onSubmitMoveProduct = async (data: ProductToMoveForm) => {
      const newOrder = Number(data.newOrdenSellout)
      const oldOrder = Number(productToMove.orderSellout)
      const idToMove = productToMove.id

      if (newOrder === oldOrder) {
         Sooner({
            message: 'El nuevo Orden Sellout no puede ser igual al actual',
            soonerState: 'error',
         })
         return
      }

      if (!idToMove) return

      // Copia productos para modificar sin mutar original
      let updatedProducts = products.map((p) => ({ ...p }))

      // Ajustar orden de productos afectados
      updatedProducts = updatedProducts.map((p) => {
         if (p.id === idToMove) {
            return { ...p, ordenSellout: newOrder }
         }

         const movingUp = newOrder < oldOrder

         if (
            movingUp &&
            p.ordenSellout >= newOrder &&
            p.ordenSellout < oldOrder
         ) {
            return { ...p, ordenSellout: p.ordenSellout + 1 }
         }

         if (
            !movingUp &&
            p.ordenSellout > oldOrder &&
            p.ordenSellout <= newOrder
         ) {
            return { ...p, ordenSellout: p.ordenSellout - 1 }
         }

         return p
      })

      // Hacer upsert masivo en Supabase
      const { error } = await supabase
         .from('listProducts')
         .upsert(updatedProducts, { onConflict: 'id' })

      if (error) {
         console.error('Error al actualizar productos:', error)
         Sooner({
            message: 'Error al actualizar el orden de productos',
            soonerState: 'error',
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

         Sooner({
            message: 'Orden actualizado correctamente',
            soonerState: 'success',
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
         <p className="text-xs text-muted-foreground">{productToMove.title}</p>
         <div className="*:not-first:mt-1 mb-3 w-full">
            <Label className="text-sm font-medium" htmlFor="newOrdenSellout">
               Nuevo Orden Sellout
            </Label>
            <Input
               className="peer w-full"
               id="newOrdenSellout"
               placeholder="Ingresa el nuevo orden sellout"
               aria-invalid={!!errors.newOrdenSellout}
               {...register('newOrdenSellout')}
            />
            {errors.newOrdenSellout && (
               <p
                  className="peer-aria-invalid:text-destructive mt-2 text-xs"
                  role="alert"
                  aria-live="polite">
                  {errors.newOrdenSellout.message}
               </p>
            )}
         </div>

         <Button type="submit" className="w-full" disabled={isloadingButton}>
            {isloadingButton ? <LoaderProducts /> : 'Enviar'}
         </Button>
      </form>
   )
}
