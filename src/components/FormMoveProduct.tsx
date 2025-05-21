import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoaderProducts } from './LoaderProducts'
import { useProducts } from '@/hooks/useProducts'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type { ProductToMoveForm } from '@/types/product'
import { productToMoveSchema } from '@/lib/schemas/product.schema'
import supabase from '@/utils/supabase'

export default function FormMoveProduct() {
   const { isloadingButton, productToMove, products, setProducts } =
      useProducts()

   const {
      register,
      handleSubmit,
      formState: { errors },
   } = useForm<ProductToMoveForm>({
      resolver: zodResolver(productToMoveSchema),
      mode: 'onChange',
      defaultValues: {
         newOrdenSellout: productToMove.ordenSellout,
      },
   })

   const onSubmitMoveProduct = async (data: ProductToMoveForm) => {
      console.log(products)
      if (!productToMove.id) {
         console.error('No product ID to move')
         return
      }

      // Posición nueva en 0-based (ej: newOrdenSellout=6 => índice=5)
      const newIndex = data.newOrdenSellout - 1

      // Asegurarse que newIndex esté dentro del rango válido
      if (newIndex < 0 || newIndex > products.length) {
         console.error('Nuevo orden fuera de rango')
         return
      }

      // Producto anterior y siguiente para calcular el decimal
      const prevProduct = products[newIndex - 1]
      const nextProduct = products[newIndex]

      let newOrderSellout: number

      if (!prevProduct) {
         // Si no hay producto previo, poner un número menor que el siguiente
         newOrderSellout = nextProduct ? nextProduct.ordenSellout / 2 : 1
      } else if (!nextProduct) {
         // Si no hay producto siguiente, poner un número mayor que el anterior
         newOrderSellout = prevProduct.ordenSellout + 1
      } else {
         // Si ambos existen, poner promedio entre ellos
         newOrderSellout =
            (prevProduct.ordenSellout + nextProduct.ordenSellout) / 2
      }

      try {
         // Ejecutar el update en supabase
         const { data: updatedData, error } = await supabase
            .from('listProducts')
            .update({ ordenSellout: newOrderSellout })
            .eq('id', productToMove.id)
            .select()

         if (error) {
            console.error('Error al actualizar producto:', error)
            return
         }

         if (updatedData && updatedData.length > 0) {
            console.log('Producto actualizado:', updatedData[0])
            // Actualiza localmente products para reflejar el cambio si quieres
            setProducts((prevProducts) => {
               const filtered = prevProducts.filter(
                  (p) => p.id !== productToMove.id
               )
               return [...filtered, updatedData[0]].sort(
                  (a, b) => a.ordenSellout - b.ordenSellout
               )
            })
         }
      } catch (err) {
         console.error('Error inesperado:', err)
      }
   }

   return (
      <form className="space-y-5" onSubmit={handleSubmit(onSubmitMoveProduct)}>
         <h3 className="mb-5 font-bold border-b-1 pb-3">
            Cambiar Orden Sellout
         </h3>
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
