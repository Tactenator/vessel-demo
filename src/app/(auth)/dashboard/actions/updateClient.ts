'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getUser } from './_getUser'
import { revalidatePath } from 'next/cache'
import { formatPhoneNumberInput, isValidPhoneNumber } from '@/utilities/phone'

export async function updateClient(formData: FormData): Promise<void> {
  const user = await getUser()

  // Guard: Only managers can update client info
  if (!user || user.position !== 'manager') {
    throw new Error('Unauthorized: Manager permission required.')
  }

  const clientId = formData.get('clientId') as string
  if (!clientId) return

  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const fullName = formData.get('fullName') as string
  const email = formData.get('email') as string
  const phoneNumber = formData.get('phoneNumber') as string
  const address = formData.get('address') as string
  const zipCode = formData.get('zipCode') as string
  const notes = formData.get('notes') as string
  const picture = formData.get('picture') as File | null

  // Guard: Phone number must be exactly 10 digits
  if (!isValidPhoneNumber(phoneNumber)) {
    throw new Error('Phone number must be exactly 10 digits.')
  }

  // Guard: Client photo, if provided, must be an image
  if (picture && picture.size > 0 && !picture.type.startsWith('image/')) {
    throw new Error('Client photo must be an image file.')
  }

  const payload = await getPayload({ config: configPromise })

  try {
    let newPictureId: string | undefined

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
      newPictureId = String(mediaDoc.id)
    }

    let pictures: string[] | undefined

    if (newPictureId) {
      // depth: 0 keeps existing "pictures" values as plain IDs so they can
      // be fed straight back into the update payload, appending rather than
      // replacing what's already there.
      const existingClient = await payload.findByID({
        collection: 'clients',
        id: clientId,
        overrideAccess: true,
        depth: 0,
      })
      const existingPictures = Array.isArray(existingClient.pictures)
        ? existingClient.pictures.map((p) => String(p))
        : []
      pictures = [...existingPictures, newPictureId]
    }

    await payload.update({
      collection: 'clients',
      id: clientId,
      data: {
        ...(firstName ? { firstName } : {}),
        ...(lastName ? { lastName } : {}),
        fullName: fullName || `${firstName || ''} ${lastName || ''}`.trim(),
        ...(email ? { email } : {}),
        phoneNumber: formatPhoneNumberInput(phoneNumber),
        address: address || '',
        zipCode: zipCode || '',
        notes: notes || '',
        ...(pictures ? { pictures } : {}),
      },
    })

    revalidatePath('/dashboard/clients', 'page')
  } catch (err) {
    console.error('Failed to update client profile:', err)
    throw err
  }
}
