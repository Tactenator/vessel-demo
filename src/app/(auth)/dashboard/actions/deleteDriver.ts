'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getUser } from './_getUser'
import { revalidatePath } from 'next/cache'

export async function deleteDriver(driverId: string) {
  const user = await getUser()

  // Guard: Only full managers can delete drivers
  if (!user || user.position !== 'manager') {
    return { success: false, error: 'Unauthorized: Only managers can delete drivers.' }
  }

  if (!driverId) {
    return { success: false, error: 'Missing driver.' }
  }

  if (driverId === user.id) {
    return { success: false, error: 'You cannot delete your own account.' }
  }

  try {
    const payload = await getPayload({ config: configPromise })

    const activeJobsRes = await payload.find({
      collection: 'jobs',
      overrideAccess: true,
      depth: 0,
      limit: 1,
      where: {
        and: [
          { status: { in: ['pending', 'in_progress'] } },
          {
            or: [
              { pickupDriver: { equals: driverId } },
              { dropoffDriver: { equals: driverId } },
              { driver: { equals: driverId } },
            ],
          },
        ],
      },
    })

    if (activeJobsRes.totalDocs > 0) {
      return {
        success: false,
        error:
          'This driver has pending or in-progress jobs assigned to them. Reassign or complete those jobs first before deleting the driver.',
      }
    }

    await payload.delete({
      collection: 'drivers',
      id: driverId,
      overrideAccess: true,
    })

    revalidatePath('/dashboard/drivers')
    return { success: true }
  } catch (err: any) {
    console.error('Failed to delete driver:', err)
    return { success: false, error: err.message || 'Failed to delete driver.' }
  }
}
