import type { Product, ProductForm, ProductToMove } from '@/types/product'
import supabase from '@/utils/supabase'
import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { productFormSchema } from '@/lib/schemas/product.schema'
import { parseDate } from '@internationalized/date'
import { VIEW_LISTADO } from '@/constants/views'
import Sonner from '@/components/Sonner'
import { addProduct, getAllProducts } from '@/api/products'
import { isPostgresError } from '@/utils/errorHelpers'
import { formatDateToISO } from '@/utils/formatDate'
import { formatProductDates, getVisibleProducts } from '@/utils/product.utils'

export function useProductsProvider() {
   const [allProducts, setAllProducts] = useState<Product[]>([])
   const [products, setProducts] = useState<Product[]>([])
   const [isLoading, setIsloading] = useState(true)
   const [isloadingButton, setIsloadingButton] = useState(false)
   const [isModalOpen, setIsModalOpen] = useState(false)
   const [openDrawer, setOpenDrawer] = useState(false)
   const [isEditing, setIsEditing] = useState(false)
   const [showConfirmDialog, setShowConfirmDialog] = useState(false)
   const [editingProductId, setEditingProductId] = useState<string | null>(null)
   const [activeButton, setActiveButton] = useState<string>(VIEW_LISTADO)
   const [pagination, setPagination] = useState({
      pageIndex: 0,
      pageSize: 25,
   })
   const [isFormOrderSelloutOpen, setIsFormOrderSelloutOpen] = useState(false)
   const [productToMove, setProductToMove] = useState<ProductToMove>({
      id: '',
      orderSellout: '0',
      title: '',
   })
   const [formIsDirty, setFormIsDirty] = useState<boolean>(false)

   const defaultFormValues: ProductForm = {
      orderSellout: 0,
      category: '',
      title: '',
      urlProduct: '',
      urlImage: '',
      startDate: undefined,
      endDate: undefined,
      offerState: '',
      isProductHidden: false,
   }

   const {
      register,
      handleSubmit,
      control,
      reset,
      formState: { errors, isDirty },
   } = useForm<ProductForm>({
      resolver: zodResolver(productFormSchema),
      mode: 'onChange',
      defaultValues: defaultFormValues,
   })

   useEffect(() => {
      const fetch = async () => {
         try {
            const data = await getAllProducts()
            setAllProducts(data)
            setProducts(() => getVisibleProducts(data))
         } catch (error) {
            console.error('Error cargando los productos:', error)
         } finally {
            setIsloading(false)
         }
      }
      fetch()
   }, [])

   useEffect(() => {
      setFormIsDirty(isDirty)
   }, [isDirty])

   const handleAddProductSubmit = async (formData: ProductForm) => {
      setIsloadingButton(true)
      try {
         const dataToSend = formatProductDates(formData)
         const data = await addProduct(dataToSend)
         setProducts((prev) => [...prev, data[0]])
         setIsModalOpen(false)
         setOpenDrawer(false)
         Sonner({
            message: 'Producto agregado correctamente',
            sonnerState: 'success',
         })
      } catch (error: unknown) {
         if (error instanceof Error) {
            if (isPostgresError(error) && error.code === '23505') {
               Sonner({
                  message: 'Este orden sellout ya existe en la lista',
                  sonnerState: 'error',
               })
            }
         } else {
            console.error('Error desconocido', error)
         }
      } finally {
         setIsloadingButton(false)
      }
   }

   const handleHideProduct = async (product: Product) => {
      const { id } = product

      // 1. Ocultar el producto y dejar su orderSellout en null
      const { error, data } = await supabase
         .from('listProducts')
         .update({
            isProductHidden: true,
            orderSellout: null,
         })
         .eq('id', id)
         .select()

      if (error) {
         console.error('Error al ocultar producto:', error)
         return
      }

      if (data && data.length > 0) {
         const updatedProduct = data[0]

         // 2. Actualizar localmente allProducts
         let updatedAllProducts = allProducts.map((p) =>
            p.id === id ? updatedProduct : p
         )

         // 3. Obtener productos visibles y reordenarlos secuencialmente
         const visiblesOrdenados = updatedAllProducts
            .filter((p) => !p.isProductHidden)
            .sort((a, b) => (a.orderSellout ?? 0) - (b.orderSellout ?? 0))
            .map((p, index) => ({ ...p, orderSellout: index + 1 }))

         // 4. Upsert masivo solo con productos visibles
         const { error: upsertError } = await supabase
            .from('listProducts')
            .upsert(visiblesOrdenados, { onConflict: 'id' })

         if (upsertError) {
            console.error('Error al actualizar orderSellout:', upsertError)
            Sonner({
               message: 'Error al reordenar productos',
               sonnerState: 'error',
            })
            return
         }

         // 5. Unir visibles actualizados + ocultos
         const ocultos = updatedAllProducts.filter((p) => p.isProductHidden)
         updatedAllProducts = [...visiblesOrdenados, ...ocultos]

         // 6. Actualizar estados
         setAllProducts(updatedAllProducts)
         setProducts(visiblesOrdenados)

         Sonner({
            message: 'Producto ocultado correctamente',
            sonnerState: 'success',
         })
      }
   }

   const handleUnhideProduct = async (product: Product) => {
      const { id } = product

      // Obtener el máximo orderSellout entre los productos visibles
      const { data: maxOrderData, error: maxOrderError } = await supabase
         .from('listProducts')
         .select('orderSellout')
         .not('isProductHidden', 'eq', true)
         .order('orderSellout', { ascending: false })
         .limit(1)

      if (maxOrderError) {
         console.error('Error obteniendo máximo orderSellout:', maxOrderError)
         return
      }

      // Sacar el máximo orderSellout, si no hay productos visibles usar 0
      const maxorderSellout =
         maxOrderData && maxOrderData.length > 0
            ? maxOrderData[0].orderSellout ?? 0
            : 0

      // Actualizar el producto para desocultarlo y ponerle el orden siguiente
      const { error, data } = await supabase
         .from('listProducts')
         .update({
            isProductHidden: false,
            orderSellout: maxorderSellout + 1,
         })
         .eq('id', id)
         .select()

      if (error) {
         console.error('Error al desocultar producto:', error)
      } else if (data && data.length > 0) {
         const updatedProduct = data[0]
         // Actualizar el estado global allProducts con el producto actualizado
         const updatedAllProducts = allProducts.map((p) =>
            p.id === id ? updatedProduct : p
         )
         setAllProducts(updatedAllProducts)

         // Mostrar solo los productos visibles actualizados
         const visibles = updatedAllProducts.filter((p) => !p.isProductHidden)
         setProducts(visibles)
         setActiveButton(VIEW_LISTADO)

         Sonner({
            message: 'Producto desocultado correctamente',
            sonnerState: 'success',
         })
      }
   }

   const handlePrepareEdit = (product: Product) => {
      setIsEditing(true)
      setEditingProductId(product.id || null)
      reset({
         orderSellout: product.orderSellout?.toString() || '',
         category: product.category,
         title: product.title,
         urlProduct: product.urlProduct,
         urlImage: product.urlImage,
         startDate: product.startDate
            ? parseDate(product.startDate)
            : undefined,
         endDate: product.endDate ? parseDate(product.endDate) : undefined,
         offerState: product.offerState,
         isProductHidden: product.isProductHidden ?? false,
      })
      setOpenDrawer(true)
   }

   const handleEdit = async (formData: ProductForm) => {
      if (!editingProductId) {
         console.error('No hay producto seleccionado para editar')
         return
      }

      setIsloadingButton(true)
      try {
         const { data: existing, error: checkError } = await supabase
            .from('listProducts')
            .select('id')
            .eq('orderSellout', formData.orderSellout)
            .neq('id', editingProductId)
            .limit(1)

         if (checkError) {
            Sonner({
               message: 'Error al validar orden sellout',
               sonnerState: 'error',
            })
            return
         }

         if (existing && existing.length > 0) {
            Sonner({
               message: `El orden sellout "${formData.orderSellout}" ya está asignado a otro producto`,
               sonnerState: 'error',
            })
            return
         }

         const dataToUpdate = {
            ...formData,
            startDate: formatDateToISO(formData.startDate),
            endDate: formatDateToISO(formData.endDate),
         }

         const { data, error } = await supabase
            .from('listProducts')
            .update(dataToUpdate)
            .eq('id', editingProductId)
            .select()

         if (error) {
            Sonner({
               message: 'Error al actualizar producto',
               sonnerState: 'error',
            })
         } else if (data && data.length > 0) {
            Sonner({
               message: 'Producto actualizado correctamente',
               sonnerState: 'success',
            })
            setProducts((prev) =>
               prev.map((p) => (p.id === editingProductId ? data[0] : p))
            )
            setIsEditing(false)
            setOpenDrawer(false)
            reset(defaultFormValues)
            setEditingProductId(null)
         }
      } finally {
         setIsloadingButton(false)
      }
   }

   const handleDeleteProduct = async (productInfo: Product) => {
      const ID = productInfo.id
      const { error } = await supabase
         .from('listProducts')
         .delete()
         .eq('id', ID)

      if (error) {
         console.error('Error al eliminar:', error)
      } else {
         const newlist = allProducts.filter((product) => product.id !== ID)
         setAllProducts(newlist)

         const filtered = newlist.filter((p) =>
            activeButton === VIEW_LISTADO
               ? !p.isProductHidden
               : p.isProductHidden
         )
         setProducts(filtered)

         Sonner({
            message: 'Producto eliminado correctamente',
            sonnerState: 'success',
         })
      }
   }

   const onSubmit = (data: ProductForm) => {
      if (isEditing) {
         handleEdit(data)
      } else {
         handleAddProductSubmit(data)
      }
   }

   const handleMoveProduct = (productInfo: Product) => {
      setOpenDrawer(true)
      setIsFormOrderSelloutOpen(true)
      setProductToMove({
         id: productInfo.id,
         orderSellout: String(productInfo.orderSellout),
         title: productInfo.title,
      })
   }

   const handleBackdropClick = () => {
      if (formIsDirty) {
         setShowConfirmDialog(true)
      } else {
         setOpenDrawer(false)
         setFormIsDirty(false)
         setIsFormOrderSelloutOpen(false)
      }
   }

   return {
      products,
      setProducts,
      handleAddProductSubmit,
      handlePrepareEdit,
      handleEdit,
      handleDeleteProduct,
      isLoading,
      isloadingButton,
      errors,
      register,
      handleSubmit,
      Controller,
      control,
      isModalOpen,
      setIsModalOpen,
      openDrawer,
      setOpenDrawer,
      isEditing,
      setIsEditing,
      reset,
      isDirty,
      showConfirmDialog,
      setShowConfirmDialog,
      handleHideProduct,
      activeButton,
      setActiveButton,
      handleUnhideProduct,
      pagination,
      setPagination,
      onSubmit,
      isFormOrderSelloutOpen,
      setIsFormOrderSelloutOpen,
      handleMoveProduct,
      productToMove,
      setAllProducts,
      handleBackdropClick,
      setFormIsDirty,
      allProducts,
   }
}
