'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getUser } from './_getUser'
import { revalidatePath } from 'next/cache'
import type { Job } from '@/payload-types'
import { zonedTimeToUtcIso } from '@/utilities/timezone'

type JobStatus = Job['status']
type EquipmentNeeded = NonNullable<Job['equipmentNeeded']>

const JOB_STATUSES: readonly JobStatus[] = ['pending', 'in_progress', 'completed', 'cancelled']

const isJobStatus = (value: unknown): value is JobStatus =>
  typeof value === 'string' && (JOB_STATUSES as readonly string[]).includes(value)

export async function updateJob(formData: FormData): Promise<void> {
  const user = await getUser()

  // Guard: Only managers can edit jobs
  if (!user || user.position !== 'manager') {
    throw new Error('Unauthorized: Manager position required.')
  }

  const jobId = formData.get('jobId') as string
  if (!jobId) return

  const client = formData.get('client') as string
  const pickupDriver = formData.get('pickupDriver') as string
  const dropoffDriver = (formData.get('dropoffDriver') as string) || pickupDriver
  const vehicle = formData.get('vehicle') as string
  const rawStatus = formData.get('status')
  if (rawStatus && !isJobStatus(rawStatus)) {
    throw new Error(`Invalid job status: ${String(rawStatus)}`)
  }
  const status: JobStatus | null = isJobStatus(rawStatus) ? rawStatus : null
  const phoneNumber = formData.get('phoneNumber') as string
  // See createJob.ts — inputs are naive "YYYY-MM-DDTHH:mm" wall-clock values meant as
  // Central time; convert to a real UTC instant before storing.
  const startingDateAndTime = zonedTimeToUtcIso(formData.get('startingDateAndTime') as string)
  const endingDateAndTime = zonedTimeToUtcIso(formData.get('endingDateAndTime') as string)
  const noTime = formData.get('noTime') === 'on'
  const notes = formData.get('notes') as string
  const finalDriveNotes = formData.get('finalDriveNotes') as string
  const driveTime = formData.get('driveTime') as string

  // Parse multi-select equipment values. Falls back to "none" since the field
  // is required and the UI has no way to force at least one checkbox checked.
  const equipmentNeeded = formData.getAll('equipmentNeeded') as EquipmentNeeded
  if (equipmentNeeded.length === 0) {
    equipmentNeeded.push('none')
  }

  // Parse multi-stop array
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
    await payload.update({
      collection: 'jobs',
      id: jobId,
      data: {
        ...(client ? { client } : {}),
        ...(pickupDriver ? { pickupDriver } : { pickupDriver: null }),
        ...(dropoffDriver ? { dropoffDriver } : { dropoffDriver: null }),
        ...(vehicle ? { vehicle } : { vehicle: null }),
        ...(status ? { status } : {}),
        phoneNumber: phoneNumber || '',
        ...(startingDateAndTime ? { startingDateAndTime } : {}),
        ...(endingDateAndTime ? { endingDateAndTime } : {}),
        noTime,
        equipmentNeeded,
        notes: notes || '',
        finalDriveNotes: finalDriveNotes || '',
        driveTime: driveTime || '',
        ...(stops.length > 0 ? { stops } : {}),
      },
    })

    revalidatePath(`/dashboard/drives/${jobId}`, 'page')
    revalidatePath('/dashboard/jobs', 'page')
    revalidatePath('/dashboard', 'page')
  } catch (err) {
    console.error('Error updating job:', err)
    throw err
  }
}
