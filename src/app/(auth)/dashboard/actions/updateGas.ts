'use server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'

export async function updateGasStatus(formData: FormData) {
  const payload = await getPayload({ config: configPromise })

  const vehicleId = formData.get('vehicleId') as string
  const odometer = formData.get('odometer') as string
  const needsGasValue = formData.get('needsGas') === 'true'

  try {
    await payload.update({
      collection: 'vehicles',
      id: vehicleId,
      data: {
        odometer: odometer,
        needsGas: needsGasValue,
      },
    })

    // Refresh the page data
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Update failed:', error)
    return { success: false, error: 'Failed to update' }
  }
}
