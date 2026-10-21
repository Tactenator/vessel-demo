'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getUser } from './_getUser'
import { revalidatePath } from 'next/cache'
import { formatPhoneNumberInput, isValidPhoneNumber } from '@/utilities/phone'

export async function updateDriver(formData: FormData): Promise<void> {
  const user = await getUser()

  if (!user || user.position !== 'manager') {
    throw new Error('Unauthorized: Manager permission required.')
  }

  const driverId = formData.get('driverId') as string
  if (!driverId) return

  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const email = formData.get('email') as string
  const address = formData.get('address') as string
  const phoneNumber = formData.get('phoneNumber') as string
  const position = formData.get('position') as 'manager' | 'driver'
  const primaryColor = formData.get('primaryColor') as string
  const active = formData.get('active') === 'on'

  if (phoneNumber && !isValidPhoneNumber(phoneNumber)) {
    throw new Error('Phone number must be exactly 10 digits.')
  }

  const payload = await getPayload({ config: configPromise })

  try {
    await payload.update({
      collection: 'drivers',
      id: driverId,
      data: {
        ...(firstName ? { firstName } : {}),
        ...(lastName ? { lastName } : {}),
        fullName: `${firstName || ''} ${lastName || ''}`.trim(),
        ...(email ? { email } : {}),
        ...(address ? { address } : {}),
        phoneNumber: phoneNumber ? formatPhoneNumberInput(phoneNumber) : '',
        ...(position ? { position } : {}),
        ...(primaryColor ? { primaryColor } : {}),
        active,
      },
    })

    revalidatePath('/dashboard/drivers', 'page')
  } catch (err) {
    console.error('Failed to update driver profile:', err)
    throw err
  }
}
