import { CircleAlertIcon } from 'lucide-react'

import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useProducts } from '@/hooks/useProducts'

export default function DialogDrawer() {
   const {
      setOpenDrawer,
      showConfirmDialog,
      setShowConfirmDialog,
      setIsFormOrderSelloutOpen,
   } = useProducts()

   const handleConfirm = () => {
      setShowConfirmDialog(false)
      setOpenDrawer(false)
      setIsFormOrderSelloutOpen(false)
   }

   return (
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
         <AlertDialogContent>
            <div className=" flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
               <div
                  className="flex size-9 shrink-0 items-center justify-center rounded-full border"
                  aria-hidden="true">
                  <CircleAlertIcon className="opacity-80" size={16} />
               </div>
               <AlertDialogHeader>
                  <AlertDialogTitle>¿Descartar cambios?</AlertDialogTitle>
                  <AlertDialogDescription>
                     Se perderán todas las modificaciones que hayas hecho.
                  </AlertDialogDescription>
               </AlertDialogHeader>
            </div>
            <AlertDialogFooter>
               <AlertDialogCancel>Seguir editando</AlertDialogCancel>
               <AlertDialogAction asChild>
                  <button onClick={handleConfirm}>Descartar</button>
               </AlertDialogAction>
            </AlertDialogFooter>
         </AlertDialogContent>
      </AlertDialog>
   )
}
