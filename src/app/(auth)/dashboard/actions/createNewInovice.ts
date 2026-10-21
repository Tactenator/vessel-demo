'use server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'

export async function createNewInvoice(prevState: any, formData: FormData) {
  const payload = await getPayload({ config: configPromise })

  const vehicleId = formData.get('vehicleId') as string
  const itemsPurchased = formData.get('itemsPurchased') as string
  const date = formData.get('date') as string
  const price = formData.get('price') as string
  const file = formData.get('file') as File

  try {
    let receiptId = null

    if (file && file.size > 0) {
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      const mediaDoc = await payload.create({
        collection: 'media',
        data: {},
        // Pass an object containing the data, size, and name
        file: {
          data: buffer,
          name: file.name,
          size: file.size,
          mimetype: file.type,
        },
      })
      receiptId = mediaDoc.id
    }

    await payload.create({
      collection: 'payments',
      data: {
        ...(vehicleId ? { vehicle: vehicleId } : {}),
        itemsPurchased: itemsPurchased,
        date: date,
        price: price,
        receipt: receiptId,
      },
    })

    revalidatePath('/dashboard/expenditures')
    return { success: true }
  } catch (error) {
    console.error('Update failed:', error)
    return { success: false, error: 'Failed to update' }
  }
}
