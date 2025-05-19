import { SquareArrowOutUpRight } from 'lucide-react'
import DarkMode from './DarkMode'

function Header() {
   return (
      <div className="flex items-center justify-between">
         <div className="flex items-center space-x-3 mt-4 mb-7">
            <h1 className=" text-lg font-bold line tracking-tight">
               APP Landing Ofertas y Promociones
            </h1>
            <a
               href="https://www.falabella.com.co/falabella-co/page/descuentos_ofertas_falabella?sid=HO_V1_ENCUENTRAACALASOFERTASIMPERDIBLESDELASEMANA_OTROS_NA_S17_139"
               target="_blank">
               <SquareArrowOutUpRight className="h-4 w-4" />
            </a>
         </div>
         <DarkMode />
      </div>
   )
}

export default Header
