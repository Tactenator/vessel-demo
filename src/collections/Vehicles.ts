import type { CollectionConfig } from 'payload'

import { colorPickerField } from '@innovixx/payload-color-picker-field'

export const Vehicles: CollectionConfig = {
  slug: 'vehicles',
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
      name: 'name',
      label: 'Vehicle Name',
      type: 'text',
      admin: {
        description: 'Custom identifier, e.g. "Van 1" or "Truck A"',
      },
    },
    {
      name: 'vehicleYear',
      label: 'Vehicle Year',
      type: 'text',
      required: true,
    },
    {
      name: 'vehicleMake',
      label: 'Vehicle Make',
      type: 'text',
      required: true,
    },
    {
      name: 'vehicleModel',
      label: 'Vehicle Model',
      type: 'text',
      required: true,
    },
    {
      name: 'odometer',
      label: 'Odometer',
      type: 'text',
      required: true,
    },
    {
      name: 'needsGas',
      label: 'Needs Gas',
      type: 'checkbox',
    },
    {
      name: 'notes',
      label: 'Notes',
      type: 'textarea',
    },
    {
      name: 'vehicleDocuments',
      label: 'Registration and Other Docs',
      type: 'array',
      fields: [
        {
          name: 'file',
          label: 'File',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'fileNotes',
          label: 'File Notes',
          type: 'textarea',
          required: true,
        },
      ],
    },
    {
      name: 'documents',
      label: 'Documents Upload',
      type: 'array',
      fields: [
        {
          name: 'file',
          label: 'File',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'fileNotes',
          label: 'File Notes',
          type: 'textarea',
          required: true,
        },
      ],
    },
    colorPickerField({
      name: 'carColor',
      label: 'Car Color',
      required: true,
      admin: {
        description: 'Choose a color for this car',
      },
    }),
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Concatenate the fields: "2024 Toyota Camry"
        return {
          ...data,
          fullTitle:
            `${data.vehicleYear || ''} ${data.vehicleMake || ''} ${data.vehicleModel || ''}`.trim(),
        }
      },
    ],
  },
}
