import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from '@/components/ui/table'
import {
   flexRender,
   getCoreRowModel,
   getFilteredRowModel,
   useReactTable,
   type ColumnFiltersState,
} from '@tanstack/react-table'
import { columns } from '@/tables/productColumns'
import Search from './Search'
import { useState } from 'react'
import { useProducts } from '@/hooks/useProducts'
import NotProductsNotification from './NotProductsNotification'
import { LoaderProducts } from './LoaderProducts'
import { Drawer } from './Drawer'
import { Button } from './ui/button'
import { PlusIcon } from 'lucide-react'
import Form from './Form'

export default function TableProducts() {
   const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([
      { id: 'title', value: '' },
   ])
   const {
      products,
      isloading,
      openDrawer,
      setOpenDrawer,
      setIsEditing,
      reset,
   } = useProducts()

   const table = useReactTable({
      data: products,
      columns: columns,
      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      state: { columnFilters },
      onColumnFiltersChange: setColumnFilters,
   })

   const handleAdd = () => {
      reset({
         ordenSellout: '',
         category: '',
         title: '',
         urlProduct: '',
         urlImage: '',
         startDate: undefined,
         endDate: undefined,
         offerState: '',
         isProductHidden: false,
      })
      setOpenDrawer(true)
      setIsEditing(false)
   }
   return (
      <div>
         <div className="flex justify-between space-x-4">
            <Search
               value={(columnFilters[0]?.value as string) ?? ''}
               onChange={(e) =>
                  setColumnFilters([{ id: 'title', value: e.target.value }])
               }
            />

            <Button
               variant="outline"
               className="aspect-square max-sm:p-0 m-0"
               onClick={handleAdd}>
               <PlusIcon
                  className="opacity-60 sm:-ms-1"
                  size={16}
                  aria-hidden="true"
               />
               <span className="max-sm:sr-only">Agregar Producto</span>
            </Button>

            <Drawer isOpen={openDrawer} onClose={() => setOpenDrawer(false)}>
               <Form />
            </Drawer>
         </div>

         <div className="bg-background overflow-hidden rounded-md border">
            <Table>
               <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                     <TableRow
                        className="hover:bg-transparent "
                        key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                           <TableHead key={header.id} className="h-10 pl-1">
                              {header.isPlaceholder
                                 ? null
                                 : flexRender(
                                      header.column.columnDef.header,
                                      header.getContext()
                                   )}
                           </TableHead>
                        ))}
                     </TableRow>
                  ))}
               </TableHeader>
               <TableBody>
                  {isloading ? (
                     <TableRow className="hover:bg-transparent hover:none">
                        <TableCell
                           colSpan={table.getAllColumns().length}
                           className="py-5 text-center">
                           <LoaderProducts />
                        </TableCell>
                     </TableRow>
                  ) : products.length === 0 ? (
                     <TableRow className="hover:bg-transparent hover:none">
                        <TableCell
                           colSpan={table.getAllColumns().length}
                           className="py-10">
                           <NotProductsNotification />
                        </TableCell>
                     </TableRow>
                  ) : (
                     table.getRowModel().rows.map((row) => (
                        <TableRow key={row.id}>
                           {row.getVisibleCells().map((cell) => (
                              <TableCell
                                 key={cell.id}
                                 className=" text-xs pl-1">
                                 {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext()
                                 )}
                              </TableCell>
                           ))}
                        </TableRow>
                     ))
                  )}
               </TableBody>
            </Table>
         </div>
      </div>
   )
}
