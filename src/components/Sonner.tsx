import { CircleCheckIcon, CircleX, TriangleAlert, XIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

type SonnerConfig = {
   message: string
   sonnerState: 'success' | 'warning' | 'error'
}

const colorMap = {
   success: 'text-emerald-500',
   warning: 'text-amber-500',
   error: 'text-red-500',
}

const iconMap = {
   success: CircleCheckIcon,
   warning: TriangleAlert,
   error: CircleX,
}

export default function Sonner({ message, sonnerState }: SonnerConfig) {
   const Icon = iconMap[sonnerState]

   return toast.custom((t) => (
      <div className="bg-background text-foreground w-full rounded-md border px-4 py-3 shadow-lg sm:w-[var(--width)]">
         <div className="flex gap-2">
            <div className="flex grow gap-3">
               <Icon
                  className={`mt-0.5 shrink-0 ${colorMap[sonnerState]}`}
                  size={16}
                  aria-hidden="true"
               />
               <div className="flex grow justify-between gap-12">
                  <p className="text-sm">{message}</p>
               </div>
            </div>
            <Button
               variant="ghost"
               className="group -my-1.5 -me-2 size-8 shrink-0 p-0 hover:bg-transparent"
               onClick={() => toast.dismiss(t)}
               aria-label="Close banner">
               <XIcon
                  size={16}
                  className="opacity-60 transition-opacity group-hover:opacity-100"
                  aria-hidden="true"
               />
            </Button>
         </div>
      </div>
   ))
}
