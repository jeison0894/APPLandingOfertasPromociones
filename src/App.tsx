import { ThemeProvider } from '@/components/theme-provider'
import Main from './pages/Main'
import './App.css'
import { ProductsProvider } from './contexts/ProductsProvider'
import { Toaster } from 'sonner'  

function App() {
   return (
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
         <ProductsProvider>
            <Main />
            <Toaster position="bottom-left" />  
         </ProductsProvider>
      </ThemeProvider>
   )
}

export default App
