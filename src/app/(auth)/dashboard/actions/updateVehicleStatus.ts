'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getUser } from './_getUser'
import { revalidatePath } from 'next/cache'

export async function updateVehicleStatus(formData: {
  vehicleId: string
  odometer: string
  needsGas: boolean
}) {
  const user = await getUser()

  // Guard: Only full managers can update a vehicle's odometer/gas status
  if (!user || user.position !== 'manager') {
    return { success: false, error: 'Unauthorized: Only managers can update vehicle status.' }
  }

  if (!formData.vehicleId) {
    return { success: false, error: 'Missing vehicle.' }
  }

  try {
    const payload = await getPayload({ config: configPromise })

    await payload.update({
      collection: 'vehicles',
      id: formData.vehicleId,
      overrideAccess: true,
      data: {
        odometer: formData.odometer || '',
        needsGas: formData.needsGas,
      },
    })

    revalidatePath('/dashboard/vehicles')
    return { success: true }
  } catch (err: any) {
    console.error('Failed to update vehicle status:', err)
    return { success: false, error: err.message || 'Failed to update vehicle status.' }
  }
}
