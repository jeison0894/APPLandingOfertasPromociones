import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoaderProducts } from './LoaderProducts'
import { useProducts } from '@/hooks/useProducts'
import type { ProductForm } from '@/types/product'

export default function FormMoveProduct() {
   const { isloadingButton, errors, register, handleSubmit } = useProducts()

   const onSubmitMoveProduct = (data: ProductForm) => {
      console.log(data)
   }

   return (
      <form className="space-y-5" onSubmit={handleSubmit(onSubmitMoveProduct)}>
         <h3 className="mb-5 font-bold border-b-1 pb-3">
            Cambiar Orden Sellout
         </h3>
         <div className="*:not-first:mt-1 mb-3 w-full">
            <Label className="text-sm font-medium" htmlFor="ordenSellout">
               Nuevo Orden Sellout
            </Label>
            <Input
               className="peer w-full"
               id="newOrdenSellout"
               placeholder="Ingresa el nuevo orden sellout"
               aria-invalid={!!errors.ordenSellout}
               {...register('newOrdenSellout')}
            />
            {errors.ordenSellout && (
               <p
                  className="peer-aria-invalid:text-destructive mt-2 text-xs"
                  role="alert"
                  aria-live="polite">
                  {errors.ordenSellout.message}
               </p>
            )}
         </div>

         <Button type="submit" className="w-full" disabled={isloadingButton}>
            {isloadingButton ? <LoaderProducts /> : 'Enviar'}
         </Button>
      </form>
   )
}
