'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getUser } from './_getUser'

export async function getUnreadCount(): Promise<number> {
  const user = await getUser()
  if (!user) return 0

  const payload = await getPayload({ config: configPromise })

  try {
    const result = await payload.count({
      collection: 'messages',
      where: {
        and: [
          {
            or: [{ sendToAll: { equals: true } }, { driver: { contains: user.id } }],
          },
          {
            readBy: {
              not_equals: user.id,
            },
          },
        ],
      },
      overrideAccess: true,
    })

    return result.totalDocs
  } catch (err) {
    console.error('Error fetching unread message count:', err)
    return 0
  }
}
