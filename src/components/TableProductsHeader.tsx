import Search from './Search'
import { Drawer } from './Drawer'
import { Button } from './ui/button'
import { PlusIcon } from 'lucide-react'
import Form from './Form'
import { VIEW_LISTADO } from '@/constants/views'
import FormMoveProduct from './FormMoveProduct'
import type { TableHeader } from '@/types/table'

export default function TableProductsHeader({
   columnFilters,
   setColumnFilters,
   activeButton,
   handleAdd,
   openDrawer,
   setOpenDrawer,
   isFormOrderSelloutOpen,
}: TableHeader) {
   return (
      <div className="flex justify-between space-x-4">
         <div className="flex space-x-2.5">
            <Search
               value={(columnFilters[0]?.value as string) ?? ''}
               onChange={(e) =>
                  setColumnFilters([{ id: 'title', value: e.target.value }])
               }
            />
            {columnFilters[0].value !== '' && (
               <Button
                  variant="secondary"
                  onClick={() =>
                     setColumnFilters([{ id: 'title', value: '' }])
                  }>
                  Limpiar
               </Button>
            )}
         </div>

         {activeButton === VIEW_LISTADO && (
            <Button
               className="aspect-square max-sm:p-0 m-0"
               onClick={handleAdd}>
               <PlusIcon
                  className="opacity-60 sm:-ms-1"
                  size={16}
                  aria-hidden="true"
               />
               <span className="max-sm:sr-only">Agregar Producto</span>
            </Button>
         )}

         <Drawer isOpen={openDrawer} onClose={() => setOpenDrawer(false)}>
            {isFormOrderSelloutOpen ? <FormMoveProduct /> : <Form />}
         </Drawer>
      </div>
   )
}
