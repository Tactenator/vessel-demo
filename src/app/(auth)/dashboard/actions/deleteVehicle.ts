'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getUser } from './_getUser'
import { revalidatePath } from 'next/cache'

export async function deleteVehicle(vehicleId: string) {
  const user = await getUser()

  // Guard: Only full managers can delete vehicles
  if (!user || user.position !== 'manager') {
    return { success: false, error: 'Unauthorized: Only managers can delete vehicles.' }
  }

  if (!vehicleId) {
    return { success: false, error: 'Missing vehicle.' }
  }

  try {
    const payload = await getPayload({ config: configPromise })

    const [maintenanceRes, paymentsRes] = await Promise.all([
      payload.find({
        collection: 'vehicle-maintenance',
        overrideAccess: true,
        depth: 0,
        limit: 1,
        where: { vehicle: { equals: vehicleId } },
      }),
      payload.find({
        collection: 'payments',
        overrideAccess: true,
        depth: 0,
        limit: 1,
        where: { vehicle: { equals: vehicleId } },
      }),
    ])

    if (maintenanceRes.totalDocs > 0 || paymentsRes.totalDocs > 0) {
      return {
        success: false,
        error:
          'This vehicle has maintenance items or expenses logged against it. Remove or reassign those first before deleting the vehicle.',
      }
    }

    await payload.delete({
      collection: 'vehicles',
      id: vehicleId,
      overrideAccess: true,
    })

    revalidatePath('/dashboard/vehicles')
    return { success: true }
  } catch (err: any) {
    console.error('Failed to delete vehicle:', err)
    return { success: false, error: err.message || 'Failed to delete vehicle.' }
  }
}
