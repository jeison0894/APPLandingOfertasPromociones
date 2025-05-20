import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from '@/components/ui/table'
import {
   useReactTable,
   getCoreRowModel,
   getFilteredRowModel,
   getPaginationRowModel,
   getSortedRowModel,
   flexRender,
   type SortingState,
   type ColumnFiltersState,
} from '@tanstack/react-table'
import { columns } from '@/tables/productColumns'
import Search from './Search'
import { useState } from 'react'
import { useProducts } from '@/hooks/useProducts'
import { LoaderProducts } from './LoaderProducts'
import { Drawer } from './Drawer'
import { Button } from './ui/button'
import { ArrowDown, ArrowUp, PlusIcon } from 'lucide-react'
import Form from './Form'
import { VIEW_LISTADO } from '@/constants/views'
import TablePagination from './TablePagination'
import FormMoveProduct from './FormMoveProduct'

export default function TableProducts() {
   const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([
      { id: 'title', value: '' },
   ])
   const [sorting, setSorting] = useState<SortingState>([
      { id: 'ordenSellout', desc: false },
   ])
   const { pagination, setPagination } = useProducts()

   const {
      products,
      isloading,
      openDrawer,
      setOpenDrawer,
      setIsEditing,
      reset,
      activeButton,
      isFormOrderSelloutOpen,
   } = useProducts()

   const table = useReactTable({
      data: products,
      columns: columns,
      state: {
         pagination,
         columnFilters,
         sorting,
      },
      onColumnFiltersChange: setColumnFilters,
      onSortingChange: setSorting,
      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
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
            <div className="flex space-x-2.5">
               <Search
                  value={(columnFilters[0]?.value as string) ?? ''}
                  onChange={(e) =>
                     setColumnFilters([{ id: 'title', value: e.target.value }])
                  }
               />
               {columnFilters[0].value !== '' && (
                  <Button
                     variant="outline"
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

         <div className="bg-background overflow-hidden rounded-md border mt-4">
            <Table>
               <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                     <TableRow
                        className="hover:bg-transparent"
                        key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                           <TableHead
                              key={header.id}
                              onClick={header.column.getToggleSortingHandler?.()}
                              className="h-10 pl-1 cursor-pointer select-none">
                              <div className="flex items-center gap-1">
                                 {flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                 )}
                                 {{
                                    asc: (
                                       <ArrowUp className="w-3.5 h-3.5 text-muted-foreground" />
                                    ),
                                    desc: (
                                       <ArrowDown className="w-3.5 h-3.5 text-muted-foreground" />
                                    ),
                                 }[header.column.getIsSorted() as string] ??
                                    null}
                              </div>
                           </TableHead>
                        ))}
                     </TableRow>
                  ))}
               </TableHeader>
               <TableBody>
                  {isloading ? (
                     <TableRow className="hover:bg-transparent">
                        <TableCell
                           colSpan={table.getAllColumns().length}
                           className="py-5 text-center">
                           <LoaderProducts />
                        </TableCell>
                     </TableRow>
                  ) : products.length === 0 ? (
                     <TableRow className="hover:bg-transparent">
                        <TableCell
                           colSpan={table.getAllColumns().length}
                           className="py-10">
                           <p className="w-full grow text-sm text-center">
                              No se encontraron productos
                           </p>
                        </TableCell>
                     </TableRow>
                  ) : (
                     table.getRowModel().rows.map((row) => (
                        <TableRow key={row.id}>
                           {row.getVisibleCells().map((cell) => (
                              <TableCell key={cell.id} className="text-xs pl-1">
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

         {products.length !== 0 && (
            <div className="mt-4">
               <TablePagination
                  currentPage={table.getState().pagination.pageIndex + 1}
                  totalPages={table.getPageCount()}
                  onPageChange={(page) => {
                     setPagination((prev) => ({ ...prev, pageIndex: page - 1 }))
                  }}
                  pageSize={table.getState().pagination.pageSize}
                  onPageSizeChange={(size) => {
                     setPagination((prev) => ({ ...prev, pageSize: size }))
                  }}
                  rowStart={
                     table.getState().pagination.pageIndex *
                        table.getState().pagination.pageSize +
                     1
                  }
                  rowEnd={Math.min(
                     (table.getState().pagination.pageIndex + 1) *
                        table.getState().pagination.pageSize,
                     table.getFilteredRowModel().rows.length
                  )}
                  totalItems={table.getFilteredRowModel().rows.length}
               />
            </div>
         )}
      </div>
   )
}
