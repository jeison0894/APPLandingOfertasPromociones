import { MoonIcon, SunIcon } from 'lucide-react'
import { Toggle } from '@/components/ui/toggle'
import { useTheme } from '@/components/theme-provider'
import { useState } from 'react'

export default function DarkMode() {
   const { setTheme } = useTheme()
   const [theme, setLocalTheme] = useState<string>('dark')

   const handleThemeToggle = () => {
      const newTheme = theme === 'dark' ? 'light' : 'dark'
      setLocalTheme(newTheme)
      setTheme(newTheme)
   }

   return (
      <div>
         <Toggle
            variant="outline"
            className="group data-[state=on]:hover:bg-muted size-9 data-[state=on]:bg-transparent"
            pressed={theme === 'dark'}
            onPressedChange={handleThemeToggle}
            aria-label={`Switch to ${
               theme === 'dark' ? 'light' : 'dark'
            } mode`}>
            <MoonIcon
               size={16}
               className="shrink-0 scale-0 opacity-0 transition-all group-data-[state=on]:scale-100 group-data-[state=on]:opacity-100"
               aria-hidden="true"
            />
            <SunIcon
               size={16}
               className="absolute shrink-0 scale-100 opacity-100 transition-all group-data-[state=on]:scale-0 group-data-[state=on]:opacity-0"
               aria-hidden="true"
            />
         </Toggle>
      </div>
   )
}
