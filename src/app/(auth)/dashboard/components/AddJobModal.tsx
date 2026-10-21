'use client'

import { useState, useRef, Fragment } from 'react'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { PlusIcon, XMarkIcon, TrashIcon } from '@heroicons/react/24/outline'
import { createJob } from '../actions/createJob'

interface AddJobModalProps {
  drivers?: any[]
  vehicles?: any[]
  clients?: any[]
  locations?: any[]
}

export default function AddJobModal({
  drivers = [],
  vehicles = [],
  clients = [],
  locations = [],
}: AddJobModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [noTime, setNoTime] = useState<boolean>(false)
  const [selectedClientPhone, setSelectedClientPhone] = useState<string>('')
  const [pickupDriver, setPickupDriver] = useState<string>('')
  const [dropoffDriver, setDropoffDriver] = useState<string>('')
  const [sameDriver, setSameDriver] = useState<boolean>(true)

  const [stops, setStops] = useState<{ location: string; note: string }[]>([
    { location: '', note: 'Pickup' },
    { location: '', note: 'Dropoff' },
  ])

  const formRef = useRef<HTMLFormElement>(null)

  const handleClientChange = (clientId: string) => {
    const matched = clients.find((c) => String(c.id) === String(clientId))
    if (matched?.phoneNumber) {
      setSelectedClientPhone(matched.phoneNumber)
    }
  }

  const handleStopChange = (index: number, field: 'location' | 'note', value: string) => {
    const updated = [...stops]
    updated[index][field] = value
    setStops(updated)
  }

  const addStop = () => {
    setStops([...stops, { location: '', note: '' }])
  }

  const removeStop = (index: number) => {
    if (stops.length <= 2) return
    setStops(stops.filter((_, i) => i !== index))
  }

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    try {
      await createJob(formData)
      setIsOpen(false)
      setStops([
        { location: '', note: 'Pickup' },
        { location: '', note: 'Dropoff' },
      ])
      setNoTime(false)
      setSelectedClientPhone('')
      setPickupDriver('')
      setDropoffDriver('')
      setSameDriver(true)
    } catch (err) {
      console.error('Failed to dispatch new job:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#41a6f4] hover:bg-[#3491d8] text-white text-xs font-bold uppercase tracking-wider shadow-xs transition-all"
      >
        <PlusIcon className="size-4" /> Add New Job
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
                        Dispatch New Job
                      </DialogTitle>
                      <p className="text-xs text-slate-500">
                        Create and schedule a new client transport assignment
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
                    <input type="hidden" name="stopsCount" value={stops.length} />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-600 mb-1">Client *</label>
                        <select
                          name="client"
                          required
                          onChange={(e) => handleClientChange(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-slate-800 focus:border-[#41a6f4] focus:bg-white focus:outline-none"
                        >
                          <option value="">Select Client</option>
                          {clients.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.fullName || `${c.firstName || ''} ${c.lastName || ''}` || c.email}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-600 mb-1">Status</label>
                        <select
                          name="status"
                          defaultValue="pending"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-slate-800 focus:border-[#41a6f4] focus:bg-white focus:outline-none"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1">Assign Vehicle *</label>
                      <select
                        name="vehicle"
                        required
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-slate-800 focus:border-[#41a6f4] focus:bg-white focus:outline-none"
                      >
                        <option value="">No Vehicle Assigned</option>
                        {vehicles.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.name || v.fullTitle || v.licensePlate || v.id}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Driver Assignment
                        </span>
                        <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={sameDriver}
                            onChange={(e) => {
                              setSameDriver(e.target.checked)
                              if (e.target.checked) setDropoffDriver(pickupDriver)
                            }}
                            className="size-3.5 rounded border-slate-300 text-[#41a6f4] focus:ring-0"
                          />
                          Same driver for dropoff
                        </label>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-600 mb-1">Pickup Driver *</label>
                          <select
                            name="pickupDriver"
                            value={pickupDriver}
                            required
                            onChange={(e) => {
                              setPickupDriver(e.target.value)
                              if (sameDriver) setDropoffDriver(e.target.value)
                            }}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:border-[#41a6f4] focus:outline-none"
                          >
                            <option value="">Unassigned</option>
                            {drivers.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.firstName} {d.lastName}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-slate-600 mb-1">Dropoff Driver</label>
                          <select
                            name="dropoffDriver"
                            value={dropoffDriver}
                            disabled={sameDriver}
                            onChange={(e) => setDropoffDriver(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:border-[#41a6f4] focus:outline-none disabled:bg-slate-100 disabled:text-slate-500"
                          >
                            <option value="">Unassigned</option>
                            {drivers.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.firstName} {d.lastName}
                              </option>
                            ))}
                          </select>
                          {sameDriver && (
                            <input type="hidden" name="dropoffDriver" value={pickupDriver} />
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1">Equipment Needed *</label>
                      <div className="grid grid-cols-2 gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                          <input
                            type="checkbox"
                            name="equipmentNeeded"
                            value="none"
                            className="rounded border-slate-300 text-[#41a6f4] focus:ring-0"
                          />
                          <span>None</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                          <input
                            type="checkbox"
                            name="equipmentNeeded"
                            value="wheelchair"
                            className="rounded border-slate-300 text-[#41a6f4] focus:ring-0"
                          />
                          <span>Wheelchair</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                          <input
                            type="checkbox"
                            name="equipmentNeeded"
                            value="gloves"
                            className="rounded border-slate-300 text-[#41a6f4] focus:ring-0"
                          />
                          <span>Gloves</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1">Phone Number *</label>
                      <input
                        type="text"
                        name="phoneNumber"
                        required
                        value={selectedClientPhone}
                        onChange={(e) => setSelectedClientPhone(e.target.value)}
                        placeholder="Client Phone Number"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-slate-800 focus:border-[#41a6f4] focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Schedule & Timing
                        </span>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="addNoTime"
                            name="noTime"
                            checked={noTime}
                            onChange={(e) => setNoTime(e.target.checked)}
                            className="size-4 rounded border-slate-300 text-[#41a6f4] focus:ring-0"
                          />
                          <label
                            htmlFor="addNoTime"
                            className="text-xs font-semibold text-slate-700"
                          >
                            Flexible Schedule (`noTime`)
                          </label>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-500 mb-1">Start Date / Time *</label>
                          <input
                            type="datetime-local"
                            name="startingDateAndTime"
                            required
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:border-[#41a6f4] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-500 mb-1">End Date / Time</label>
                          <input
                            type="datetime-local"
                            name="endingDateAndTime"
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:border-[#41a6f4] focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Route Stops ({stops.length})
                        </span>
                        <button
                          type="button"
                          onClick={addStop}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#41a6f4] hover:underline"
                        >
                          <PlusIcon className="size-3.5" /> Add Stop
                        </button>
                      </div>

                      <div className="space-y-2.5">
                        {stops.map((stop, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold uppercase text-slate-500">
                                {idx === 0
                                  ? 'Stop #1 (Pickup)'
                                  : idx === stops.length - 1
                                    ? `Stop #${idx + 1} (Final Destination)`
                                    : `Stop #${idx + 1} (Waypoint)`}
                              </span>
                              {stops.length > 2 && (
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
                              <select
                                name={`stops[${idx}][location]`}
                                value={stop.location}
                                onChange={(e) => handleStopChange(idx, 'location', e.target.value)}
                                required
                                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-2.5 py-1.5 text-xs text-slate-800 focus:border-[#41a6f4] focus:bg-white focus:outline-none"
                              >
                                <option value="">Select Location</option>
                                {locations.map((loc) => (
                                  <option key={loc.id} value={loc.id}>
                                    {loc.name || loc.address}
                                  </option>
                                ))}
                              </select>

                              <input
                                type="text"
                                name={`stops[${idx}][note]`}
                                value={stop.note}
                                required
                                onChange={(e) => handleStopChange(idx, 'note', e.target.value)}
                                placeholder="Note (e.g. Pickup)"
                                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-2.5 py-1.5 text-xs text-slate-800 focus:border-[#41a6f4] focus:bg-white focus:outline-none"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1">Dispatch Notes</label>
                      <textarea
                        name="notes"
                        rows={2}
                        placeholder="General notes for the driver..."
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
                        {isSubmitting ? 'Creating...' : 'Dispatch Job'}
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
