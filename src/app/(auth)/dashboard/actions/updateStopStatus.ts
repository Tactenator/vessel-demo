// app/actions/updateStopStatus.ts
'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'

export async function updateStopStatus({
  routeId,
  stopId,
  newStatus,
}: {
  routeId: string
  stopId: string
  newStatus: 'pending' | 'cancelled' | 'delivered'
}) {
  const payload = await getPayload({ config: configPromise })

  // 1. Fetch current route state
  const route = await payload.findByID({
    collection: 'routes',
    id: routeId,
    depth: 0,
  })

  if (!route.stops) return

  const updatedStops = route.stops.map((stop) => {
    if (stop.id === stopId) {
      return {
        ...stop,
        status: newStatus,
      }
    }
    return stop
  })

  // 3. Save it back down to the database
  await payload.update({
    collection: 'routes',
    id: routeId,
    data: {
      stops: updatedStops,
    },
  })

  // 4. Force Next.js to pull the fresh data state onto the UI
  revalidatePath('/dashboard/routes')
}
