import type { CollectionConfig } from 'payload'
import { relationship } from 'payload/shared'

export const Locations: CollectionConfig = {
  slug: 'locations',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: () => true, // Allows anyone to view jobs
    update: () => true, // Allows anyone to update jobs
    create: () => true, // Allows anyone to create jobs
    delete: () => true, // Allows anyone to delete jobs
  },
  fields: [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      required: true,
    },
    {
      name: 'address',
      label: 'Address',
      type: 'text',
      required: true,
    },
    {
      name: 'phoneNumber',
      label: 'Phone Number',
      type: 'text',
      required: true,
    },
  ],
}
