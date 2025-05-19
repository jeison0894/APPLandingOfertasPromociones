// Insertar en Supabase
const { data, error } = await supabase
.from('listProducts')
.insert([validatedData])
.select()

         if (error) {
            console.error('Error insertando producto:', error)
            alert('Error al guardar el producto en la base de datos.')
            setLoading(false)
            return
         }

// initialvalue

ordenSellout: 1,
category: 'asdasd',
title: 'asdasd',
urlProduct: 'https://chatgpt.com/c/6828d709-5660-800b-a855-85db39f51401',
urlImage: 'https://chatgpt.com/c/6828d709-5660-800b-a855-85db39f51401',
startDate: '2025-05-29',
endDate: '2025-05-30',
offerState: 'none',
isProductHidden: false,

         /*    const [startDate, setStartDate] = useState<Date | undefined>(undefined)

const [endDate, setEndDate] = useState<Date | undefined>(undefined) \*/
