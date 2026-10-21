import type { CollectionConfig } from 'payload'

export const OnCall: CollectionConfig = {
  slug: 'on-call',
  fields: [
    {
      name: 'driver',
      label: 'Driver',
      type: 'relationship',
      relationTo: 'drivers',
      hasMany: true,
    },
    {
      name: 'weekend',
      label: 'On Call (Weekend Day)',
      type: 'text',
    },
  ],
}
