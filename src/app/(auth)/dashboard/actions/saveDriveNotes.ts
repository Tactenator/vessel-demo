'use server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'

export async function saveDriveNotes(jobId: string, notes: string) {
  const payload = await getPayload({ config: configPromise })

  try {
    await payload.update({
      collection: 'jobs',
      id: jobId,
      data: {
        finalDriveNotes: notes,
      },
    })

    revalidatePath(`/jobs/${jobId}`)
    return { success: true }
  } catch (error) {
    console.error('Error saving drive notes:', error)
    return { success: false }
  }
}
