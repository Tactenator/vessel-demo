import type { CollectionConfig } from 'payload'

export const Tasks: CollectionConfig = {
  slug: 'tasks',
  admin: {
    useAsTitle: '',
  },
  fields: [
    {
      name: 'task',
      label: 'Task',
      type: 'array',
      fields: [
        {
          name: 'taskName',
          label: 'Task Name',
          type: 'text',
          required: true,
        },
        {
          name: 'taskDescription',
          label: 'Task Description',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
}
