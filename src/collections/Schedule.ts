import type { CollectionConfig } from 'payload'

export const Schedule: CollectionConfig = {
  slug: 'schedule',
  admin: {
    useAsTitle: 'shiftSummary',
    defaultColumns: ['driver', 'date', 'startTime', 'endTime'],
  },
  fields: [
    {
      name: 'shiftSummary',
      type: 'text',
      admin: {
        hidden: true, // Used under the hood to give the admin list a clean title
      },
    },
    {
      name: 'driver',
      label: 'Driver',
      type: 'relationship',
      relationTo: 'drivers',
      required: true, // One shift belongs to exactly one driver
    },
    {
      name: 'date',
      label: 'Date',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayOnly', // Simplifies the calendar to just the date
          displayFormat: 'MMMM dd, yyyy',
        },
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'startTime',
          label: 'Start Time',
          type: 'date',
          required: true,
          admin: {
            date: {
              pickerAppearance: 'timeOnly',
              timeFormat: 'h:mm a',
              timeIntervals: 30,
            },
          },
        },
        {
          name: 'endTime',
          label: 'End Time',
          type: 'date',
          required: true,
          admin: {
            date: {
              pickerAppearance: 'timeOnly',
              timeFormat: 'h:mm a',
              timeIntervals: 30,
            },
          },
        },
      ],
    },
    {
      name: 'onCall',
      label: 'On Call Duty',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Check this if the driver is on call instead of working a standard shift.',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        const shiftDate = data.date ? new Date(data.date).toISOString().split('T')[0] : ''
        return {
          ...data,
          shiftSummary: `Shift: ${shiftDate}`,
        }
      },
    ],
  },
}
