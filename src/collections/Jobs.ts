import type { CollectionConfig } from 'payload'

export const Jobs: CollectionConfig = {
  slug: 'jobs',
  admin: {
    useAsTitle: 'client',
  },
  access: {
    read: () => true,
    update: () => true,
    create: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: 'createdBy',
      label: 'Created By',
      type: 'relationship',
      relationTo: 'users',
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
    {
      name: 'noTime',
      label: 'Flexible Schedule (No Specific Time Required)',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description:
          'Check this if the client is flexible on exact pickup/dropoff hours for the day.',
      },
    },
    {
      name: 'startingDateAndTime',
      label: 'Starting Date',
      type: 'date',
      // Sorted/range-filtered on the home dashboard, jobs table, and routes page.
      index: true,
      admin: {
        date: {
          // Switches picker appearance based on whether noTime is checked
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'endingDateAndTime',
      label: 'Ending Date',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'client',
      label: 'Client',
      type: 'relationship',
      relationTo: 'clients',
    },
    {
      name: 'pickupDriver',
      label: 'Pickup Driver',
      type: 'relationship',
      relationTo: 'drivers',
      admin: {
        description: 'Driver responsible for picking up the client.',
      },
    },
    {
      name: 'dropoffDriver',
      label: 'Dropoff Driver',
      type: 'relationship',
      relationTo: 'drivers',
      admin: {
        description: 'Driver responsible for dropping off the client.',
      },
    },

    // Multi-stop Location Array Field
    {
      name: 'stops',
      label: 'Route Stops',
      type: 'array',
      minRows: 2,
      labels: {
        singular: 'Stop',
        plural: 'Stops',
      },
      fields: [
        {
          name: 'location',
          label: 'Location',
          type: 'relationship',
          relationTo: 'locations',
          required: true,
        },
        {
          name: 'note',
          label: 'Stop Note (e.g. Pickup prescription, Waypoint)',
          type: 'text',
        },
      ],
    },

    // Legacy fallback fields
    {
      name: 'startingLocation',
      label: 'Starting Location (Legacy)',
      type: 'relationship',
      relationTo: 'locations',
      admin: { hidden: true },
    },
    {
      name: 'endingLocation',
      label: 'Ending Location (Legacy)',
      type: 'relationship',
      relationTo: 'locations',
      admin: { hidden: true },
    },
    {
      name: 'driver',
      label: 'Driver (Legacy)',
      type: 'relationship',
      relationTo: 'drivers',
      admin: { hidden: true },
    },

    {
      name: 'phoneNumber',
      type: 'text',
      required: true,
    },
    {
      name: 'vehicle',
      type: 'relationship',
      label: 'Vehicle',
      relationTo: 'vehicles',
    },
    {
      name: 'notes',
      label: 'Notes',
      type: 'textarea',
    },
    {
      name: 'finalDriveNotes',
      label: 'Final Notes',
      type: 'text',
    },
    // Inside Jobs.ts fields array:
    {
      name: 'cashInvoices',
      type: 'join',
      collection: 'cash-invoices',
      on: 'job',
      admin: {
        description: 'Cash payment records logged for this job',
      },
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      // Filtered on every live-tracking poll (getActiveDriverLocations) and the jobs table.
      index: true,
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'In Progress', value: 'in_progress' },
        { label: 'Completed', value: 'completed' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
    },
    {
      name: 'equipmentNeeded',
      label: 'Equipment Needed',
      type: 'select',
      required: true,
      hasMany: true,
      options: [
        { label: 'None', value: 'none' },
        { label: 'Wheelchair', value: 'wheelchair' },
        { label: 'Gloves', value: 'gloves' },
      ],
    },
    {
      name: 'history',
      type: 'join',
      collection: 'job-status-logs',
      on: 'job',
    },
    {
      name: 'driveTime',
      label: 'Drive Time',
      type: 'text',
    },
  ],
}
