'use server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'

export async function saveDriveTime(jobId: string, totalSeconds: number) {
  const payload = await getPayload({ config: configPromise })

  try {
    await payload.update({
      collection: 'jobs',
      id: jobId, // This expects a string
      data: {
        // Stringify the number if your database field type is text/string
        driveTime: String(totalSeconds),
        status: 'completed',
      },
    })

    revalidatePath(`/dashboard/drives/${jobId}`)
    return { success: true }
  } catch (error) {
    console.error('Failed to save drive time:', error)
    return { success: false, error: 'Database update failed' }
  }
}
