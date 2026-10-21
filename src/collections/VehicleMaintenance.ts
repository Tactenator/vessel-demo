import type { CollectionConfig } from 'payload'

export const VehicleMaintenance: CollectionConfig = {
  slug: 'vehicle-maintenance',
  admin: {
    useAsTitle: 'item',
  },
  fields: [
    {
      name: 'vehicle',
      label: 'Vehicle',
      type: 'relationship',
      relationTo: 'vehicles',
      required: true,
    },
    {
      name: 'item',
      label: 'Maintenance Item',
      type: 'text',
      required: true,
      admin: {
        description: 'e.g. Oil Change, Tire Rotation, State Inspection',
      },
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      defaultValue: 'needed',
      options: [
        { label: 'Needed', value: 'needed' },
        { label: 'Scheduled', value: 'scheduled' },
        { label: 'Completed', value: 'completed' },
      ],
    },
    {
      name: 'dueDate',
      label: 'Due Date',
      type: 'date',
    },
    {
      name: 'completedDate',
      label: 'Completed Date',
      type: 'date',
    },
    {
      name: 'cost',
      label: 'Cost ($)',
      type: 'text',
    },
    {
      name: 'notes',
      label: 'Notes',
      type: 'textarea',
    },
    {
      name: 'createdBy',
      label: 'Logged By',
      type: 'relationship',
      relationTo: 'drivers',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [
          ({ req, value, operation }) => {
            if (operation === 'create' && req.user) {
              return req.user.id
            }
            return value
          },
        ],
      },
    },
  ],
}
