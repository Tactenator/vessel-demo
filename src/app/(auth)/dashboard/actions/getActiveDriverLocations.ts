'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getUser } from './_getUser'

export interface ActiveDriverLocation {
  driverId: string
  driverName: string
  driverColor: string
  jobId: string
  clientName: string
  lat: number
  lng: number
  updatedAt: string
}

export async function getActiveDriverLocations(): Promise<ActiveDriverLocation[]> {
  const user = await getUser()

  // Guard: Only managers and assistants can view live driver locations
  if (!user || (user.position !== 'manager' && user.position !== 'assistant')) {
    return []
  }

  const payload = await getPayload({ config: configPromise })

  const activeJobs = await payload.find({
    collection: 'jobs',
    where: { status: { equals: 'in_progress' } },
    overrideAccess: true,
    // pickupDriver/dropoffDriver/client are direct relationships — depth 1 resolves
    // the firstName/lastName/color/fullName fields this endpoint actually reads.
    // This runs on every 20s tracking poll, so the depth-2 fan-out mattered.
    depth: 1,
    limit: 0,
  })

  if (activeJobs.docs.length === 0) return []

  // Map each currently-active driver (pickup or dropoff role) to their job/client
  const activeDriverContext = new Map<
    string,
    { driver: any; jobId: string; clientName: string }
  >()

  for (const job of activeJobs.docs) {
    const clientName =
      typeof job.client === 'object' ? job.client?.fullName || 'Client Trip' : 'Client Trip'

    for (const driverRef of [job.pickupDriver, job.dropoffDriver]) {
      if (driverRef && typeof driverRef === 'object') {
        activeDriverContext.set(String(driverRef.id), {
          driver: driverRef,
          jobId: String(job.id),
          clientName,
        })
      }
    }
  }

  if (activeDriverContext.size === 0) return []

  const locations = await payload.find({
    collection: 'driver-locations',
    where: { driver: { in: Array.from(activeDriverContext.keys()) } },
    overrideAccess: true,
    depth: 0,
    limit: 0,
  })

  return locations.docs
    .map((loc) => {
      const context = activeDriverContext.get(String(loc.driver))
      if (!context) return null

      const driverName =
        `${context.driver.firstName || ''} ${context.driver.lastName || ''}`.trim() ||
        'Driver'
      const driverColor =
        context.driver.primaryColor || context.driver.backgroundColor || '#334155'

      return {
        driverId: String(loc.driver),
        driverName,
        driverColor,
        jobId: context.jobId,
        clientName: context.clientName,
        lat: loc.lat,
        lng: loc.lng,
        updatedAt: loc.updatedAt,
      }
    })
    .filter((loc): loc is ActiveDriverLocation => loc !== null)
}
