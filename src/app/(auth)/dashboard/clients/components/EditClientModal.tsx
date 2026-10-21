'use client'

import { useState, useRef, Fragment } from 'react'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { PencilSquareIcon, UserIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { updateClient } from '../../actions/updateClient'
import { formatPhoneNumberInput, isValidPhoneNumber } from '@/utilities/phone'

export default function EditClientModal({ client }: { client: any }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [phoneNumber, setPhoneNumber] = useState(client?.phoneNumber || '')
  const [picturePreview, setPicturePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(formatPhoneNumberInput(e.target.value))
  }

  const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (picturePreview) URL.revokeObjectURL(picturePreview)
    setPicturePreview(file ? URL.createObjectURL(file) : null)
  }

  const resetPicture = () => {
    if (picturePreview) URL.revokeObjectURL(picturePreview)
    setPicturePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSubmit(formData: FormData) {
    setErrorMsg('')

    if (!isValidPhoneNumber(phoneNumber)) {
      setErrorMsg('Phone number must be exactly 10 digits.')
      return
    }

    setIsSubmitting(true)
    try {
      await updateClient(formData)
      setIsOpen(false)
      resetPicture()
    } catch (err: any) {
      console.error('Failed to update client profile:', err)
      setErrorMsg(err?.message || 'Failed to update client profile.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const existingPictures: any[] = Array.isArray(client?.pictures) ? client.pictures : []

  if (!client) return null

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setErrorMsg('')
          setPhoneNumber(client.phoneNumber || '')
          resetPicture()
          setIsOpen(true)
        }}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#41a6f4]/10 border border-[#41a6f4]/30 text-[#41a6f4] text-xs font-bold uppercase tracking-wider hover:bg-[#41a6f4]/20 transition-all"
      >
        <PencilSquareIcon className="size-4" /> Edit Profile
      </button>

      <Transition show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsOpen(false)}>
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" />
          </TransitionChild>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <TransitionChild
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <DialogPanel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all border border-slate-200">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                    <div>
                      <DialogTitle as="h3" className="text-lg font-bold text-slate-900">
                        Edit Client Information
                      </DialogTitle>
                      <p className="text-xs text-slate-500">
                        Update personal details & care instructions
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                    >
                      <XMarkIcon className="size-5" />
                    </button>
                  </div>

                  {errorMsg && (
                    <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-600">
                      {errorMsg}
                    </div>
                  )}

                  <form
                    ref={formRef}
                    action={handleSubmit}
                    className="space-y-4 text-xs font-medium"
                  >
                    <input type="hidden" name="clientId" value={client.id} />

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-600 mb-1">First Name</label>
                        <input
                          type="text"
                          name="firstName"
                          defaultValue={client.firstName || ''}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-slate-800 focus:border-[#41a6f4] focus:bg-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 mb-1">Last Name</label>
                        <input
                          type="text"
                          name="lastName"
                          defaultValue={client.lastName || ''}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-slate-800 focus:border-[#41a6f4] focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1">Full Name (Display Title)</label>
                      <input
                        type="text"
                        name="fullName"
                        defaultValue={client.fullName || ''}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-slate-800 focus:border-[#41a6f4] focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-600 mb-1">Email Address</label>
                        <input
                          type="email"
                          name="email"
                          defaultValue={client.email || ''}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-slate-800 focus:border-[#41a6f4] focus:bg-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 mb-1">Phone Number</label>
                        <input
                          type="tel"
                          inputMode="tel"
                          name="phoneNumber"
                          value={phoneNumber}
                          onChange={handlePhoneChange}
                          placeholder="(555) 123-4567"
                          maxLength={14}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-slate-800 focus:border-[#41a6f4] focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2">
                        <label className="block text-slate-600 mb-1">Street Address</label>
                        <input
                          type="text"
                          name="address"
                          defaultValue={client.address || ''}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-slate-800 focus:border-[#41a6f4] focus:bg-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 mb-1">Zip Code</label>
                        <input
                          type="text"
                          name="zipCode"
                          defaultValue={client.zipCode || ''}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-slate-800 focus:border-[#41a6f4] focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1">Client Photo</label>

                      {existingPictures.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {existingPictures.map((pic: any, idx: number) => (
                            <img
                              key={idx}
                              src={typeof pic === 'object' ? pic?.url : undefined}
                              alt="Existing client photo"
                              className="size-12 rounded-lg object-cover border border-slate-200"
                            />
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <div className="size-14 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                          {picturePreview ? (
                            <img
                              src={picturePreview}
                              alt="New photo preview"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <UserIcon className="size-6 text-slate-300" />
                          )}
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          name="picture"
                          accept="image/*"
                          onChange={handlePictureChange}
                          className="block w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:bg-[#41a6f4]/10 file:text-[#41a6f4] file:font-bold file:text-xs file:cursor-pointer hover:file:bg-[#41a6f4]/20 cursor-pointer"
                        />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Adding a new photo keeps existing ones — it doesn&apos;t replace them.
                      </p>
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1">Driver Care Notes</label>
                      <textarea
                        name="notes"
                        rows={3}
                        defaultValue={client.notes || ''}
                        placeholder="Special instructions or notes for drivers..."
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-slate-800 focus:border-[#41a6f4] focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="rounded-xl border border-slate-200 px-4 py-2 text-slate-600 hover:bg-slate-50 transition-colors font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="rounded-xl bg-[#41a6f4] px-4 py-2 font-bold text-white shadow-xs hover:bg-[#3491d8] transition-colors disabled:opacity-50"
                      >
                        {isSubmitting ? 'Saving...' : 'Save Profile'}
                      </button>
                    </div>
                  </form>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}
