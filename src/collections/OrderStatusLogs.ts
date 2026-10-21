// collections/JobLogs.ts
import type { CollectionConfig } from 'payload'

export const OrderStatusLogs: CollectionConfig = {
  slug: 'order-status-logs',
  admin: {
    useAsTitle: 'status',
    defaultColumns: ['order', 'status', 'createdAt'],
  },
  fields: [
    {
      name: 'order',
      type: 'relationship',
      relationTo: 'orders',
      required: true,
      hasMany: false,
    },
    {
      name: 'status',
      type: 'text',
      required: true,
    },
    {
      name: 'timestamp',
      type: 'date',
      admin: {
        readOnly: true,
      },
      defaultValue: () => new RegExp(new Date().toISOString()),
    },
  ],
  // Optional: Automatically set timestamp on creation
  hooks: {
    beforeChange: [
      ({ data }) => ({
        ...data,
        timestamp: new Date(),
      }),
    ],
  },
}
