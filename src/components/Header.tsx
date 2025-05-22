import { SquareArrowOutUpRight } from 'lucide-react'
import DarkMode from './DarkMode'
import MenuButton from './MenuButton'
import { useProducts } from '@/hooks/useProducts'
import { VIEW_LISTADO, VIEW_OCULTOS } from '@/constants/views'
import { getHiddenProducts, getVisibleProducts } from '@/utils/product.utils'

function Header() {
   const {
      allProducts,
      activeButton,
      setActiveButton,
      setPagination,
      setProducts,
   } = useProducts()

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
         <div className="flex space-x-4">
            <MenuButton
               text={VIEW_LISTADO}
               functionOnClick={() => {
                  const visibles = getVisibleProducts(allProducts)
                  setProducts(visibles)
                  setPagination((prev) => ({ ...prev, pageIndex: 0 }))
                  setActiveButton(VIEW_LISTADO)
               }}
               isActive={activeButton === VIEW_LISTADO}
            />

            <MenuButton
               text={VIEW_OCULTOS}
               functionOnClick={() => {
                  const hidden = getHiddenProducts(allProducts)
                  setProducts(hidden)
                  setPagination((prev) => ({ ...prev, pageIndex: 0 }))
                  setActiveButton(VIEW_OCULTOS)
               }}
               isActive={activeButton === VIEW_OCULTOS}
            />
            <div className="pl-4 border-l-1 ">
               <DarkMode />
            </div>
         </div>
      </div>
   )
}

export default Header
