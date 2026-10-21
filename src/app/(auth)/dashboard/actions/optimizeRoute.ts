// app/actions/optimizeRoute.ts
'use server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'
import { Order } from '@/payload-types' // Import the Order type from your generated types

// Type guard helper to check if a relation is fully populated
function isOrderObject(order: string | Order | undefined | null): order is Order {
  return typeof order === 'object' && order !== null && 'location' in order
}

export async function generateOmahaRoute(routeId: string) {
  const payload = await getPayload({ config: configPromise })
  const route = await payload.findByID({ collection: 'routes', id: routeId, depth: 2 })

  if (!route.stops || route.stops.length === 0) return

  // Stops with unpopulated order data can't be routed — exclude them, but keep this
  // as the single source of truth for both the request we send to Google and for
  // mapping its response back afterward, so the two stay positionally aligned.
  const routableStops = route.stops.filter((stop) => isOrderObject(stop.order))
  if (routableStops.length < route.stops.length) {
    console.error(
      `${route.stops.length - routableStops.length} stop(s) on route ${routeId} have unpopulated order data and were excluded from routing.`,
    )
  }

  if (routableStops.length < 2) {
    console.error(`Route ${routeId} needs at least 2 stops with valid location data to route.`)
    return
  }

  // One-way route: start at the first stop, end at the last — no loop back to the
  // start. Only the stops in between get reordered for the shortest path.
  const originStop = routableStops[0]
  const destinationStop = routableStops[routableStops.length - 1]
  const middleStops = routableStops.slice(1, -1)

  const locationOf = (stop: (typeof routableStops)[number]) => {
    const order = stop.order as Order
    return {
      location: {
        latLng: {
          latitude: order.location?.lat,
          longitude: order.location?.lng,
        },
      },
    }
  }

  const origin = locationOf(originStop)
  const destination = locationOf(destinationStop)
  const intermediates = middleStops.map(locationOf)

  // 2. Call Google Routes API with the 'Optimize' flag
  // NOTE: uses the server-side GOOGLE_MAPS_API_KEY (not the NEXT_PUBLIC_ browser key),
  // since a browser key with HTTP-referrer restrictions will be rejected on server-to-server calls.
  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    throw new Error('GOOGLE_MAPS_API_KEY is not set. Route optimization cannot reach Google.')
  }

  const response = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask':
        'routes.polyline.encodedPolyline,routes.optimizedIntermediateWaypointIndex',
    },
    body: JSON.stringify({
      origin,
      destination,
      intermediates,
      travelMode: 'DRIVE',
      optimizeWaypointOrder: true,
    }),
  })

  const result = await response.json()

  if (!response.ok || result.error) {
    console.error(
      'Google Routes API request failed:',
      response.status,
      JSON.stringify(result.error || result),
    )
    throw new Error(
      result.error?.message || `Google Routes API request failed with status ${response.status}`,
    )
  }

  if (result.routes && result.routes[0]) {
    const polyline = result.routes[0].polyline.encodedPolyline
    const newOrderIndices = result.routes[0].optimizedIntermediateWaypointIndex

    // newOrderIndices are positions within `intermediates`/`middleStops` as sent to
    // Google — NOT positions within the original route.stops. Mapping back through
    // route.stops directly (as this used to) breaks as soon as any stop was excluded
    // above, shifting every index after it and silently duplicating one stop while
    // dropping another.
    //
    // Google returns a sentinel `-1` (not a real index) for optimizedIntermediateWaypointIndex
    // when there's nothing meaningful to reorder — confirmed by testing a single-intermediate
    // route, which came back as [-1]. `middleStops[-1]` is `undefined` in JS, so trusting
    // this blindly silently dropped every stop but the first. Only trust it when every entry
    // is a genuine, in-range index; otherwise keep the stops in their original order.
    const isValidPermutation =
      Array.isArray(newOrderIndices) &&
      newOrderIndices.length === middleStops.length &&
      newOrderIndices.every((idx: number) => idx >= 0 && idx < middleStops.length)

    const orderedMiddle = isValidPermutation
      ? newOrderIndices.map((idx: number) => middleStops[idx])
      : middleStops

    const optimizedStops = [originStop, ...orderedMiddle, destinationStop]

    // 3. Update the Route record
    await payload.update({
      collection: 'routes',
      id: routeId,
      data: {
        encodedPolyline: polyline,
        stops: optimizedStops.map((s) => ({
          order: typeof s.order === 'object' ? s.order.id : s.order,
        })),
      },
    })

    revalidatePath('/dashboard/routes')
  } else {
    console.error('Google Routes API returned no routes for this stop list:', result)
    throw new Error('Google Routes API returned no route. Check that all stops have valid coordinates.')
  }
}
