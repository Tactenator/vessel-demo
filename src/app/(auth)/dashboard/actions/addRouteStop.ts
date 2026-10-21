'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getUser } from './_getUser'
import { revalidatePath } from 'next/cache'

export async function addRouteStop(formData: {
  routeId: string
  customerName: string
  location: string
}) {
  const user = await getUser()

  if (!user || user.position !== 'manager') {
    return { success: false, error: 'Unauthorized: Only managers can add stops.' }
  }

  if (!formData.routeId || !formData.customerName || !formData.location) {
    return { success: false, error: 'Customer name and location are required.' }
  }

  try {
    const payload = await getPayload({ config: configPromise })

    const order = await payload.create({
      collection: 'orders',
      overrideAccess: true,
      data: {
        customerName: formData.customerName,
        address: formData.location,
      },
    })

    const route = await payload.findByID({
      collection: 'routes',
      id: formData.routeId,
      depth: 0,
    })

    const updatedStops = [...(route.stops || []), { order: order.id, status: 'pending' as const }]

    await payload.update({
      collection: 'routes',
      id: formData.routeId,
      overrideAccess: true,
      data: {
        stops: updatedStops,
      },
    })

    revalidatePath('/dashboard/routes')
    return { success: true }
  } catch (err: any) {
    console.error('Failed to add stop to route:', err)
    return { success: false, error: err.message || 'Failed to add stop.' }
  }
}
