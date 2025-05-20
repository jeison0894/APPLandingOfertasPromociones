import { EyeOff, Package, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { VIEW_LISTADO, VIEW_OCULTOS } from '@/constants/views'

const iconMap: Record<string, LucideIcon> = {
   [VIEW_LISTADO]: Package,
   [VIEW_OCULTOS]: EyeOff,
}

type ButtonProps = {
   text: string
   functionOnClick: () => void
   isActive: boolean
}

export default function MenuButton({
   text,
   functionOnClick,
   isActive,
}: ButtonProps) {
   const Icon = iconMap[text]
   return (
      <Button
         className={`group ${
            isActive ? '' : 'text-muted-foreground'
         }`}
         variant="ghost"
         onClick={functionOnClick}>
         {Icon && (
            <Icon
               className="-ms-1 opacity-60 transition-transform group-hover:-translate-x-0.5"
               size={16}
               aria-hidden="true"
            />
         )}
         {text}
      </Button>
   )
}
