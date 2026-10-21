import type { CollectionConfig } from 'payload'

export const DriverLocations: CollectionConfig = {
  slug: 'driver-locations',
  admin: {
    useAsTitle: 'driver',
  },
  fields: [
    {
      name: 'driver',
      label: 'Driver',
      type: 'relationship',
      relationTo: 'drivers',
      required: true,
      unique: true,
    },
    {
      name: 'job',
      label: 'Active Job',
      type: 'relationship',
      relationTo: 'jobs',
    },
    {
      name: 'lat',
      label: 'Latitude',
      type: 'number',
      required: true,
    },
    {
      name: 'lng',
      label: 'Longitude',
      type: 'number',
      required: true,
    },
    {
      name: 'accuracy',
      label: 'Accuracy (meters)',
      type: 'number',
    },
    {
      name: 'heading',
      label: 'Heading',
      type: 'number',
    },
    {
      name: 'speed',
      label: 'Speed (m/s)',
      type: 'number',
    },
  ],
}
