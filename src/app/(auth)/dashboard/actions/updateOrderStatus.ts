// 'use server'
// import { getPayload } from 'payload'
// import configPromise from '@payload-config'
// import { revalidatePath } from 'next/cache'

// export async function updateStatus(orderId: string | number, newStatus: any) {
//   const payload = await getPayload({ config: configPromise })

//   const numericOrderId = typeof orderId === 'string' ? parseInt(orderId, 10) : orderId

//   if (isNaN(numericOrderId)) {
//     throw new Error(`Invalid order ID provided: ${orderId}`)
//   }

//   await payload.update({
//     collection: 'routes',
//     id: numericOrderId,
//     data: {
//       status: newStatus,
//     },
//   })

//   await payload.create({
//     collection: 'order-status-logs',
//     data: {
//       order: numericOrderId as any,
//       status: newStatus,
//     },
//   })

//   revalidatePath(`/orders`)
// }
