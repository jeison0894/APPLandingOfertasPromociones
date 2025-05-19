import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SelectNative } from './ui/select-native'
import { LoaderProducts } from './LoaderProducts'
import { useProducts } from '@/hooks/useProducts'
import { CalendarIcon } from 'lucide-react'
import {
   Button as ButtonAria,
   DatePicker,
   Dialog as DialogAria,
   Group,
   Label as LabelAria,
   Popover,
} from 'react-aria-components'
import { DateInput } from './ui/datefield-rac'
import { Calendar } from '@/components/ui/calendar-rac'
import type { ProductForm } from '@/types/product'

export default function Form() {
   const {
      isloadingButton,
      handleAddProduct,
      handleEdit,
      errors,
      register,
      handleSubmit,
      Controller,
      control,
      isEditing,
   } = useProducts()

   const onSubmit = (data: ProductForm) => {
      if (isEditing) {
         handleEdit(data)
      } else {
         handleAddProduct(data)
      }
   }

   return (
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
         <h3 className="mb-5 font-bold border-b-1 pb-3">
            {isEditing ? 'Editar Producto' : 'Agregar Producto'}
         </h3>
         {/* Orden Sellout */}
         <div className="*:not-first:mt-1 mb-3 w-full">
            <Label className="text-sm font-medium" htmlFor="ordenSellout">
               Orden Sellout
            </Label>
            <Input
               className="peer w-full"
               id="ordenSellout"
               placeholder="Ingresa el orden sellout"
               aria-invalid={!!errors.ordenSellout}
               {...register('ordenSellout')}
            />
            {errors.ordenSellout && (
               <p
                  className="peer-aria-invalid:text-destructive mt-2 text-xs"
                  role="alert"
                  aria-live="polite">
                  {errors.ordenSellout.message}
               </p>
            )}
         </div>

         {/* Categoría */}
         <div className="*:not-first:mt-1 mb-3 w-full">
            <Label className="text-sm font-medium" htmlFor="category">
               Categoría
            </Label>
            <SelectNative
               id="category"
               className="peer bg-muted border-transparent shadow-none"
               aria-invalid={!!errors.category}
               {...register('category')}>
               <option value="" disabled>
                  Selecciona una categoría
               </option>
               <option value="Tecnologia">Tecnologia</option>
               <option value="ElectroHogar">ElectroHogar</option>
               <option value="VestuarioMujer">Vestuario Mujer</option>
               <option value="VestuarioHombre">Vestuario Hombre</option>
               <option value="Infantil">Infantil</option>
               <option value="Calzado">Calzado</option>
               <option value="Belleza">Belleza</option>
               <option value="AccesoriosModa">Accesorios Moda</option>
               <option value="hogHogarar">Hogar</option>
               <option value="Deportes">Deportes</option>
               <option value="Otros">Otros</option>
            </SelectNative>
            {errors.category && (
               <p
                  className="text-red-400 mt-1 text-xs"
                  role="alert"
                  aria-live="polite">
                  {errors.category.message}
               </p>
            )}
         </div>

         {/* Título */}
         <div className="*:not-first:mt-1 mb-3 w-full">
            <Label className="text-sm font-medium" htmlFor="title">
               Llamado
            </Label>
            <Input
               id="title"
               className="peer"
               placeholder="Nombre del producto"
               type="text"
               aria-invalid={!!errors.title}
               {...register('title')}
            />
            {errors.title && (
               <p
                  className="peer-aria-invalid:text-destructive mt-0.5 text-xs"
                  role="alert"
                  aria-live="polite">
                  {errors.title.message}
               </p>
            )}
         </div>

         {/* URL Producto */}
         <div className="*:not-first:mt-1 mb-3 w-full">
            <Label className="text-sm font-medium" htmlFor="urlProduct">
               URL
            </Label>
            <Input
               id="urlProduct"
               className="peer"
               placeholder="https://ejemplo.com/producto"
               type="url"
               aria-invalid={!!errors.urlProduct}
               {...register('urlProduct')}
            />
            {errors.urlProduct && (
               <p
                  className="peer-aria-invalid:text-destructive mt-0.5 text-xs"
                  role="alert"
                  aria-live="polite">
                  {errors.urlProduct.message}
               </p>
            )}
         </div>

         {/* URL Imagen */}
         <div className="*:not-first:mt-1 mb-3 w-full">
            <Label className="text-sm font-medium" htmlFor="urlImage">
               URL Imagen
            </Label>
            <Input
               id="urlImage"
               className="peer"
               placeholder="https://ejemplo.com/imagen.jpg"
               type="url"
               aria-invalid={!!errors.urlImage}
               {...register('urlImage')}
            />
            {errors.urlImage && (
               <p
                  className="peer-aria-invalid:text-destructive mt-0.5 text-xs"
                  role="alert"
                  aria-live="polite">
                  {errors.urlImage.message}
               </p>
            )}
         </div>

         <div className="flex justify-between space-x-3 mb-3">
            <div className="*:not-first:mt-1 w-full">
               <Controller
                  name="startDate"
                  control={control}
                  render={({
                     field: { onChange, value },
                     fieldState: { error },
                  }) => (
                     <>
                        <DatePicker
                           value={value ?? null}
                           onChange={onChange}
                           className={`*:not-first:mt-1 ${
                              error ? 'border-red-500' : ''
                           }`}>
                           <LabelAria className="text-foreground text-sm font-medium">
                              Fecha Inicio
                           </LabelAria>
                           <div className="flex">
                              <Group className="w-full">
                                 <DateInput
                                    className={
                                       error ? 'border-red-400' : '' + ' pe-9'
                                    }
                                 />
                              </Group>
                              <ButtonAria className="text-muted-foreground/80 hover:text-foreground data-focus-visible:border-ring data-focus-visible:ring-ring/50 z-10 -ms-9 -me-px flex w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none data-focus-visible:ring-[3px]">
                                 <CalendarIcon size={16} />
                              </ButtonAria>
                           </div>
                           <Popover
                              className="bg-background text-popover-foreground data-entering:animate-in data-exiting:animate-out data-[entering]:fade-in-0 data-[exiting]:fade-out-0 data-[entering]:zoom-in-95 data-[exiting]:zoom-out-95 data-[placement=bottom]:slide-in-from-top-2 data-[placement=left]:slide-in-from-right-2 data-[placement=right]:slide-in-from-left-2 data-[placement=top]:slide-in-from-bottom-2 z-50 rounded-lg border shadow-lg outline-hidden"
                              offset={4}>
                              <DialogAria className="max-h-[inherit] overflow-auto p-2">
                                 <Calendar />
                              </DialogAria>
                           </Popover>
                        </DatePicker>
                        {error && (
                           <p
                              className="text-red-400 mt-1 text-xs"
                              role="alert"
                              aria-live="polite">
                              {errors.startDate && 'Esta fecha es obligatoria'}
                           </p>
                        )}
                     </>
                  )}
               />
            </div>

            <div className="*:not-first:mt-1 w-full">
               <Controller
                  name="endDate"
                  control={control}
                  render={({
                     field: { onChange, value },
                     fieldState: { error },
                  }) => (
                     <>
                        <DatePicker
                           value={value ?? null}
                           onChange={onChange}
                           className={`*:not-first:mt-1 ${
                              error ? 'border-red-500' : ''
                           }`}>
                           <LabelAria className="text-foreground text-sm font-medium">
                              Fecha Fin
                           </LabelAria>
                           <div className="flex">
                              <Group className="w-full">
                                 <DateInput
                                    className={
                                       error ? 'border-red-400' : '' + ' pe-9'
                                    }
                                 />
                              </Group>
                              <ButtonAria className="text-muted-foreground/80 hover:text-foreground data-focus-visible:border-ring data-focus-visible:ring-ring/50 z-10 -ms-9 -me-px flex w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none data-focus-visible:ring-[3px]">
                                 <CalendarIcon size={16} />
                              </ButtonAria>
                           </div>
                           <Popover
                              className="bg-background text-popover-foreground data-entering:animate-in data-exiting:animate-out data-[entering]:fade-in-0 data-[exiting]:fade-out-0 data-[entering]:zoom-in-95 data-[exiting]:zoom-out-95 data-[placement=bottom]:slide-in-from-top-2 data-[placement=left]:slide-in-from-right-2 data-[placement=right]:slide-in-from-left-2 data-[placement=top]:slide-in-from-bottom-2 !z-[9999] rounded-lg border shadow-lg outline-hidden"
                              offset={4}>
                              <Calendar />
                           </Popover>
                        </DatePicker>
                        {error && (
                           <p
                              className="text-red-400 mt-1 text-xs"
                              role="alert"
                              aria-live="polite">
                              {errors.endDate && 'Esta fecha es obligatoria'}
                           </p>
                        )}
                     </>
                  )}
               />
            </div>
         </div>

         {/* Estado de la oferta */}
         <div className="*:not-first:mt-1 mb-5 w-full">
            <Label className="text-sm font-medium" htmlFor="offerState">
               Estado Oferta
            </Label>
            <SelectNative
               id="offerState"
               className="peer bg-muted border-transparent shadow-none"
               aria-invalid={!!errors.offerState}
               {...register('offerState')}>
               <option value="" disabled>
                  Selecciona un estado
               </option>
               <option value="LANZAMIENTO">Lanzamiento</option>
               <option value="SOLO X 24 HORAS">Solo X 24 Horas</option>
               <option value="SOLO X 48 HORAS">Solo X 48 Horas</option>
               <option value="AGOTADO">Agotado</option>
            </SelectNative>
            {errors.offerState && (
               <p
                  className="text-red-400 mt-1 text-xs"
                  role="alert"
                  aria-live="polite">
                  {errors.offerState.message}
               </p>
            )}
         </div>

         <Button type="submit" className="w-full" disabled={isloadingButton}>
            {isloadingButton ? (
               <LoaderProducts />
            ) : isEditing ? (
               'Editar'
            ) : (
               'Agregar'
            )}
         </Button>
      </form>
   )
}
