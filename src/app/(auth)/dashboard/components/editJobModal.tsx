'use client'

import { useState, useRef, Fragment } from 'react'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { PencilSquareIcon, XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import { updateJob } from '../actions/updateJob'
import { utcIsoToZonedDateTimeLocal } from '@/utilities/timezone'

interface EditJobModalProps {
  job: any
  drivers?: any[]
  vehicles?: any[]
  clients?: any[]
  locations?: any[]
}

// Tables render one of these per row (potentially hundreds). Keeping the trigger
// this thin and only mounting the heavy form below on click means idle rows cost
// a single button + useState instead of a fully-initialized form for a dialog
// almost nobody will ever open.
export default function EditJobModal(props: EditJobModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#41a6f4]/10 border border-[#41a6f4]/30 text-[#41a6f4] text-xs font-bold uppercase tracking-wider hover:bg-[#41a6f4]/20 transition-all"
      >
        <PencilSquareIcon className="size-4" /> Edit Job Details
      </button>

      {isOpen && <EditJobModalContent {...props} onRequestClose={() => setIsOpen(false)} />}
    </>
  )
}

function EditJobModalContent({
  job,
  drivers = [],
  vehicles = [],
  clients = [],
  locations = [],
  onRequestClose,
}: EditJobModalProps & { onRequestClose: () => void }) {
  // Starts open since this component only mounts once the trigger has been clicked.
  // Closing sets this false to play the leave transition, then `afterLeave` tells
  // the parent to unmount us for good.
  const [open, setOpen] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [noTime, setNoTime] = useState<boolean>(job.noTime || false)

  const legacyDriverId = typeof job.driver === 'object' ? job.driver?.id : job.driver || ''
  const initialPickupDriver =
    (typeof job.pickupDriver === 'object' ? job.pickupDriver?.id : job.pickupDriver) ||
    legacyDriverId ||
    ''
  const initialDropoffDriver =
    (typeof job.dropoffDriver === 'object' ? job.dropoffDriver?.id : job.dropoffDriver) ||
    legacyDriverId ||
    ''

  const [pickupDriver, setPickupDriver] = useState<string>(initialPickupDriver)
  const [dropoffDriver, setDropoffDriver] = useState<string>(initialDropoffDriver)
  const [sameDriver, setSameDriver] = useState<boolean>(
    String(initialPickupDriver) === String(initialDropoffDriver),
  )

  const selectedEquipment: string[] = Array.isArray(job.equipmentNeeded)
    ? job.equipmentNeeded
    : job.equipmentNeeded
      ? [job.equipmentNeeded]
      : []

  const initialStops =
    Array.isArray(job.stops) && job.stops.length > 0
      ? job.stops.map((s: any) => ({
          location: typeof s.location === 'object' ? s.location?.id : s.location || '',
          note: s.note || '',
        }))
      : [
          {
            location:
              typeof job.startingLocation === 'object'
                ? job.startingLocation?.id
                : job.startingLocation || '',
            note: 'Pickup',
          },
          {
            location:
              typeof job.endingLocation === 'object'
                ? job.endingLocation?.id
                : job.endingLocation || '',
            note: 'Dropoff',
          },
        ]

  const [stops, setStops] = useState<{ location: string; note: string }[]>(initialStops)
  const formRef = useRef<HTMLFormElement>(null)

  // Uses the business's operating timezone (America/Chicago), not the viewing browser's
  // own timezone, so the form pre-fills with the same wall-clock time regardless of
  // where the editing manager is physically located.
  const formatForInput = (isoString?: string) => utcIsoToZonedDateTimeLocal(isoString)

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
      await updateJob(formData)
      setOpen(false)
    } catch (err) {
      console.error('Failed to update job:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Transition show={open} as={Fragment} afterLeave={onRequestClose}>
      <Dialog as="div" className="relative z-50" onClose={() => setOpen(false)}>
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
                      Edit Job Specs
                    </DialogTitle>
                    <p className="text-xs text-slate-500">
                      Manager override for all job & route properties
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                  >
                    <XMarkIcon className="size-5" />
                  </button>
                </div>

                <form ref={formRef} action={handleSubmit} className="space-y-4 text-xs font-medium">
                  <input type="hidden" name="jobId" value={job.id} />
                  <input type="hidden" name="stopsCount" value={stops.length} />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 mb-1">Client</label>
                      <select
                        name="client"
                        defaultValue={
                          typeof job.client === 'object' ? job.client?.id : job.client || ''
                        }
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-slate-800 focus:border-[#41a6f4] focus:bg-white focus:outline-none"
                      >
                        <option value="">Select Client</option>
                        {clients.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.fullName || c.name || c.email}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1">Status</label>
                      <select
                        name="status"
                        defaultValue={job.status || 'pending'}
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
                    <label className="block text-slate-600 mb-1">Assigned Vehicle</label>
                    <select
                      name="vehicle"
                      defaultValue={
                        typeof job.vehicle === 'object' ? job.vehicle?.id : job.vehicle || ''
                      }
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
                        <label className="block text-slate-600 mb-1">Pickup Driver</label>
                        <select
                          name="pickupDriver"
                          value={pickupDriver}
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
                    <label className="block text-slate-600 mb-1">Equipment Needed</label>
                    <div className="grid grid-cols-2 gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                        <input
                          type="checkbox"
                          name="equipmentNeeded"
                          value="none"
                          defaultChecked={selectedEquipment.includes('none')}
                          className="rounded border-slate-300 text-[#41a6f4] focus:ring-0"
                        />
                        <span>None</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                        <input
                          type="checkbox"
                          name="equipmentNeeded"
                          value="wheelchair"
                          defaultChecked={selectedEquipment.includes('wheelchair')}
                          className="rounded border-slate-300 text-[#41a6f4] focus:ring-0"
                        />
                        <span>Wheelchair</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                        <input
                          type="checkbox"
                          name="equipmentNeeded"
                          value="gloves"
                          defaultChecked={selectedEquipment.includes('gloves')}
                          className="rounded border-slate-300 text-[#41a6f4] focus:ring-0"
                        />
                        <span>Gloves</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1">Phone Number</label>
                    <input
                      type="text"
                      name="phoneNumber"
                      defaultValue={job.phoneNumber || ''}
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
                          id="noTimeModal"
                          name="noTime"
                          checked={noTime}
                          onChange={(e) => setNoTime(e.target.checked)}
                          className="size-4 rounded border-slate-300 text-[#41a6f4] focus:ring-0"
                        />
                        <label htmlFor="noTimeModal" className="text-xs font-semibold text-slate-700">
                          Flexible Schedule (`noTime`)
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-500 mb-1">Start Date / Time</label>
                        <input
                          type="datetime-local"
                          name="startingDateAndTime"
                          defaultValue={formatForInput(job.startingDateAndTime)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:border-[#41a6f4] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-1">End Date / Time</label>
                        <input
                          type="datetime-local"
                          name="endingDateAndTime"
                          defaultValue={formatForInput(job.endingDateAndTime)}
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
                              onChange={(e) => handleStopChange(idx, 'note', e.target.value)}
                              placeholder="Stop note (e.g. Pharmacy)"
                              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-2.5 py-1.5 text-xs text-slate-800 focus:border-[#41a6f4] focus:bg-white focus:outline-none"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-slate-600 mb-1">Client Notes</label>
                      <textarea
                        name="notes"
                        rows={2}
                        defaultValue={job.notes || ''}
                        placeholder="General client dispatch notes..."
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-slate-800 focus:border-[#41a6f4] focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-600 mb-1">Final Drive Notes</label>
                        <input
                          type="text"
                          name="finalDriveNotes"
                          defaultValue={job.finalDriveNotes || ''}
                          placeholder="Post-drive notes"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-slate-800 focus:border-[#41a6f4] focus:bg-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-600 mb-1">Logged Drive Time</label>
                        <input
                          type="text"
                          name="driveTime"
                          defaultValue={job.driveTime || ''}
                          placeholder="e.g. 45 mins"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-slate-800 focus:border-[#41a6f4] focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="rounded-xl border border-slate-200 px-4 py-2 text-slate-600 hover:bg-slate-50 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="rounded-xl bg-[#41a6f4] px-4 py-2 font-bold text-white shadow-xs hover:bg-[#3491d8] transition-colors disabled:opacity-50"
                    >
                      {isSubmitting ? 'Saving...' : 'Save All Changes'}
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
