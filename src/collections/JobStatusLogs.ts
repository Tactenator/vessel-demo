import type { CollectionConfig } from 'payload'

export const JobStatusLogs: CollectionConfig = {
  slug: 'job-status-logs',
  admin: {
    useAsTitle: 'status',
    defaultColumns: ['job', 'status', 'createdAt'],
  },
  fields: [
    {
      name: 'job',
      type: 'relationship',
      relationTo: 'jobs',
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
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => ({
        ...data,
        timestamp: new Date(),
      }),
    ],
  },
}
