import { useTableConfig } from '@/hooks/useTableConfig'
import TableProductsHeader from './TableProductsHeader'
import TableProductsPagination from './TablePagination'
import TableProductsBody from './TableProductsBody'

export default function TableProducts() {
   const {
      products,
      table,
      isLoading,
      openDrawer,
      setOpenDrawer,
      handleAdd,
      activeButton,
      isFormOrderSelloutOpen,
      setPagination,
      columnFilters,
      setColumnFilters,
   } = useTableConfig()

   return (
      <div>
         <TableProductsHeader
            columnFilters={columnFilters}
            setColumnFilters={setColumnFilters}
            activeButton={activeButton}
            handleAdd={handleAdd}
            openDrawer={openDrawer}
            setOpenDrawer={setOpenDrawer}
            isFormOrderSelloutOpen={isFormOrderSelloutOpen}
         />
         <TableProductsBody
            isLoading={isLoading}
            products={products}
            table={table}
         />

         {products.length !== 0 && (
            <div className="mt-4">
               <TableProductsPagination
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
