'use client'

import { useState, Fragment } from 'react'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { PlusIcon, XMarkIcon, TrashIcon, TruckIcon } from '@heroicons/react/24/outline'
import { createRoute } from '../../actions/createRoute'

interface AddRouteModalProps {
  drivers?: any[]
  locations?: any[]
  defaultDate: string
  label?: string
}

export default function AddRouteModal({
  drivers = [],
  locations = [],
  defaultDate,
  label = 'Create Route',
}: AddRouteModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [date, setDate] = useState(defaultDate)
  const [driver, setDriver] = useState('')
  const [stops, setStops] = useState<{ customerName: string; location: string }[]>([
    { customerName: '', location: '' },
  ])

  const resetForm = () => {
    setDate(defaultDate)
    setDriver('')
    setStops([{ customerName: '', location: '' }])
    setErrorMsg('')
  }

  const handleStopChange = (index: number, field: 'customerName' | 'location', value: string) => {
    const updated = [...stops]
    updated[index][field] = value
    setStops(updated)
  }

  const addStop = () => setStops([...stops, { customerName: '', location: '' }])
  const removeStop = (index: number) => {
    if (stops.length <= 1) return
    setStops(stops.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg('')

    const res = await createRoute({ date, driver, stops })

    if (res.success) {
      setIsOpen(false)
      resetForm()
    } else {
      setErrorMsg(res.error || 'Something went wrong.')
    }

    setIsSubmitting(false)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-[#41a6f4] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#3491d8] transition-all"
      >
        <TruckIcon className="size-4" />
        <span>{label}</span>
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
                <DialogPanel className="w-full max-w-xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all border border-slate-200">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                    <div>
                      <DialogTitle as="h3" className="text-lg font-bold text-slate-900">
                        Create Delivery Route
                      </DialogTitle>
                      <p className="text-xs text-slate-500">
                        Assign a driver and stops for a day&apos;s deliveries
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

                  <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-600 mb-1">Route Date *</label>
                        <input
                          type="date"
                          required
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-slate-800 focus:border-[#41a6f4] focus:bg-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-600 mb-1">Driver *</label>
                        <select
                          required
                          value={driver}
                          onChange={(e) => setDriver(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-slate-800 focus:border-[#41a6f4] focus:bg-white focus:outline-none"
                        >
                          <option value="">Select Driver</option>
                          {drivers.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.firstName} {d.lastName}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Delivery Stops ({stops.length})
                        </span>
                        <button
                          type="button"
                          onClick={addStop}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#41a6f4] hover:underline"
                        >
                          <PlusIcon className="size-3.5" /> Add Stop
                        </button>
                      </div>

                      {locations.length === 0 && (
                        <p className="text-[11px] text-amber-600 font-semibold">
                          No locations found. Add one on the Locations page first.
                        </p>
                      )}

                      <div className="space-y-2.5">
                        {stops.map((stop, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold uppercase text-slate-500">
                                Stop #{idx + 1}
                              </span>
                              {stops.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeStop(idx)}
                                  className="text-rose-500 hover:text-rose-600 p-1"
                                >
                                  <TrashIcon className="size-4" />
                                </button>
                              )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <input
                                type="text"
                                required
                                value={stop.customerName}
                                onChange={(e) =>
                                  handleStopChange(idx, 'customerName', e.target.value)
                                }
                                placeholder="Customer Name"
                                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-2.5 py-1.5 text-xs text-slate-800 focus:border-[#41a6f4] focus:bg-white focus:outline-none"
                              />

                              <select
                                required
                                value={stop.location}
                                onChange={(e) => handleStopChange(idx, 'location', e.target.value)}
                                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-2.5 py-1.5 text-xs text-slate-800 focus:border-[#41a6f4] focus:bg-white focus:outline-none"
                              >
                                <option value="">Select Location</option>
                                {locations.map((loc) => (
                                  <option key={loc.id} value={loc.id}>
                                    {loc.name || loc.address}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        ))}
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
                        {isSubmitting ? 'Creating...' : 'Create Route'}
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
