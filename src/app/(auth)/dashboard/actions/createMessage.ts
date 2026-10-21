'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getUser } from './_getUser'
import { revalidatePath } from 'next/cache'

type MessageType = 'General' | 'Urgent'

export async function createMessage(formData: FormData): Promise<void> {
  const user = await getUser()

  if (!user || user.position !== 'manager') {
    throw new Error('Unauthorized: Manager permission required to compose messages.')
  }

  const subject = formData.get('subject') as string
  const messageText = formData.get('message') as string
  const rawType = (formData.get('type') as string) || 'General'
  const sendToAll = formData.get('sendToAll') === 'on'
  const driverIds = formData.getAll('driver') as string[]

  const type: MessageType = rawType === 'Urgent' ? 'Urgent' : 'General'

  if (!subject || !messageText) {
    throw new Error('Subject and message content are required.')
  }

  const payload = await getPayload({ config: configPromise })

  try {
    await payload.create({
      collection: 'messages',
      data: {
        subject,
        message: messageText,
        type,
        sender: user.id,
        sendToAll,
        ...(sendToAll ? {} : { driver: driverIds }),
        readBy: [],
      },
    })

    revalidatePath('/dashboard/messages', 'page')
  } catch (err) {
    console.error('Failed to create message:', err)
    throw err
  }
}
