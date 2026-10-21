import type { CollectionConfig } from 'payload'

const isValidPhoneNumber = (value: string) => /^\d{10}$/.test((value || '').replace(/\D/g, ''))

export const Clients: CollectionConfig = {
  slug: 'clients',
  admin: {
    useAsTitle: 'fullName',
  },

  fields: [
    {
      name: 'pictures',
      label: 'Client Picture',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
    },
    {
      name: 'fullName',
      type: 'text',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'firstName',
      label: 'First Name',
      type: 'text',
      required: true,
    },
    {
      name: 'lastName',
      label: 'Last Name',
      type: 'text',
      required: true,
    },
    {
      name: 'phoneNumber',
      type: 'text',
      required: true,
      validate: (value: string | null | undefined) => {
        if (!value) return 'Phone number is required.'
        if (!isValidPhoneNumber(value)) return 'Phone number must be exactly 10 digits.'
        return true
      },
    },
    {
      name: 'email',
      type: 'email',
      
    },
    {
      name: 'address',
      label: 'Address',
      type: 'text',
      required: true,
    },
    {
      name: 'zipCode',
      label: 'Zip Code',
      type: 'text',
    },
    {
      name: 'notes',
      label: 'Notes',
      type: 'textarea',
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        return {
          ...data,
          fullName: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
        }
      },
    ],
  },
}
