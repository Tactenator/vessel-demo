'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getUser } from './_getUser'
import { revalidatePath } from 'next/cache'
import type { Job } from '@/payload-types'
import { zonedTimeToUtcIso } from '@/utilities/timezone'

type JobStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'
type EquipmentNeeded = NonNullable<Job['equipmentNeeded']>

export async function createJob(formData: FormData): Promise<void> {
  const user = await getUser()

  if (!user || user.position !== 'manager') {
    throw new Error('Unauthorized: Manager permission required to dispatch jobs.')
  }

  const client = formData.get('client') as string
  const pickupDriver = formData.get('pickupDriver') as string
  const dropoffDriver = (formData.get('dropoffDriver') as string) || pickupDriver
  const vehicle = formData.get('vehicle') as string

  // Cast status to the specific union type required by Payload schema
  const rawStatus = formData.get('status') as string
  const validStatuses: JobStatus[] = ['pending', 'in_progress', 'completed', 'cancelled']
  const status: JobStatus = validStatuses.includes(rawStatus as JobStatus)
    ? (rawStatus as JobStatus)
    : 'pending'

  const phoneNumber = formData.get('phoneNumber') as string
  // Inputs are "YYYY-MM-DDTHH:mm" wall-clock values with no timezone info, entered by
  // staff who mean Central time — convert to a real UTC instant before storing so
  // display (which formats in America/Chicago) shows the time that was actually typed.
  const startingDateAndTime = zonedTimeToUtcIso(formData.get('startingDateAndTime') as string)
  const endingDateAndTime = zonedTimeToUtcIso(formData.get('endingDateAndTime') as string)
  const noTime = formData.get('noTime') === 'on'
  const notes = formData.get('notes') as string

  // Parse multi-select equipment values. Falls back to "none" since the field
  // is required and the UI has no way to force at least one checkbox checked.
  const equipmentNeeded = formData.getAll('equipmentNeeded') as EquipmentNeeded
  if (equipmentNeeded.length === 0) {
    equipmentNeeded.push('none')
  }

  // Parse dynamic multi-stop route array
  const stopsCount = parseInt((formData.get('stopsCount') as string) || '0', 10)
  const stops: { location: string; note: string }[] = []

  for (let i = 0; i < stopsCount; i++) {
    const locId = formData.get(`stops[${i}][location]`) as string
    const stopNote = (formData.get(`stops[${i}][note]`) as string) || ''
    if (locId) {
      stops.push({ location: locId, note: stopNote })
    }
  }

  const payload = await getPayload({ config: configPromise })

  try {
    await payload.create({
      collection: 'jobs',
      data: {
        ...(client ? { client } : {}),
        ...(pickupDriver ? { pickupDriver } : {}),
        ...(dropoffDriver ? { dropoffDriver } : {}),
        ...(vehicle ? { vehicle } : {}),
        status,
        phoneNumber: phoneNumber || '',
        ...(startingDateAndTime ? { startingDateAndTime } : {}),
        ...(endingDateAndTime ? { endingDateAndTime } : {}),
        noTime,
        equipmentNeeded,
        notes: notes || '',
        createdBy: user.id,
        ...(stops.length > 0 ? { stops } : {}),
      },
    })

    revalidatePath('/dashboard', 'page')
    revalidatePath('/dashboard/jobs', 'page')
  } catch (err) {
    console.error('Failed to create job:', err)
    throw err
  }
}
