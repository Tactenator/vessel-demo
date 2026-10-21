'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getUser } from './_getUser'
import { revalidatePath } from 'next/cache'

export async function updateOnCall(formData: FormData): Promise<void> {
  const user = await getUser()

  if (!user || user.position !== 'manager') {
    throw new Error('Unauthorized: Manager permission required.')
  }

  const onCallId = formData.get('onCallId') as string
  const weekend = formData.get('weekend') as string
  const driverIds = formData.getAll('driver') as string[]

  if (!weekend) {
    throw new Error('Weekend label is required.')
  }

  const payload = await getPayload({ config: configPromise })

  try {
    if (onCallId) {
      await payload.update({
        collection: 'on-call',
        id: onCallId,
        data: {
          weekend,
          driver: driverIds,
        },
      })
    } else {
      await payload.create({
        collection: 'on-call',
        data: {
          weekend,
          driver: driverIds,
        },
      })
    }

    revalidatePath('/dashboard/schedule', 'page')
  } catch (err) {
    console.error('Failed to update on-call roster:', err)
    throw err
  }
}
