'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getUser } from './_getUser'
import { revalidatePath } from 'next/cache'

export async function updateVehicle(formData: {
  vehicleId: string
  name?: string
  vehicleYear: string
  vehicleMake: string
  vehicleModel: string
  notes?: string
  carColor?: string
}) {
  const user = await getUser()

  // Guard: Only full managers can edit vehicles
  if (!user || user.position !== 'manager') {
    return { success: false, error: 'Unauthorized: Only managers can edit vehicles.' }
  }

  if (!formData.vehicleId) {
    return { success: false, error: 'Missing vehicle.' }
  }

  if (!formData.vehicleYear || !formData.vehicleMake || !formData.vehicleModel) {
    return { success: false, error: 'Vehicle year, make, and model are required.' }
  }

  try {
    const payload = await getPayload({ config: configPromise })

    await payload.update({
      collection: 'vehicles',
      id: formData.vehicleId,
      overrideAccess: true,
      data: {
        name: formData.name || '',
        vehicleYear: formData.vehicleYear,
        vehicleMake: formData.vehicleMake,
        vehicleModel: formData.vehicleModel,
        notes: formData.notes || '',
        ...(formData.carColor ? { carColor: formData.carColor } : {}),
      },
    })

    revalidatePath('/dashboard/vehicles')
    return { success: true }
  } catch (err: any) {
    console.error('Failed to update vehicle:', err)
    return { success: false, error: err.message || 'Failed to update vehicle.' }
  }
}
