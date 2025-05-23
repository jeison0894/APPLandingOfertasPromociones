import type { Product, ProductForm, ProductToMove } from '@/types/product'
import supabase from '@/utils/supabase'
import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { productFormSchema } from '@/lib/schemas/product.schema'
import { VIEW_LISTADO } from '@/constants/views'
import {
   addProduct,
   deleteProduct,
   editProduct,
   getAllProducts,
   hasDuplicateOrderSellout,
   upsertProducts,
} from '@/api/products'
import { isPostgresError } from '@/utils/errorHelpers'
import {
   formatProductDates,
   getDefaultEditProductForm,
   getVisibleProducts,
   reOrderOrderSellout,
} from '@/utils/product.utils'
import Sonner from '@/components/Sonner'

export function useProductsProvider() {
   const [allProducts, setAllProducts] = useState<Product[]>([])
   const [products, setProducts] = useState<Product[]>([])
   const [isLoading, setIsloading] = useState(true)
   const [isloadingButton, setIsloadingButton] = useState(false)
   const [isModalOpen, setIsModalOpen] = useState(false)
   const [openDrawer, setOpenDrawer] = useState(false)
   const [isEditing, setIsEditing] = useState(false)
   const [showConfirmDialog, setShowConfirmDialog] = useState(false)
   const [idProductToEdit, setIdProductToEdit] = useState<string | null>(null)
   const [activeButton, setActiveButton] = useState<string>(VIEW_LISTADO)
   const [pagination, setPagination] = useState({
      pageIndex: 0,
      pageSize: 25,
   })
   const [isFormOrderSelloutOpen, setIsFormOrderSelloutOpen] = useState(false)
   const [productToMove, setInfoProductToMove] = useState<ProductToMove>({
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

   const onSubmitForm = (data: ProductForm) => {
      if (isEditing) {
         handleEditProductSubmit(data)
      } else {
         handleAddProductSubmit(data)
      }
   }

   const handleAddProductSubmit = async (formData: ProductForm) => {
      setIsloadingButton(true)
      try {
         const dataToSend = formatProductDates(formData)
         const data = await addProduct(dataToSend)
         setAllProducts((prev) => [...prev, data[0]])
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

   const handlePrepareEdit = (product: Product) => {
      setIsEditing(true)
      setIdProductToEdit(product.id || null)
      reset(getDefaultEditProductForm(product))
      setOpenDrawer(true)
   }

   const handleEditProductSubmit = async (formData: ProductForm) => {
      if (!idProductToEdit) {
         Sonner({
            message: 'No hay producto seleccionado para editar',
            sonnerState: 'error',
         })
         return
      }
      setIsloadingButton(true)
      try {
         const hasDuplicate = await hasDuplicateOrderSellout(
            formData,
            idProductToEdit
         )
         if (hasDuplicate) {
            Sonner({
               message: `El orden sellout "${formData.orderSellout}" ya está asignado a otro producto`,
               sonnerState: 'error',
            })
            return
         }
         const dataToUpdate = formatProductDates(formData)
         const productUpdated = await editProduct(dataToUpdate, idProductToEdit)
         if (productUpdated) {
            Sonner({
               message: 'Producto actualizado correctamente',
               sonnerState: 'success',
            })
            setProducts((prev) =>
               prev.map((p) =>
                  p.id === idProductToEdit ? productUpdated[0] : p
               )
            )
            setIsEditing(false)
            setOpenDrawer(false)
            reset(defaultFormValues)
            setIdProductToEdit(null)
         }
      } catch (error) {
         Sonner({
            message: 'Ocurrió un error al editar el producto',
            sonnerState: 'error',
         })
         console.error(error)
      } finally {
         setIsloadingButton(false)
      }
   }

   const handleDeleteProduct = async (productInfo: Product) => {
      const id = productInfo.id
      if (!id) {
         Sonner({ message: 'ID inválido', sonnerState: 'error' })
         return
      }

      try {
         await deleteProduct(id)
         const updateList = allProducts.filter((p) => p.id !== id)
         setAllProducts(updateList)

         if (activeButton === VIEW_LISTADO) {
            const visibleProducts = getVisibleProducts(updateList)
            const orderedProducts = reOrderOrderSellout(visibleProducts)
            upsertProducts(orderedProducts)
            setProducts(orderedProducts)
         } else {
            const hiddenProducts = updateList.filter((p) => p.isProductHidden)
            setProducts(hiddenProducts)
         }
         Sonner({
            message: 'Producto eliminado correctamente',
            sonnerState: 'success',
         })
      } catch (error) {
         console.error(error)
         Sonner({
            message: 'Error al eliminar el producto',
            sonnerState: 'error',
         })
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

   const handleChangeOrderSelloutForm = (productInfo: Product) => {
      setOpenDrawer(true)
      setIsFormOrderSelloutOpen(true)
      setInfoProductToMove({
         id: productInfo.id,
         orderSellout: String(productInfo.orderSellout),
         title: productInfo.title,
      })
   }

   const handleBackdropDrawerClick = () => {
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
      handleEditProductSubmit,
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
      onSubmitForm,
      isFormOrderSelloutOpen,
      setIsFormOrderSelloutOpen,
      handleChangeOrderSelloutForm,
      productToMove,
      setAllProducts,
      handleBackdropDrawerClick,
      setFormIsDirty,
      allProducts,
   }
}
