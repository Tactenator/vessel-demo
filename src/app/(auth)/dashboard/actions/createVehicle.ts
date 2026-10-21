'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getUser } from './_getUser'
import { revalidatePath } from 'next/cache'

export async function createVehicle(formData: {
  name?: string
  vehicleYear: string
  vehicleMake: string
  vehicleModel: string
  odometer?: string
  needsGas?: boolean
  notes?: string
  carColor?: string
}) {
  const user = await getUser()

  // Guard: Only full managers can create vehicles
  if (!user || user.position !== 'manager') {
    return { success: false, error: 'Unauthorized: Only managers can add vehicles.' }
  }

  if (!formData.vehicleYear || !formData.vehicleMake || !formData.vehicleModel) {
    return { success: false, error: 'Vehicle year, make, and model are required.' }
  }

  try {
    const payload = await getPayload({ config: configPromise })

    const newVehicle = await payload.create({
      collection: 'vehicles',
      overrideAccess: true,
      data: {
        name: formData.name || '',
        vehicleYear: formData.vehicleYear,
        vehicleMake: formData.vehicleMake,
        vehicleModel: formData.vehicleModel,
        odometer: formData.odometer || '',
        needsGas: formData.needsGas || false,
        notes: formData.notes || '',
        carColor: formData.carColor || '#334155',
      },
    })

    revalidatePath('/dashboard/vehicles')
    return { success: true, vehicle: newVehicle }
  } catch (err: any) {
    console.error('Failed to create vehicle:', err)
    return { success: false, error: err.message || 'Failed to create vehicle.' }
  }
}
