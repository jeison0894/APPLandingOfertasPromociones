import Sooner from '@/components/Sooner'
import type { Product, ProductForm, ProductToMoveForm } from '@/types/product'
import supabase from '@/utils/supabase'
import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { productFormSchema } from '@/lib/schemas/product.schema'
import { parseDate } from '@internationalized/date'
import { VIEW_LISTADO } from '@/constants/views'

const defaultFormValues: ProductForm = {
   ordenSellout: '',
   category: '',
   title: '',
   urlProduct: '',
   urlImage: '',
   startDate: undefined,
   endDate: undefined,
   offerState: '',
   isProductHidden: false,
}

function formatDateToISO(date?: Date | string | null) {
   if (!date) return null
   if (typeof date === 'string') return date
   return date.toISOString().split('T')[0]
}

export function useProductsProvider() {
   const [allProducts, setAllProducts] = useState<Product[]>([])
   const [products, setProducts] = useState<Product[]>([])
   const [isloading, setIsloading] = useState(true)
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
   const [productToMove, setProductToMove] = useState<ProductToMoveForm>({
      newOrdenSellout: 0,
   })

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
      const fetchProducts = async () => {
         const { data, error } = await supabase
            .from('listProducts')
            .select('*')
            .order('ordenSellout', { ascending: true })

         if (error) {
            console.error('Error fetching products:', error)
         } else {
            setAllProducts(data || [])
            const visibles = (data || []).filter((p) => !p.isProductHidden)
            setProducts(visibles) // ya vienen ordenados
         }

         setIsloading(false)
      }
      fetchProducts()
   }, [])

   const showVisibleProducts = () => {
      console.log(products)
      const visibles = allProducts.filter((p) => !p.isProductHidden)
      setProducts(visibles)
   }

   const showHiddenProducts = () => {
      const ocultos = allProducts.filter((p) => p.isProductHidden)
      setProducts(ocultos)
   }

   const handleHideProduct = async (product: Product) => {
      const { id } = product

      const { error, data } = await supabase
         .from('listProducts')
         .update({
            isProductHidden: true,
            ordenSellout: null,
         })
         .eq('id', id)
         .select()

      if (error) {
         console.error('Error al ocultar producto:', error)
      } else if (data && data.length > 0) {
         // Actualizar allProducts con el producto modificado
         const updatedProduct = data[0]
         const updatedAllProducts = allProducts.map((p) =>
            p.id === id ? updatedProduct : p
         )

         setAllProducts(updatedAllProducts)

         // Volver a mostrar solo los productos visibles
         const visibles = updatedAllProducts.filter((p) => !p.isProductHidden)
         setProducts(visibles)

         Sooner({
            message: 'Producto ocultado correctamente',
            soonerState: 'success',
         })
      }
   }

   const handleUnhideProduct = async (product: Product) => {
      const { id } = product

      // Obtener el máximo ordenSellout entre los productos visibles
      const { data: maxOrderData, error: maxOrderError } = await supabase
         .from('listProducts')
         .select('ordenSellout')
         .not('isProductHidden', 'eq', true)
         .order('ordenSellout', { ascending: false })
         .limit(1)

      if (maxOrderError) {
         console.error('Error obteniendo máximo ordenSellout:', maxOrderError)
         return
      }

      // Sacar el máximo ordenSellout, si no hay productos visibles usar 0
      const maxOrdenSellout =
         maxOrderData && maxOrderData.length > 0
            ? maxOrderData[0].ordenSellout ?? 0
            : 0

      // Actualizar el producto para desocultarlo y ponerle el orden siguiente
      const { error, data } = await supabase
         .from('listProducts')
         .update({
            isProductHidden: false,
            ordenSellout: maxOrdenSellout + 1,
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

         Sooner({
            message: 'Producto desocultado correctamente',
            soonerState: 'success',
         })
      }
   }

   const handleAddProduct = async (formData: ProductForm) => {
      setIsloadingButton(true)
      try {
         const dataToSend = {
            ...formData,
            startDate: formatDateToISO(formData.startDate),
            endDate: formatDateToISO(formData.endDate),
         }

         const { data, error } = await supabase
            .from('listProducts')
            .insert([dataToSend])
            .select()

         if (error && error.code === '23505') {
            Sooner({
               message: 'Este orden sellout ya existe en la lista',
               soonerState: 'error',
            })
            return
         }

         if (data) {
            setProducts((prev) => [...prev, data[0]])
            setIsModalOpen(false)
            setOpenDrawer(false)
            Sooner({
               message: 'Producto agregado correctamente',
               soonerState: 'success',
            })
            reset(defaultFormValues)
         }
      } finally {
         setIsloadingButton(false)
      }
   }

   const handlePrepareEdit = (product: Product) => {
      setIsEditing(true)
      setEditingProductId(product.id || null)
      reset({
         ordenSellout: product.ordenSellout?.toString() || '',
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
            .eq('ordenSellout', formData.ordenSellout)
            .neq('id', editingProductId)
            .limit(1)

         if (checkError) {
            Sooner({
               message: 'Error al validar orden sellout',
               soonerState: 'error',
            })
            return
         }

         if (existing && existing.length > 0) {
            Sooner({
               message: `El orden sellout "${formData.ordenSellout}" ya está asignado a otro producto`,
               soonerState: 'error',
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
            Sooner({
               message: 'Error al actualizar producto',
               soonerState: 'error',
            })
         } else if (data && data.length > 0) {
            Sooner({
               message: 'Producto actualizado correctamente',
               soonerState: 'success',
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

         Sooner({
            message: 'Producto eliminado correctamente',
            soonerState: 'success',
         })
      }
   }

   const onSubmit = (data: ProductForm) => {
      if (isEditing) {
         handleEdit(data)
      } else {
         handleAddProduct(data)
      }
   }

   const handleMoveProduct = (productInfo: Product) => {
      setOpenDrawer(true)
      setIsFormOrderSelloutOpen(true)
      setProductToMove({
         id: productInfo.id,
         ordenSellout: productInfo.ordenSellout,
      })
   }

   return {
      products,
      setProducts,
      handleAddProduct,
      handlePrepareEdit,
      handleEdit,
      handleDeleteProduct,
      isloading,
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
      showVisibleProducts,
      showHiddenProducts,
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
   }
}
