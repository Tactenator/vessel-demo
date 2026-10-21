'use client'

import { useState, useRef, Fragment } from 'react'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { PencilSquareIcon, XMarkIcon, CalendarIcon } from '@heroicons/react/24/outline'
import { batchUpdateDriverSchedule } from '../actions/batchUpdateDriverSchedule'

interface DayOption {
  dateObj: Date
  dateStr: string
  dayName: string
  displayDate: string
  existingShift?: any
}

interface EditDriverScheduleModalProps {
  driver: any
  weekDays: Date[]
  scheduleLookup: Record<string, Record<string, any>>
  isManager: boolean
}

export default function EditDriverScheduleModal({
  driver,
  weekDays,
  scheduleLookup,
  isManager,
}: EditDriverScheduleModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  if (!isManager) return null

  const driverName = `${driver.firstName || ''} ${driver.lastName || ''}`.trim() || 'Driver'

  const daysData: DayOption[] = weekDays.map((d) => {
    const dateStr = d.toISOString().split('T')[0]
    const existingShift = scheduleLookup[driver.id]?.[dateStr]

    return {
      dateObj: d,
      dateStr,
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      displayDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      existingShift,
    }
  })

  const formatTimeForInput = (isoString?: string, defaultVal = '08:00') => {
    if (!isoString) return defaultVal
    const date = new Date(isoString)
    const hours = String(date.getUTCHours()).padStart(2, '0')
    const mins = String(date.getUTCMinutes()).padStart(2, '0')
    return `${hours}:${mins}`
  }

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    try {
      await batchUpdateDriverSchedule(formData)
      setIsOpen(false)
    } catch (err) {
      console.error('Failed to update weekly schedule:', err)
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
        <PencilSquareIcon className="size-3.5" /> Edit Weekly Roster
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
                <DialogPanel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all border border-slate-200">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                    <div>
                      <DialogTitle as="h3" className="text-lg font-bold text-slate-900">
                        Edit Weekly Schedule — {driverName}
                      </DialogTitle>
                      <p className="text-xs text-slate-500">
                        Toggle shift active status, working hours, or on-call duties for the week.
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
                    <input type="hidden" name="driverId" value={driver.id} />

                    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                      {daysData.map((day, idx) => {
                        const shift = day.existingShift
                        const hasShift = Boolean(shift)

                        return (
                          <div
                            key={day.dateStr}
                            className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                          >
                            <input
                              type="hidden"
                              name={`shifts[${idx}][id]`}
                              value={shift?.id || ''}
                            />
                            <input
                              type="hidden"
                              name={`shifts[${idx}][date]`}
                              value={day.dateStr}
                            />

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <CalendarIcon className="size-4 text-[#41a6f4]" />
                                <span className="font-bold text-slate-800 text-sm">
                                  {day.dayName} • {day.displayDate}
                                </span>
                              </div>

                              <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    name={`shifts[${idx}][active]`}
                                    defaultChecked={hasShift}
                                    className="rounded border-slate-300 text-[#41a6f4] focus:ring-0"
                                  />
                                  <span className="font-semibold text-slate-700 text-xs">
                                    Scheduled
                                  </span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    name={`shifts[${idx}][onCall]`}
                                    defaultChecked={shift?.onCall ?? false}
                                    className="rounded border-slate-300 text-amber-500 focus:ring-0"
                                  />
                                  <span className="font-semibold text-amber-700 text-xs">
                                    On-Call
                                  </span>
                                </label>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200">
                              <div>
                                <label className="block text-slate-500 mb-1">Start Time</label>
                                <input
                                  type="time"
                                  name={`shifts[${idx}][startTime]`}
                                  defaultValue={formatTimeForInput(shift?.startTime, '08:00')}
                                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:border-[#41a6f4] focus:outline-none"
                                />
                              </div>

                              <div>
                                <label className="block text-slate-500 mb-1">End Time</label>
                                <input
                                  type="time"
                                  name={`shifts[${idx}][endTime]`}
                                  defaultValue={formatTimeForInput(shift?.endTime, '17:00')}
                                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:border-[#41a6f4] focus:outline-none"
                                />
                              </div>

                              <div>
                                <label className="block text-slate-500 mb-1">Notes</label>
                                <input
                                  type="text"
                                  name={`shifts[${idx}][notes]`}
                                  defaultValue={shift?.notes || ''}
                                  placeholder="Notes..."
                                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 placeholder-slate-400 focus:border-[#41a6f4] focus:outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        )
                      })}
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
                        {isSubmitting ? 'Saving...' : 'Save Entire Weekly Schedule'}
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
