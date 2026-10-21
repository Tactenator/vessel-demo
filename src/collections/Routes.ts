import type { CollectionConfig } from 'payload'

// collections/Routes.ts
export const Routes: CollectionConfig = {
  slug: 'routes',
  admin: { useAsTitle: 'date' },
  fields: [
    {
      name: 'date',
      type: 'date',
      required: true,
      // Range-filtered on every load of the dispatch/routes page.
      index: true,
      admin: { date: { pickerAppearance: 'dayOnly' } },
    },
    { name: 'encodedPolyline', type: 'textarea' },
    {
      name: 'driver',
      type: 'relationship',
      relationTo: 'drivers',
      required: true,
    },
    {
      name: 'stops',
      type: 'array',
      fields: [
        {
          name: 'order',
          type: 'relationship',
          relationTo: 'orders',
          required: true,
        },
        {
          name: 'status',
          type: 'select',
          options: [
            { label: 'Pending', value: 'pending' },
            { label: 'Cancelled', value: 'cancelled' },
            { label: 'Delivered', value: 'delivered' },
          ],
          defaultValue: 'pending',
        },
        // Sequence is handled by the array index, but you can add a field if preferred
      ],
    },
  ],
}
