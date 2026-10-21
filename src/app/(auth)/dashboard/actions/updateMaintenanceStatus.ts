'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getUser } from './_getUser'
import { revalidatePath } from 'next/cache'

type MaintenanceStatus = 'needed' | 'scheduled' | 'completed'

export async function updateMaintenanceStatus(itemId: string, status: MaintenanceStatus) {
  const user = await getUser()

  // Guard: Only full managers can update maintenance status
  if (!user || user.position !== 'manager') {
    return { success: false, error: 'Unauthorized: Only managers can update maintenance items.' }
  }

  if (!itemId) return { success: false, error: 'Missing maintenance item.' }

  try {
    const payload = await getPayload({ config: configPromise })

    await payload.update({
      collection: 'vehicle-maintenance',
      id: itemId,
      overrideAccess: true,
      data: {
        status,
        ...(status === 'completed' ? { completedDate: new Date().toISOString() } : {}),
      },
    })

    revalidatePath('/dashboard/vehicles')
    return { success: true }
  } catch (err: any) {
    console.error('Failed to update maintenance status:', err)
    return { success: false, error: err.message || 'Failed to update maintenance status.' }
  }
}
