// actions/recordCashPayment.ts
'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getUser } from './_getUser'
import { revalidatePath } from 'next/cache'

export async function recordCashPayment(formData: FormData) {
  const user = await getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const jobId = formData.get('jobId') as string
  const driverId = formData.get('driverId') as string
  const amount = parseFloat(formData.get('amount') as string)
  const notes = formData.get('notes') as string

  if (!jobId || isNaN(amount) || amount <= 0) {
    return { success: false, error: 'Please enter a valid payment amount.' }
  }

  const payload = await getPayload({ config: configPromise })

  try {
    await payload.create({
      collection: 'cash-invoices',
      data: {
        job: jobId,
        driver: driverId || user.id,
        amountReceived: amount,
        status: 'collected',
        notes: notes || 'Cash received on site',
      },
    })

    revalidatePath(`/dashboard/drives/${jobId}`)
    return { success: true }
  } catch (err) {
    console.error('Error logging cash payment:', err)
    return { success: false, error: 'Failed to record cash payment.' }
  }
}
