import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoaderProducts } from './LoaderProducts'
import { useProducts } from '@/hooks/useProducts'
import type { ProductForm, ProductToMoveForm } from '@/types/product'
import { productToMoveSchema } from '@/lib/schemas/product.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

export default function FormMoveProduct() {
   const { isloadingButton, productToMove, products } = useProducts()

   const {
      register,
      handleSubmit,
      formState: { errors },
   } = useForm<ProductToMoveForm>({
      resolver: zodResolver(productToMoveSchema),
      mode: 'onChange',
      defaultValues: {
         newOrdenSellout: productToMove.orderSellout,
      },
   })
   
   const onSubmitMoveProduct = (data: ProductForm) => {
      console.log(
         data
      ) /* contiene el nuevo ordersellout agregado en el input ej: {
    "newOrdenSellout": "333"
} */
      console.log(
         productToMove
      ) /*  contiene el ordersellout que tiene actualmente la fila y su id:
      {
    "id": "a21c7f8b-1007-4000-9000-000700070007",
    "orderSellout": "7"
      }  */
      console.log(products) // Contiene todo el listado de productos de la api
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
