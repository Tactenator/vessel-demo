'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getUser } from './_getUser'
import { revalidatePath } from 'next/cache'
import { formatPhoneNumberInput, isValidPhoneNumber } from '@/utilities/phone'

export async function createDriver(formData: FormData) {
  const user = await getUser()

  // Guard: Only full managers can create drivers
  if (!user || user.position !== 'manager') {
    return { success: false, error: 'Unauthorized: Only managers can add drivers.' }
  }

  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const username = formData.get('username') as string
  const email = formData.get('email') as string
  const phoneNumber = formData.get('phoneNumber') as string
  const address = formData.get('address') as string
  const position = formData.get('position') as 'manager' | 'assistant' | 'driver'
  const primaryColor = formData.get('primaryColor') as string
  const password = formData.get('password') as string
  const active = formData.get('active') === 'on'

  // Guard: Phone number must be exactly 10 digits
  if (!isValidPhoneNumber(phoneNumber)) {
    return { success: false, error: 'Phone number must be exactly 10 digits.' }
  }

  try {
    const payload = await getPayload({ config: configPromise })

    const newDriver = await payload.create({
      collection: 'drivers',
      overrideAccess: true,
      data: {
        firstName,
        lastName,
        username,
        email: email || undefined,
        phoneNumber: formatPhoneNumberInput(phoneNumber),
        address,
        position: position || 'driver',
        primaryColor: primaryColor || '#41a6f4',
        password,
        active,
      },
    })

    revalidatePath('/dashboard/drivers')
    return { success: true, driver: newDriver }
  } catch (err: any) {
    console.error('Failed to create driver:', err)
    return { success: false, error: err.message || 'Failed to create driver.' }
  }
}
