'use client'

import { useState, Fragment } from 'react'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { createVehicle } from '../../actions/createVehicle'

const initialFormData = {
  name: '',
  vehicleYear: '',
  vehicleMake: '',
  vehicleModel: '',
  odometer: '',
  notes: '',
  carColor: '#334155',
}

export default function AddVehicleModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [needsGas, setNeedsGas] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [formData, setFormData] = useState(initialFormData)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const resetForm = () => {
    setFormData(initialFormData)
    setNeedsGas(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!formData.vehicleYear.trim() || !formData.vehicleMake.trim() || !formData.vehicleModel.trim()) {
      setErrorMsg('Vehicle year, make, and model are required.')
      return
    }

    setIsSubmitting(true)

    const res = await createVehicle({ ...formData, needsGas })

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
        <PlusIcon className="size-4" />
        <span>Add New Vehicle</span>
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
                    <DialogTitle as="h3" className="text-lg font-bold text-slate-900">
                      Add New Vehicle
                    </DialogTitle>
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
                    <div>
                      <label className="block text-slate-600 mb-1">Vehicle Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. Van 1"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-slate-800 focus:border-[#41a6f4] focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-600 mb-1">Year *</label>
                        <input
                          type="text"
                          name="vehicleYear"
                          required
                          value={formData.vehicleYear}
                          onChange={handleChange}
                          placeholder="2024"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-slate-800 focus:border-[#41a6f4] focus:bg-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 mb-1">Make *</label>
                        <input
                          type="text"
                          name="vehicleMake"
                          required
                          value={formData.vehicleMake}
                          onChange={handleChange}
                          placeholder="Toyota"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-slate-800 focus:border-[#41a6f4] focus:bg-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 mb-1">Model *</label>
                        <input
                          type="text"
                          name="vehicleModel"
                          required
                          value={formData.vehicleModel}
                          onChange={handleChange}
                          placeholder="Camry"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-slate-800 focus:border-[#41a6f4] focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-[1fr_auto_auto] gap-3 items-end">
                      <div>
                        <label className="block text-slate-600 mb-1">Odometer</label>
                        <input
                          type="text"
                          name="odometer"
                          value={formData.odometer}
                          onChange={handleChange}
                          placeholder="0"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-slate-800 focus:border-[#41a6f4] focus:bg-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 mb-1">Color</label>
                        <input
                          type="color"
                          name="carColor"
                          value={formData.carColor}
                          onChange={handleChange}
                          className="h-9 w-14 rounded-lg border border-slate-200 bg-slate-50/50 cursor-pointer"
                        />
                      </div>
                      <label className="flex items-center gap-2 pb-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={needsGas}
                          onChange={(e) => setNeedsGas(e.target.checked)}
                          className="size-4 rounded border-slate-300 text-[#41a6f4] focus:ring-[#41a6f4]"
                        />
                        <span className="text-slate-600">Needs Gas</span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1">Notes</label>
                      <textarea
                        name="notes"
                        rows={3}
                        value={formData.notes}
                        onChange={handleChange}
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
                        {isSubmitting ? 'Creating...' : 'Create Vehicle'}
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
