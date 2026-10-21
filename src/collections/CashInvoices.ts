import type { CollectionConfig } from 'payload'

export const CashInvoices: CollectionConfig = {
  slug: 'cash-invoices',
  admin: {
    useAsTitle: 'receiptNumber',
    defaultColumns: ['receiptNumber', 'job', 'amountReceived', 'status', 'createdAt'],
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  hooks: {
    beforeChange: [
      // Auto-generate a unique receipt number if empty (e.g., CASH-1042)
      async ({ data, operation }) => {
        if (operation === 'create' && !data.receiptNumber) {
          const randomNum = Math.floor(1000 + Math.random() * 9000)
          data.receiptNumber = `CASH-${Date.now().toString().slice(-4)}${randomNum}`
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'receiptNumber',
      label: 'Receipt Number',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'job',
      label: 'Associated Job',
      type: 'relationship',
      relationTo: 'jobs',
      required: true,
      index: true,
    },
    {
      name: 'driver',
      label: 'Collected By Driver',
      type: 'relationship',
      relationTo: 'drivers',
      required: true,
    },
    {
      name: 'amountReceived',
      label: 'Amount Received ($)',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'status',
      label: 'Payment Status',
      type: 'select',
      defaultValue: 'collected',
      options: [
        { label: 'Collected by Driver', value: 'collected' },
        { label: 'Deposited / Reconciled', value: 'reconciled' },
        { label: 'Refunded', value: 'refunded' },
      ],
    },
    {
      name: 'notes',
      label: 'Payment Notes',
      type: 'textarea',
      admin: {
        placeholder: 'e.g., Exact change received, or tip included',
      },
    },
  ],
}
