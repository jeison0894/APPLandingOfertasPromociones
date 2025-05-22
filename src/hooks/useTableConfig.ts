import { columns } from '@/tables/productColumns'
import {
   type ColumnFiltersState,
   type SortingState,
   useReactTable,
   getCoreRowModel,
   getFilteredRowModel,
   getSortedRowModel,
   getPaginationRowModel,
} from '@tanstack/react-table'
import { useState } from 'react'
import { useProducts } from './useProducts'
import { FILTER } from '@/constants/filterConstants'

export function useTableConfig() {
   const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([
      { id: FILTER, value: '' },
   ])
   const [sorting, setSorting] = useState<SortingState>([
      { id: 'orderSellout', desc: false },
   ])

   const {
      pagination,
      setPagination,
      products,
      isLoading,
      openDrawer,
      setOpenDrawer,
      handleAdd,
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

   return {
      table,
      isLoading,
      openDrawer,
      setOpenDrawer,
      handleAdd,
      activeButton,
      isFormOrderSelloutOpen,
      pagination,
      setPagination,
      columnFilters,
      setColumnFilters,
      sorting,
      setSorting,
      products,
   }
}
