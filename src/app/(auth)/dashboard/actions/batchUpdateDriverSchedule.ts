'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getUser } from './_getUser'
import { revalidatePath } from 'next/cache'

export async function batchUpdateDriverSchedule(formData: FormData): Promise<void> {
  const user = await getUser()

  if (!user || user.position !== 'manager') {
    throw new Error('Unauthorized: Manager permission required.')
  }

  const driverId = formData.get('driverId') as string
  if (!driverId) throw new Error('Driver ID is required.')

  const payload = await getPayload({ config: configPromise })

  // Loop over each day index (0 through 6 for Mon - Sun)
  for (let i = 0; i < 7; i++) {
    const shiftId = formData.get(`shifts[${i}][id]`) as string
    const dateStr = formData.get(`shifts[${i}][date]`) as string
    const active = formData.get(`shifts[${i}][active]`) === 'on'
    const onCall = formData.get(`shifts[${i}][onCall]`) === 'on'
    const startTimeStr = formData.get(`shifts[${i}][startTime]`) as string
    const endTimeStr = formData.get(`shifts[${i}][endTime]`) as string
    const notes = (formData.get(`shifts[${i}][notes]`) as string) || ''

    if (!dateStr) continue

    const shiftDate = new Date(`${dateStr}T00:00:00.000Z`)

    if (active) {
      const startISO = startTimeStr
        ? new Date(`${dateStr}T${startTimeStr}:00.000Z`).toISOString()
        : shiftDate.toISOString()
      const endISO = endTimeStr
        ? new Date(`${dateStr}T${endTimeStr}:00.000Z`).toISOString()
        : shiftDate.toISOString()

      if (shiftId) {
        // Update existing shift
        await payload.update({
          collection: 'schedule',
          id: shiftId,
          data: {
            driver: driverId,
            date: shiftDate.toISOString(),
            startTime: startISO,
            endTime: endISO,
            onCall,
          },
        })
      } else {
        // Create new shift entry
        await payload.create({
          collection: 'schedule',
          data: {
            driver: driverId,
            date: shiftDate.toISOString(),
            startTime: startISO,
            endTime: endISO,
            onCall,
          },
        })
      }
    } else if (shiftId) {
      // If unchecked/inactive and shift exists -> delete shift
      await payload.delete({
        collection: 'schedule',
        id: shiftId,
      })
    }
  }

  revalidatePath('/dashboard/schedule', 'page')
}
