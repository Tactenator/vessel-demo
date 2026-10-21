import type { CollectionConfig } from 'payload'

export const Payments: CollectionConfig = {
  slug: 'payments',
  admin: {
    useAsTitle: '',
  },
  fields: [
    {
      name: 'vehicle',
      label: 'Vehicle',
      type: 'relationship',
      relationTo: 'vehicles',
    },
    {
      name: 'itemsPurchased',
      label: 'Items Purchased',
      type: 'text',
      required: true,
    },
    {
      name: 'date',
      label: 'date',
      type: 'date',
      required: true,
    },
    {
      name: 'price',
      label: 'Price',
      type: 'text',
      required: true,
    },
    {
      name: 'receipt',
      label: 'Receipt',
      type: 'upload',
      relationTo: 'media',
    },
  ],
}
