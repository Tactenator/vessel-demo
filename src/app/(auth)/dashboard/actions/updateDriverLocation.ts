'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getUser } from './_getUser'

export async function updateDriverLocation(formData: {
  jobId?: string
  lat: number
  lng: number
  accuracy?: number
  heading?: number
  speed?: number
}) {
  const user = await getUser()

  if (!user) {
    return { success: false, error: 'Unauthorized.' }
  }

  try {
    const payload = await getPayload({ config: configPromise })

    const existing = await payload.find({
      collection: 'driver-locations',
      where: { driver: { equals: user.id } },
      overrideAccess: true,
      depth: 0,
      limit: 1,
    })

    const data = {
      driver: user.id,
      ...(formData.jobId ? { job: formData.jobId } : {}),
      lat: formData.lat,
      lng: formData.lng,
      ...(formData.accuracy !== undefined ? { accuracy: formData.accuracy } : {}),
      ...(formData.heading !== undefined ? { heading: formData.heading } : {}),
      ...(formData.speed !== undefined ? { speed: formData.speed } : {}),
    }

    if (existing.docs[0]) {
      await payload.update({
        collection: 'driver-locations',
        id: existing.docs[0].id,
        overrideAccess: true,
        data,
      })
    } else {
      await payload.create({
        collection: 'driver-locations',
        overrideAccess: true,
        data,
      })
    }

    return { success: true }
  } catch (err: any) {
    console.error('Failed to update driver location:', err)
    return { success: false, error: err.message || 'Failed to update driver location.' }
  }
}
