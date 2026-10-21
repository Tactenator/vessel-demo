'use client'

import { Suspense } from 'react'
import { Dialog, DialogPanel, DialogTitle, DialogBackdrop } from '@headlessui/react'
import { XMarkIcon, PhoneIcon, EnvelopeIcon, BriefcaseIcon } from '@heroicons/react/24/outline'
import { useRouter, useSearchParams } from 'next/navigation'
import EditDriverModal from '../../components/EditDriverModal'
import DeleteDriverModal from '../../components/DeleteDriverModal'

function DriverDrawerContent({
  drivers = [],
  isManager = false,
}: {
  drivers?: any[]
  isManager?: boolean
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const driverId = searchParams.get('driverId')
  const selectedDriver = drivers.find((d) => String(d.id) === String(driverId))

  const isOpen = !!selectedDriver

  const closeDrawer = () => {
    router.push('/dashboard/drivers', { scroll: false })
  }

  return (
    <Dialog open={isOpen} onClose={closeDrawer} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-slate-900/40 transition-opacity duration-300 ease-linear data-closed:opacity-0 backdrop-blur-xs"
      />

      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
            <DialogPanel
              transition
              className="pointer-events-auto w-screen max-w-md transform transition duration-500 ease-in-out data-closed:translate-x-full sm:duration-700"
            >
              <div className="relative flex h-full flex-col overflow-y-auto bg-white shadow-xl">
                {/* Header */}
                <div className="border-b border-slate-200/80 px-6 py-6 sticky top-0 bg-white z-10">
                  <div className="flex items-start justify-between">
                    <div>
                      <DialogTitle className="text-xl font-bold text-slate-900 tracking-tight">
                        Driver Profile
                      </DialogTitle>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">
                        Team account details and contact logistics
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedDriver && isManager && (
                        <>
                          <EditDriverModal driver={selectedDriver} />
                          <DeleteDriverModal driver={selectedDriver} />
                        </>
                      )}
                      <button
                        type="button"
                        onClick={closeDrawer}
                        className="rounded-lg text-slate-400 hover:text-slate-600 focus:outline-none p-1"
                      >
                        <XMarkIcon className="size-6" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Body */}
                {selectedDriver && (
                  <div className="flex-1 px-6 py-6 space-y-6">
                    {/* Hero Identity */}
                    <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                      <div className="size-16 rounded-2xl bg-sky-50 flex items-center justify-center font-bold text-[#41a6f4] text-xl border border-sky-100 shadow-2xs shrink-0">
                        {selectedDriver.firstName?.charAt(0) || 'D'}
                        {selectedDriver.lastName?.charAt(0) || ''}
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">
                          {selectedDriver.firstName} {selectedDriver.lastName}
                        </h2>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-sky-50 text-[11px] font-semibold text-[#41a6f4] uppercase tracking-wider mt-1">
                          {selectedDriver.position || 'Driver'}
                        </span>
                      </div>
                    </div>

                    {/* Direct Contact Actions */}
                    <div className="grid grid-cols-2 gap-3">
                      <a
                        href={`tel:${selectedDriver.phoneNumber}`}
                        className="flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs py-2.5 px-3 rounded-xl transition-colors"
                      >
                        <PhoneIcon className="size-4 text-emerald-600" />
                        Call
                      </a>
                      <a
                        href={`mailto:${selectedDriver.email}`}
                        className="flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs py-2.5 px-3 rounded-xl transition-colors"
                      >
                        <EnvelopeIcon className="size-4 text-[#41a6f4]" />
                        Email
                      </a>
                    </div>

                    {/* Account Particulars */}
                    <div className="space-y-3 pt-2">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Account Details
                      </span>

                      <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-3.5 space-y-3 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">User ID</span>
                          <span className="font-mono font-medium text-slate-700">
                            {selectedDriver.id}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Role</span>
                          <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                            {selectedDriver.position || 'Driver'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Email</span>
                          <span className="font-semibold text-slate-800">
                            {selectedDriver.email}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Phone</span>
                          <span className="font-semibold text-slate-800">
                            {selectedDriver.phoneNumber || 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Address</span>
                          <span className="font-semibold text-slate-800 text-right">
                            {selectedDriver.address || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="sticky bottom-0 border-t border-slate-200/80 bg-white px-6 py-4 flex items-center justify-end z-10">
                  <button
                    type="button"
                    onClick={closeDrawer}
                    className="w-full bg-slate-100 text-slate-800 hover:bg-slate-200 font-semibold text-xs py-2.5 px-4 rounded-xl transition-colors"
                  >
                    Close Profile
                  </button>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
  )
}

export default function DriverDrawer({
  drivers = [],
  isManager = false,
}: {
  drivers?: any[]
  isManager?: boolean
}) {
  return (
    <Suspense fallback={null}>
      <DriverDrawerContent drivers={drivers} isManager={isManager} />
    </Suspense>
  )
}
