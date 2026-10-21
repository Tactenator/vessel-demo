'use server'

import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { Payload } from 'payload'
import { Driver } from '@/payload-types'

export async function getUser(): Promise<Driver | null> {
  const headers = await getHeaders()
  const payload: Payload = await getPayload({ config: await configPromise })
  const { user } = await payload.auth({ headers })

  if (user && user.collection === 'drivers') {
    return user as Driver
  }

  return null
}
