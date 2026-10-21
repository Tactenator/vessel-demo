'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getUser } from './_getUser'
import { revalidatePath } from 'next/cache'
import { formatPhoneNumberInput, isValidPhoneNumber } from '@/utilities/phone'

export async function createClient(formData: FormData) {
  const user = await getUser()

  // Guard: Only full managers can create clients
  if (!user || user.position !== 'manager') {
    return { success: false, error: 'Unauthorized: Only managers can add clients.' }
  }

  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const phoneNumber = formData.get('phoneNumber') as string
  const email = formData.get('email') as string
  const address = formData.get('address') as string
  const zipCode = formData.get('zipCode') as string
  const notes = formData.get('notes') as string
  const picture = formData.get('picture') as File | null

  // Guard: Phone number must be exactly 10 digits
  if (!isValidPhoneNumber(phoneNumber)) {
    return { success: false, error: 'Phone number must be exactly 10 digits.' }
  }

  // Guard: Client photo, if provided, must be an image
  if (picture && picture.size > 0 && !picture.type.startsWith('image/')) {
    return { success: false, error: 'Client photo must be an image file.' }
  }

  try {
    const payload = await getPayload({ config: configPromise })

    let pictureId: string | undefined

    if (picture && picture.size > 0) {
      const buffer = Buffer.from(await picture.arrayBuffer())
      const mediaDoc = await payload.create({
        collection: 'media',
        overrideAccess: true,
        data: {},
        file: {
          data: buffer,
          name: picture.name,
          size: picture.size,
          mimetype: picture.type,
        },
      })
      pictureId = String(mediaDoc.id)
    }

    const newClient = await payload.create({
      collection: 'clients',
      overrideAccess: true,
      data: {
        firstName,
        lastName,
        phoneNumber: formatPhoneNumberInput(phoneNumber),
        email,
        address,
        zipCode: zipCode || '',
        notes: notes || '',
        ...(pictureId ? { pictures: [pictureId] } : {}),
      },
    })

    revalidatePath('/dashboard/clients')
    return { success: true, client: newClient }
  } catch (err: any) {
    console.error('Failed to create client:', err)
    return { success: false, error: err.message || 'Failed to create client.' }
  }
}
