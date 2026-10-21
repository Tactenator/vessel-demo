'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getUser } from './_getUser'
import { revalidatePath } from 'next/cache'

export async function createRoute(formData: {
  date: string
  driver: string
  stops: { customerName: string; location: string }[]
}) {
  const user = await getUser()

  if (!user || user.position !== 'manager') {
    return { success: false, error: 'Unauthorized: Only managers can create routes.' }
  }

  if (!formData.date || !formData.driver) {
    return { success: false, error: 'Date and driver are required.' }
  }

  const validStops = formData.stops.filter((s) => s.customerName && s.location)

  try {
    const payload = await getPayload({ config: configPromise })

    // Create an Order for each stop first — the Orders collection geocodes
    // the linked location automatically via its beforeChange hook.
    const orders = await Promise.all(
      validStops.map((stop) =>
        payload.create({
          collection: 'orders',
          overrideAccess: true,
          data: {
            customerName: stop.customerName,
            address: stop.location,
          },
        }),
      ),
    )

    const newRoute = await payload.create({
      collection: 'routes',
      overrideAccess: true,
      data: {
        date: formData.date,
        driver: formData.driver,
        stops: orders.map((order) => ({ order: order.id, status: 'pending' as const })),
      },
    })

    revalidatePath('/dashboard/routes')
    return { success: true, route: newRoute }
  } catch (err: any) {
    console.error('Failed to create route:', err)
    return { success: false, error: err.message || 'Failed to create route.' }
  }
}
