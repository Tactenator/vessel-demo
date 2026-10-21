import type { CollectionConfig } from 'payload'

import { validatePasswordComplexity } from '../utilities/validatePasswordComplexity'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'fullName',
  },
  auth: {
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000, // 10 minutes
  },
  fields: [
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
      name: 'phoneNumer',
      label: 'Phone Number',
      type: 'text',
      required: true,
    },
  ],
  hooks: {
    beforeValidate: [validatePasswordComplexity],
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
