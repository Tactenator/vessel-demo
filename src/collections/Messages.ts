import type { CollectionConfig } from 'payload'

export const Messages: CollectionConfig = {
  slug: 'messages',
  admin: {
    useAsTitle: 'fullTitle',
  },
  fields: [
    {
      name: 'fullTitle',
      type: 'text',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'sender',
      label: 'Sender',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'sendToAll',
      label: 'Send To All Drivers',
      type: 'checkbox',
      defaultValue: false,
      // Filtered on every unread-count check (sidebar poll + badge).
      index: true,
    },
    {
      name: 'driver',
      label: 'Driver',
      type: 'relationship',
      relationTo: 'drivers',
      required: true,
      hasMany: true,
      // Filtered on every unread-count check (sidebar poll + badge).
      index: true,
      admin: {
        condition: (data) => !data.sendToAll,
      },
    },
    {
      name: 'subject',
      label: 'Subject',
      type: 'text',
      required: true,
    },
    {
      name: 'message',
      label: 'Message',
      type: 'textarea',
      required: true,
    },
    {
      name: 'type',
      label: 'Type of Message',
      type: 'select',
      options: [
        { label: 'General', value: 'General' },
        { label: 'Urgent', value: 'Urgent' },
      ],
      required: true,
    },
    {
      name: 'readBy',
      label: 'Read Receipts',
      type: 'relationship',
      relationTo: 'drivers', // Matches driver relationship
      hasMany: true,
      // Filtered on every unread-count check (sidebar poll + badge).
      index: true,
      admin: {
        description: 'Drivers who have marked this message as read',
      },
    },
  ],
}
