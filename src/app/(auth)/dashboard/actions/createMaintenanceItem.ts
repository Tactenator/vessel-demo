'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getUser } from './_getUser'
import { revalidatePath } from 'next/cache'

export async function createMaintenanceItem(formData: {
  vehicleId: string
  item: string
  status: string
  dueDate?: string
  cost?: string
  notes?: string
}) {
  const user = await getUser()

  // Guard: Only full managers can log maintenance items
  if (!user || user.position !== 'manager') {
    return { success: false, error: 'Unauthorized: Only managers can add maintenance items.' }
  }

  if (!formData.vehicleId || !formData.item) {
    return { success: false, error: 'A vehicle and maintenance item are required.' }
  }

  try {
    const payload = await getPayload({ config: configPromise })

    await payload.create({
      collection: 'vehicle-maintenance',
      overrideAccess: true,
      data: {
        vehicle: formData.vehicleId,
        item: formData.item,
        status: (formData.status || 'needed') as 'needed' | 'scheduled' | 'completed',
        ...(formData.dueDate ? { dueDate: formData.dueDate } : {}),
        cost: formData.cost || '',
        notes: formData.notes || '',
        ...(formData.status === 'completed' ? { completedDate: new Date().toISOString() } : {}),
      },
    })

    revalidatePath('/dashboard/vehicles')
    return { success: true }
  } catch (err: any) {
    console.error('Failed to create maintenance item:', err)
    return { success: false, error: err.message || 'Failed to create maintenance item.' }
  }
}
