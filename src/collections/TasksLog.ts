// TaskLogs.ts
import type { CollectionConfig } from 'payload'

export const TaskLogs: CollectionConfig = {
  slug: 'task-logs',
  admin: {
    useAsTitle: '',
  },
  fields: [
    {
      name: 'driver',
      type: 'relationship',
      relationTo: 'drivers',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'dateCompleted',
      type: 'date',
      defaultValue: () => new Date(),
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'tasksPerformed',
      label: 'Tasks Performed',
      type: 'text',
      hasMany: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'End of Day Notes',
      admin: {
        readOnly: true,
      },
    },
  ],
}
