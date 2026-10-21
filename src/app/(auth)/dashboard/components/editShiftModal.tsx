'use client'

import { useState, useRef } from 'react'
import { Dialog, DialogPanel, DialogTitle, DialogBackdrop } from '@headlessui/react'
import { PencilSquareIcon, PlusIcon, XMarkIcon, ClockIcon } from '@heroicons/react/24/outline'
import { updateShift } from '../actions/updateShift'

interface EditShiftModalProps {
  shift?: any
  driverId: string
  driverName: string
  dateString: string
  isManager: boolean
}

export default function EditShiftModal({
  shift,
  driverId,
  driverName,
  dateString,
  isManager,
}: EditShiftModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [onCall, setOnCall] = useState<boolean>(shift?.onCall ?? false)
  const formRef = useRef<HTMLFormElement>(null)

  if (!isManager) return null

  // Format pre-existing times to HH:mm for HTML time inputs
  const formatForTimeInput = (isoString?: string) => {
    if (!isoString) return '08:00'
    const d = new Date(isoString)
    const hours = String(d.getUTCHours()).padStart(2, '0')
    const mins = String(d.getUTCMinutes()).padStart(2, '0')
    return `${hours}:${mins}`
  }

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    try {
      await updateShift(formData)
      setIsOpen(false)
    } catch (err) {
      console.error('Failed to update shift:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {shift ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="mt-1 flex items-center justify-center gap-1 text-[10px] font-bold text-[#41a6f4] hover:underline"
        >
          <PencilSquareIcon className="size-3" /> Edit
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="size-full min-h-[36px] flex items-center justify-center text-slate-300 hover:text-[#41a6f4] hover:bg-sky-50/50 rounded-lg transition-all"
          title="Add Shift"
        >
          <PlusIcon className="size-4" />
        </button>
      )}

      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
        <DialogBackdrop className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
              <DialogPanel className="pointer-events-auto w-screen max-w-md transform transition duration-300 ease-in-out bg-[#1a2236] text-white p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                      <DialogTitle className="text-lg font-bold">
                        {shift ? 'Edit Shift Assignment' : 'Schedule New Shift'}
                      </DialogTitle>
                      <p className="text-xs text-slate-400">
                        {driverName} • {dateString}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-white"
                    >
                      <XMarkIcon className="size-6" />
                    </button>
                  </div>

                  {/* Form */}
                  <form ref={formRef} action={handleSubmit} className="space-y-4 text-xs">
                    <input type="hidden" name="shiftId" value={shift?.id || ''} />
                    <input type="hidden" name="driver" value={driverId} />
                    <input type="hidden" name="date" value={dateString} />

                    {/* On Call Duty Toggle */}
                    <div className="p-3 rounded-xl bg-black/20 border border-white/10 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-white text-xs">On Call Duty</p>
                        <p className="text-[10px] text-slate-400">
                          Mark driver as on-call instead of active shift
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="onCall"
                          checked={onCall}
                          onChange={(e) => setOnCall(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#41a6f4]"></div>
                      </label>
                    </div>

                    {/* Shift Time Selectors */}
                    {!onCall && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300">
                            Start Time
                          </label>
                          <input
                            type="time"
                            name="startTime"
                            defaultValue={formatForTimeInput(shift?.startTime)}
                            className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2.5 text-white focus:outline-none focus:border-[#41a6f4]"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300">
                            End Time
                          </label>
                          <input
                            type="time"
                            name="endTime"
                            defaultValue={formatForTimeInput(shift?.endTime)}
                            className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2.5 text-white focus:outline-none focus:border-[#41a6f4]"
                          />
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300">
                        Shift Notes / Instructions
                      </label>
                      <textarea
                        name="notes"
                        rows={3}
                        defaultValue={shift?.notes || ''}
                        placeholder="e.g. Standard morning route cover..."
                        className="w-full rounded-xl bg-black/40 border border-white/10 p-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#41a6f4]"
                      />
                    </div>

                    {/* Actions */}
                    <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-5 py-2.5 rounded-xl bg-[#41a6f4] hover:bg-[#3492dc] text-white font-bold uppercase tracking-wider shadow-md disabled:opacity-50"
                      >
                        {isSubmitting ? 'Saving...' : 'Save Shift'}
                      </button>
                    </div>
                  </form>
                </div>
              </DialogPanel>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  )
}
