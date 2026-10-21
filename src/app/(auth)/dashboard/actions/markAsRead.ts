// actions/markAsRead.ts
'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getUser } from './_getUser'
import { revalidatePath } from 'next/cache'

export async function markAsRead(messageId: string) {
  const user = await getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const payload = await getPayload({ config: configPromise })

  try {
    // 1. Fetch current message to inspect existing read receipts
    const existingMsg = await payload.findByID({
      collection: 'messages',
      id: messageId,
      depth: 0,
    })

    // Normalizing existing readBy array IDs
    const existingReadBy: string[] = (existingMsg.readBy || []).map((item: any) =>
      typeof item === 'object' ? item.id : String(item),
    )

    // 2. If user has not marked as read yet, append their ID
    if (!existingReadBy.includes(user.id)) {
      await payload.update({
        collection: 'messages',
        id: messageId,
        data: {
          readBy: [...existingReadBy, user.id],
        },
      })
    }

    revalidatePath('/messages')
    return { success: true }
  } catch (error) {
    console.error('Error marking message as read:', error)
    return { success: false, error: 'Failed to update read status' }
  }
}
