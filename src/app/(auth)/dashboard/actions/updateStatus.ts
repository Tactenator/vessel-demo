'use server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'

export async function updateStatus(
  jobId: string, // Keep this as a standard string identifier
  newStatus: 'pending' | 'in_progress' | 'completed' | 'cancelled',
) {
  const payload = await getPayload({ config: configPromise })

  // 🛑 REMOVED: const numericJobId = parseInt(jobId, 10)

  // 1. Update the Job status using the intact string ID
  await payload.update({
    collection: 'jobs',
    id: jobId,
    data: {
      status: newStatus,
    },
  })

  // 2. Create the log entry
  await payload.create({
    collection: 'job-status-logs',
    data: {
      job: jobId,
      status: newStatus,
    },
  })

  // 3. Match your route parameters structure
  revalidatePath(`/dashboard/drives/${jobId}`)
  revalidatePath(`/jobs/${jobId}`)
}
