'use client'

import { useState, useRef, Fragment } from 'react'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { PencilSquareIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { updateOnCall } from '../actions/updateOnCall'

interface EditOnCallModalProps {
  currentOnCall?: any
  drivers?: any[]
  isManager: boolean
}

export default function EditOnCallModal({
  currentOnCall,
  drivers = [],
  isManager,
}: EditOnCallModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  if (!isManager) return null

  const assignedDriverIds = Array.isArray(currentOnCall?.driver)
    ? currentOnCall.driver.map((d: any) => (typeof d === 'object' ? d.id : d))
    : []

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    try {
      await updateOnCall(formData)
      setIsOpen(false)
    } catch (err) {
      console.error('Failed to update on-call roster:', err)
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
        <PencilSquareIcon className="size-4" /> Edit On-Call
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
                        Edit On-Call Rotation
                      </DialogTitle>
                      <p className="text-xs text-slate-500">
                        Set weekend coverage and assigned drivers
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

                  <form
                    ref={formRef}
                    action={handleSubmit}
                    className="space-y-4 text-xs font-medium"
                  >
                    <input type="hidden" name="onCallId" value={currentOnCall?.id || ''} />

                    <div>
                      <label className="block text-slate-600 mb-1">Weekend Period</label>
                      <input
                        type="text"
                        name="weekend"
                        required
                        defaultValue={currentOnCall?.weekend || 'Sat, Aug 1 - Sun, Aug 2'}
                        placeholder="e.g. Sat, Aug 1 - Sun, Aug 2"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:border-[#41a6f4] focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1">On-Call Drivers</label>
                      <select
                        name="driver"
                        multiple
                        defaultValue={assignedDriverIds}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-slate-800 focus:border-[#41a6f4] focus:bg-white focus:outline-none min-h-[120px]"
                      >
                        {drivers.map((d) => (
                          <option key={d.id} value={d.id} className="py-1 px-2">
                            {d.firstName} {d.lastName} ({d.phoneNumber || d.email})
                          </option>
                        ))}
                      </select>
                      <p className="text-[10px] text-slate-400 italic mt-1">
                        Hold Ctrl/Cmd to select primary and backup drivers.
                      </p>
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
                        {isSubmitting ? 'Saving...' : 'Update Rotation'}
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
