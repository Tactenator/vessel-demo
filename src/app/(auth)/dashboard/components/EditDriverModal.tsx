'use client'

import { useState, useRef, Fragment } from 'react'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { PencilSquareIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { updateDriver } from '../actions/updateDriver'
import { formatPhoneNumberInput } from '@/utilities/phone'

export default function EditDriverModal({ driver }: { driver: any }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [active, setActive] = useState<boolean>(driver.active ?? true)
  const [phoneNumber, setPhoneNumber] = useState(formatPhoneNumberInput(driver.phoneNumber || ''))
  const [errorMsg, setErrorMsg] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(formatPhoneNumberInput(e.target.value))
  }

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    setErrorMsg('')
    try {
      await updateDriver(formData)
      setIsOpen(false)
    } catch (err: any) {
      console.error('Failed to update driver profile:', err)
      setErrorMsg(err.message || 'Failed to update driver profile.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#41a6f4]/10 border border-[#41a6f4]/30 text-[#41a6f4] text-xs font-bold uppercase tracking-wider hover:bg-[#41a6f4]/20 transition-all"
      >
        <PencilSquareIcon className="size-4" /> Edit Driver
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
                        Edit Driver Profile
                      </DialogTitle>
                      <p className="text-xs text-slate-500">Update account credentials & status</p>
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
                    <input type="hidden" name="driverId" value={driver.id} />

                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-900 text-xs">Account Status</p>
                        <p className="text-[11px] text-slate-500">
                          Inactive drivers cannot log in to the app
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="active"
                          checked={active}
                          onChange={(e) => setActive(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-600 mb-1">First Name</label>
                        <input
                          type="text"
                          name="firstName"
                          defaultValue={driver.firstName || ''}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-slate-800 focus:border-[#41a6f4] focus:bg-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 mb-1">Last Name</label>
                        <input
                          type="text"
                          name="lastName"
                          defaultValue={driver.lastName || ''}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-slate-800 focus:border-[#41a6f4] focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        defaultValue={driver.email || ''}
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

                    <div>
                      <label className="block text-slate-600 mb-1">Address</label>
                      <input
                        type="text"
                        name="address"
                        defaultValue={driver.address || ''}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-slate-800 focus:border-[#41a6f4] focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-600 mb-1">Role / Position</label>
                        <select
                          name="position"
                          defaultValue={driver.position || 'driver'}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-slate-800 focus:border-[#41a6f4] focus:bg-white focus:outline-none"
                        >
                          <option value="driver">Driver</option>
                          <option value="manager">Manager</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-600 mb-1">Color</label>
                        <input
                          type="color"
                          name="primaryColor"
                          defaultValue={driver.primaryColor || '#41a6f4'}
                          className="h-9 w-14 rounded-lg border border-slate-200 bg-slate-50/50 cursor-pointer"
                        />
                      </div>
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
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
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
