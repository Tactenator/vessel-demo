import type { CollectionConfig } from 'payload'

import { colorPickerField } from '@innovixx/payload-color-picker-field'

import { validatePasswordComplexity } from '../utilities/validatePasswordComplexity'

export const Drivers: CollectionConfig = {
  slug: 'drivers',
  admin: {
    useAsTitle: 'fullName',
  },
  auth: {
    loginWithUsername: {
      allowEmailLogin: false,
      requireEmail: false,
    },
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000, // 10 minutes
    tokenExpiration: 60 * 60 * 24, // 24 hours
  },
  fields: [
    {
      name: 'position',
      type: 'select',
      options: [
        { label: 'Manager', value: 'manager' },
        { label: 'Assistant', value: 'assistant' },
        { label: 'Driver', value: 'driver' },
      ],
    },
    {
      name: 'email',
      type: 'email',
      admin: {
        condition: () => false,
      },
    },
    {
      name: 'active',
      label: 'Active',
      type: 'checkbox',
      required: true,
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
      type: 'text',
      required: true,
    },
    {
      name: 'lastName',
      type: 'text',
      required: true,
    },
    {
      name: 'username',
      type: 'text',
      required: true,
    },
    {
      name: 'address',
      type: 'text',
      required: true,
    },
    {
      name: 'phoneNumber',
      type: 'text',
      required: true,
    },
    {
      name: 'jobs',
      type: 'relationship',
      label: 'Jobs',
      relationTo: 'jobs',
    },
    {
      name: 'messages',
      label: 'Messages',
      type: 'relationship',
      relationTo: 'messages',
    },
    // {
    //   name: 'tasks',
    //   label: 'Tasks',
    //   type: 'relationship',
    //   relationTo: 'tasks',
    // },
    colorPickerField({
      name: 'primaryColor',
      label: 'Primary Color',
      required: true,
      admin: {
        description: 'Choose a color for this driver',
      },
    }),
  ],
  hooks: {
    beforeValidate: [validatePasswordComplexity],
    beforeLogin: [
      ({ user }) => {
        if (user && user.active !== true) {
          throw new Error('This account is inactive and cannot log in.')
        }
        return user
      },
    ],
    beforeChange: [
      ({ data }) => {
        // Ensure we don't accidentally overwrite or drop auth fields
        const newData = { ...data }
        newData.fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim()
        return newData
      },
    ],
  },
}
