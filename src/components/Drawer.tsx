import { useEffect } from 'react'
import { useProducts } from '@/hooks/useProducts'

type DrawerProps = {
   isOpen: boolean
   onClose: () => void
   children: React.ReactNode
}

export function Drawer({ isOpen, children }: DrawerProps) {
   const { isDirty, setOpenDrawer, setShowConfirmDialog } = useProducts()

   useEffect(() => {
      if (isOpen) {
         document.body.style.overflow = 'hidden'
      } else {
         document.body.style.overflow = ''
      }
      return () => {
         document.body.style.overflow = ''
      }
   }, [isOpen])

   const handleBackdropClick = () => {
      if (isDirty) {
         setShowConfirmDialog(true)
      } else {
         setOpenDrawer(false)
      }
   }

   return (
      <>
         <div
            onClick={handleBackdropClick}
            className={`fixed inset-0 z-40 bg-black transition-opacity duration-300 ${
               isOpen ? 'opacity-70' : 'opacity-0 pointer-events-none'
            }`}></div>

         <div
            className={`fixed right-0 top-0 z-50 h-screen w-full max-w-sm bg-background border-l shadow-lg
          transform transition-transform duration-300 ease-in-out
          flex flex-col
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}>
            <div className="flex-1 overflow-y-auto p-6">{children}</div>
         </div>
      </>
   )
}
