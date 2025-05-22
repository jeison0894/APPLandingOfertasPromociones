import { useId } from 'react'
import {
   ChevronFirstIcon,
   ChevronLastIcon,
   ChevronLeftIcon,
   ChevronRightIcon,
} from 'lucide-react'

import { Label } from '@/components/ui/label'
import {
   Pagination,
   PaginationContent,
   PaginationItem,
   PaginationLink,
} from '@/components/ui/pagination'
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from '@/components/ui/select'

interface PaginationProps {
   currentPage: number
   totalPages: number
   onPageChange: (page: number) => void
   pageSize: number
   onPageSizeChange: (size: number) => void
   rowStart: number
   rowEnd: number
   totalItems: number
}

export default function TableProductsPagination({
   currentPage,
   totalPages,
   onPageChange,
   pageSize,
   onPageSizeChange,
   rowStart,
   rowEnd,
   totalItems,
}: PaginationProps) {
   const id = useId()

   return (
      <div className="flex items-center justify-between gap-8 mt-4">
         <div className="flex items-center gap-3">
            <Label htmlFor={id}>Filas por pagina</Label>
            <Select
               value={String(pageSize)}
               onValueChange={(val) => onPageSizeChange(Number(val))}>
               <SelectTrigger id={id} className="w-fit whitespace-nowrap">
                  <SelectValue placeholder="Select number of results" />
               </SelectTrigger>
               <SelectContent>
                  {[10, 25, 50, 100].map((num) => (
                     <SelectItem key={num} value={String(num)}>
                        {num}
                     </SelectItem>
                  ))}
               </SelectContent>
            </Select>
         </div>

         <div className="text-muted-foreground flex grow justify-end text-sm whitespace-nowrap">
            <p aria-live="polite">
               <span className="text-foreground">
                  {rowStart}-{rowEnd}
               </span>{' '}
               de <span className="text-foreground">{totalItems}</span>
            </p>
         </div>

         <div>
            <Pagination>
               <PaginationContent>
                  <PaginationItem>
                     <PaginationLink
                        className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
                        onClick={() => onPageChange(1)}
                        aria-disabled={currentPage === 1}>
                        <ChevronFirstIcon size={16} />
                     </PaginationLink>
                  </PaginationItem>

                  <PaginationItem>
                     <PaginationLink
                        className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
                        onClick={() => onPageChange(currentPage - 1)}
                        aria-disabled={currentPage === 1}>
                        <ChevronLeftIcon size={16} />
                     </PaginationLink>
                  </PaginationItem>

                  <PaginationItem>
                     <PaginationLink
                        className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
                        onClick={() => onPageChange(currentPage + 1)}
                        aria-disabled={currentPage === totalPages}>
                        <ChevronRightIcon size={16} />
                     </PaginationLink>
                  </PaginationItem>

                  <PaginationItem>
                     <PaginationLink
                        className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
                        onClick={() => onPageChange(totalPages)}
                        aria-disabled={currentPage === totalPages}>
                        <ChevronLastIcon size={16} />
                     </PaginationLink>
                  </PaginationItem>
               </PaginationContent>
            </Pagination>
         </div>
      </div>
   )
}
