import type { Product, ProductForm, ProductToMove } from '@/types/product'
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
   hideProduct,
   unhideProduct,
   upsertProducts,
} from '@/api/products'
import { isPostgresError } from '@/utils/errorHelpers'
import {
   formatProductDates,
   getDefaultEditProductForm,
   getMaxOrderSellout,
   getVisibleProducts,
   moveProductToEnd,
   reorderOrderSellout,
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
            const orderedProducts = reorderOrderSellout(visibleProducts)
            await upsertProducts(orderedProducts)
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
      const id = product.id
      if (!id) {
         Sonner({
            message: 'No hay producto seleccionado para ocultar',
            sonnerState: 'error',
         })
         return
      }

      try {
         const [hiddenProduct] = await hideProduct(id)
         const updateList = allProducts.map((p) =>
            p.id === id ? hiddenProduct : p
         )
         const visibleProducts = getVisibleProducts(updateList)
         const orderedProducts = reorderOrderSellout(visibleProducts)
         await upsertProducts(orderedProducts)
         setAllProducts(updateList)
         setProducts(orderedProducts)
         Sonner({
            message: 'Producto ocultado correctamente',
            sonnerState: 'success',
         })
      } catch (error) {
         console.error(error)
         Sonner({
            message: 'Error al ocultar el producto',
            sonnerState: 'error',
         })
      }
   }

   const handleUnhideProduct = async (product: Product) => {
      const { id } = product
      if (!id) {
         Sonner({
            message: 'No hay producto seleccionado para desocultar',
            sonnerState: 'error',
         })
         return
      }

      try {
         const maxOrderSellout = await getMaxOrderSellout()
         const unhiddenProduct = await unhideProduct(maxOrderSellout, id)
         const updatedList = moveProductToEnd(allProducts, id, unhiddenProduct)
         const visibles = getVisibleProducts(updatedList)
         const orderedProducts = reorderOrderSellout(visibles)
         setAllProducts(updatedList)
         setProducts(orderedProducts)
         setActiveButton(VIEW_LISTADO)
         Sonner({
            message: 'Producto desocultado correctamente',
            sonnerState: 'success',
         })
      } catch (error) {
         console.error(error)
         Sonner({
            message: 'Error al desocultar el producto',
            sonnerState: 'error',
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
