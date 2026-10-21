'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getUser } from './_getUser'
import { revalidatePath } from 'next/cache'

export async function updateShift(formData: FormData): Promise<void> {
  const user = await getUser()

  if (!user || user.position !== 'manager') {
    throw new Error('Unauthorized: Manager permission required.')
  }

  const shiftId = formData.get('shiftId') as string
  const driver = formData.get('driver') as string
  const dateStr = formData.get('date') as string
  const startTimeStr = formData.get('startTime') as string
  const endTimeStr = formData.get('endTime') as string
  const onCall = formData.get('onCall') === 'on'
  const notes = formData.get('notes') as string

  if (!driver || !dateStr) {
    throw new Error('Driver and Date are required.')
  }

  // ISO Timestamps construction
  const shiftDate = new Date(`${dateStr}T00:00:00.000Z`)
  const startISO = startTimeStr
    ? new Date(`${dateStr}T${startTimeStr}:00.000Z`).toISOString()
    : shiftDate.toISOString()
  const endISO = endTimeStr
    ? new Date(`${dateStr}T${endTimeStr}:00.000Z`).toISOString()
    : shiftDate.toISOString()

  const payload = await getPayload({ config: configPromise })

  try {
    if (shiftId) {
      // Update existing shift
      await payload.update({
        collection: 'schedule',
        id: shiftId,
        data: {
          driver,
          date: shiftDate.toISOString(),
          startTime: startISO,
          endTime: endISO,
          onCall,
          ...(notes ? { notes } : {}),
        },
      })
    } else {
      // Create new shift entry
      await payload.create({
        collection: 'schedule',
        data: {
          driver,
          date: shiftDate.toISOString(),
          startTime: startISO,
          endTime: endISO,
          onCall,
          ...(notes ? { notes } : {}),
        },
      })
    }

    revalidatePath('/dashboard/schedule', 'page')
  } catch (err) {
    console.error('Failed to update/create shift:', err)
    throw err
  }
}
