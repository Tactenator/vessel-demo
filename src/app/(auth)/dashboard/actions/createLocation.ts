'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getUser } from './_getUser'
import { revalidatePath } from 'next/cache'
import { formatPhoneNumberInput, isValidPhoneNumber } from '@/utilities/phone'

export async function createLocation(formData: {
  name: string
  address: string
  phoneNumber: string
}) {
  const user = await getUser()

  // Guard: Only full managers can create locations
  if (!user || user.position !== 'manager') {
    return { success: false, error: 'Unauthorized: Only managers can add locations.' }
  }

  // Guard: Phone number must be exactly 10 digits
  if (!isValidPhoneNumber(formData.phoneNumber)) {
    return { success: false, error: 'Phone number must be exactly 10 digits.' }
  }

  try {
    const payload = await getPayload({ config: configPromise })

    const newLocation = await payload.create({
      collection: 'locations',
      overrideAccess: true,
      data: {
        name: formData.name,
        address: formData.address,
        phoneNumber: formatPhoneNumberInput(formData.phoneNumber),
      },
    })

    revalidatePath('/dashboard/locations')
    return { success: true, location: newLocation }
  } catch (err: any) {
    console.error('Failed to create location:', err)
    return { success: false, error: err.message || 'Failed to create location.' }
  }
}
