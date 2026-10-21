'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getUser } from './_getUser'
import { revalidatePath } from 'next/cache'

export async function uploadVehicleDocument(formData: FormData) {
  const user = await getUser()

  // Guard: Only full managers can upload vehicle documents
  if (!user || user.position !== 'manager') {
    return { success: false, error: 'Unauthorized: Only managers can upload vehicle documents.' }
  }

  const vehicleId = formData.get('vehicleId') as string
  const fileNotes = formData.get('fileNotes') as string
  const file = formData.get('file') as File | null

  if (!vehicleId) {
    return { success: false, error: 'Missing vehicle.' }
  }
  if (!file || file.size === 0) {
    return { success: false, error: 'Please choose a file to upload.' }
  }
  if (!fileNotes || !fileNotes.trim()) {
    return { success: false, error: 'Please describe the document (e.g. Registration, Insurance).' }
  }

  try {
    const payload = await getPayload({ config: configPromise })

    const buffer = Buffer.from(await file.arrayBuffer())
    const mediaDoc = await payload.create({
      collection: 'media',
      overrideAccess: true,
      data: {},
      file: {
        data: buffer,
        name: file.name,
        size: file.size,
        mimetype: file.type,
      },
    })

    // depth: 0 keeps existing `documents[].file` values as plain IDs so they
    // can be fed straight back into the update payload below.
    const vehicle = await payload.findByID({
      collection: 'vehicles',
      id: vehicleId,
      overrideAccess: true,
      depth: 0,
    })

    const existingDocuments = Array.isArray(vehicle.documents)
      ? vehicle.documents.map((d) => ({ file: d.file, fileNotes: d.fileNotes }))
      : []

    await payload.update({
      collection: 'vehicles',
      id: vehicleId,
      overrideAccess: true,
      data: {
        documents: [...existingDocuments, { file: String(mediaDoc.id), fileNotes }],
      },
    })

    revalidatePath('/dashboard/vehicles')
    return { success: true }
  } catch (err: any) {
    console.error('Failed to upload vehicle document:', err)
    return { success: false, error: err.message || 'Failed to upload vehicle document.' }
  }
}
