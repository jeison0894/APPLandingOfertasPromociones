import DropDownMenu from '@/components/DropDownMenu'
import type { Product } from '@/types/product'
import type { ColumnDef } from '@tanstack/react-table'
import { SquareArrowOutUpRight } from 'lucide-react'

export const columns: ColumnDef<Product>[] = [
   {
      accessorKey: 'ordenSellout',
      header: 'Orden Sellout',
      enableSorting: true,
   },
   {
      accessorKey: 'category',
      header: 'Categoría',
      enableSorting: true,
   },
   {
      accessorKey: 'title',
      header: 'Llamado',
      enableSorting: true,
   },
   {
      accessorKey: 'urlProduct',
      header: 'URL Producto',
      cell: ({ getValue }) => {
         const url = getValue<string>()
         return (
            <a href={url} target="_blank" rel="noopener noreferrer">
               <SquareArrowOutUpRight className="h-4 w-4" />
            </a>
         )
      },
   },
   {
      accessorKey: 'urlImage',
      header: 'URL Imagen',
      cell: ({ getValue }) => {
         const url = getValue<string>()
         return (
            <a href={url} target="_blank" rel="noopener noreferrer">
               <SquareArrowOutUpRight className="h-4 w-4" />
            </a>
         )
      },
   },
   {
      accessorKey: 'startDate',
      header: 'Fecha Inicio',
      enableSorting: true,
   },
   {
      accessorKey: 'endDate',
      header: 'Fecha Fin',
      enableSorting: true,
   },
   {
      accessorKey: 'offerState',
      header: 'Estado Oferta',
      enableSorting: true,
   },
   {
      id: 'actions',
      cell: ({ row }) => {
         return <DropDownMenu productInfo={row.original} />
      },
   },
]

