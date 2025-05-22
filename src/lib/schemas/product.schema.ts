import { z } from 'zod'

export const productFormSchema = z.object({
   orderSellout: z
      .string()
      .min(1, 'El orden sellout es obligatorio')
      .max(3, 'Debe contener máximo 3 números')
      .refine((val) => {
         const num = Number(val)
         return !isNaN(num) && num > 0 && Number.isInteger(num)
      }, 'Debe ser un número entero positivo'),
   category: z.string().min(1, 'La categoría es obligatoria'),
   title: z
      .string()
      .min(5, 'El título es obligatorio')
      .max(50, 'Máximo 50 caracteres'),
   urlProduct: z
      .string()
      .url('Debe ser una URL válida')
      .refine((url) => url.startsWith('http'), {
         message: 'La URL debe comenzar con http o https',
      }),
   urlImage: z
      .string()
      .url('Debe ser una URL válida')
      .refine((url) => url.startsWith('http'), {
         message: 'La URL debe comenzar con http o https',
      }),
   startDate: z.preprocess(
      (arg) => (arg instanceof Date ? arg : new Date(arg as string)),
      z
         .date({
            required_error: 'La fecha de inicio es obligatoria',
            invalid_type_error: 'La fecha debe ser válida',
         })
         .refine((date) => !isNaN(date.getTime()), {
            message: 'La fecha debe ser válida',
         })
   ),
   endDate: z.preprocess(
      (arg) => (arg instanceof Date ? arg : new Date(arg as string)),
      z
         .date({
            required_error: 'La fecha de fin es obligatoria',
            invalid_type_error: 'La fecha debe ser válida',
         })
         .refine((date) => !isNaN(date.getTime()), {
            message: 'La fecha debe ser válida',
         })
   ),

   offerState: z.string().min(1, 'El estado de la oferta es obligatorio'),
   isProductHidden: z.boolean().optional(),
})

export const productToMoveSchema = z.object({
   neworderSellout: z
      .string()
      .min(1, 'El orden sellout es obligatorio')
      .max(3, 'Debe contener máximo 3 números')
      .refine((val) => {
         const num = Number(val)
         return !isNaN(num) && num > 0 && Number.isInteger(num)
      }, 'Debe ser un número entero positivo'),
})
