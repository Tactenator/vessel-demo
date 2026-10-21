'use client'

import { useState, Fragment } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { PencilSquareIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { updateVehicle } from '../../actions/updateVehicle'

export default function EditVehicleModal({ vehicle }: { vehicle: any }) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const [formData, setFormData] = useState({
    name: vehicle.name || '',
    vehicleYear: vehicle.vehicleYear || '',
    vehicleMake: vehicle.vehicleMake || '',
    vehicleModel: vehicle.vehicleModel || '',
    notes: vehicle.notes || '',
    carColor: vehicle.carColor || '#334155',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!formData.vehicleYear.trim() || !formData.vehicleMake.trim() || !formData.vehicleModel.trim()) {
      setErrorMsg('Vehicle year, make, and model are required.')
      return
    }

    setIsSubmitting(true)

    const res = await updateVehicle({ vehicleId: vehicle.id, ...formData })

    if (res.success) {
      setIsOpen(false)
      router.refresh()
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
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#41a6f4]/10 border border-[#41a6f4]/30 text-[#41a6f4] text-xs font-bold uppercase tracking-wider hover:bg-[#41a6f4]/20 transition-all"
      >
        <PencilSquareIcon className="size-4" /> Edit
      </button>

      <Transition show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-[60]" onClose={() => setIsOpen(false)}>
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
                      Edit Vehicle
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
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-slate-800 focus:border-[#41a6f4] focus:bg-white focus:outline-none"
                        />
                      </div>
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
