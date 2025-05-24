import { useId } from 'react'
import { SearchIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'

export interface SearchProps {
   value: string
   onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export default function Search({ value, onChange }: SearchProps) {
   const id = useId()
   return (
      <div className="*:not-first:mt-2 mb-4 w-55">
         <div className="relative">
            <Input
               id={id}
               className="peer ps-9"
               placeholder="Buscar llamado..."
               type="search"
               value={value}
               onChange={onChange}
            />
            <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
               <SearchIcon size={16} />
            </div>          
         </div>
      </div>
   )
}
