import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from '@/components/ui/table'
import { flexRender } from '@tanstack/react-table'
import { LoaderProducts } from './LoaderProducts'
import { ArrowDown, ArrowUp } from 'lucide-react'
import type { TableProductsBody } from '@/types/table'

export default function TableProductsBody({ isLoading, products, table }: TableProductsBody) {
   return (
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
                              }[header.column.getIsSorted() as string] ?? null}
                           </div>
                        </TableHead>
                     ))}
                  </TableRow>
               ))}
            </TableHeader>
            <TableBody>
               {isLoading ? (
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
   )
}

