import { useState } from 'react'
import { EllipsisIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
   DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
   AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import type { Product } from '@/types/product'
import { useProducts } from '@/hooks/useProducts'
import { VIEW_LISTADO } from '@/constants/views'

type Props = { productInfo: Product }

export default function DropDownMenu({ productInfo }: Props) {
   const {
      handleDeleteProduct,
      handlePrepareEdit,
      handleHideProduct,
      activeButton,
      handleUnhideProduct,
      handleMoveProduct,
   } = useProducts()
   const [open, setOpen] = useState(false)

   const handleDeleteAndClose = async () => {
      await handleDeleteProduct(productInfo)
      setOpen(false)
      document.body.style.pointerEvents = 'auto'
   }

   return (
      <DropdownMenu open={open} onOpenChange={setOpen}>
         <DropdownMenuTrigger asChild>
            <Button
               size="icon"
               variant="ghost"
               className="rounded-full shadow-none"
               aria-label="Open edit menu">
               <EllipsisIcon size={16} aria-hidden="true" />
            </Button>
         </DropdownMenuTrigger>
         <DropdownMenuContent>
            {activeButton === VIEW_LISTADO ? (
               <>
                  <DropdownMenuItem
                     onClick={() => handlePrepareEdit(productInfo)}>
                     Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                     onClick={() => handleMoveProduct(productInfo)}>
                     Mover
                  </DropdownMenuItem>
                  <DropdownMenuItem
                     onClick={() => handleHideProduct(productInfo)}>
                     Ocultar
                  </DropdownMenuItem>{' '}
               </>
            ) : (
               <DropdownMenuItem
                  onClick={() => handleUnhideProduct(productInfo)}>
                  Desocultar
               </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />
            <AlertDialog>
               <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                     variant="destructive"
                     onSelect={(e) => e.preventDefault()}>
                     Eliminar
                  </DropdownMenuItem>
               </AlertDialogTrigger>
               <AlertDialogContent>
                  <AlertDialogHeader>
                     <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                     <AlertDialogDescription>
                        Esta acción no se puede deshacer. El producto será
                        eliminado permanentemente de la base de datos.
                     </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                     <AlertDialogCancel>Cancelar</AlertDialogCancel>
                     <AlertDialogAction onClick={handleDeleteAndClose}>
                        Eliminar
                     </AlertDialogAction>
                  </AlertDialogFooter>
               </AlertDialogContent>
            </AlertDialog>
         </DropdownMenuContent>
      </DropdownMenu>
   )
}
