'use client'

import { Suspense, useState, useEffect } from 'react'
import { Dialog, DialogPanel, DialogTitle, DialogBackdrop } from '@headlessui/react'
import {
  XMarkIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline'
import { useRouter, useSearchParams } from 'next/navigation'
import EditClientModal from './EditClientModal'
import { getUser } from '../../actions/_getUser'

// Component with search params logic
function ClientDrawerContent({ clients = [] }: { clients?: any[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isManager, setIsManager] = useState(false)

  useEffect(() => {
    async function checkUser() {
      const u = await getUser()
      if (u?.position === 'manager') {
        setIsManager(true)
      }
    }
    checkUser()
  }, [])

  const clientId = searchParams.get('clientId')
  const selectedClient = clients.find((c) => String(c.id) === String(clientId))

  const isOpen = !!selectedClient

  const closeDrawer = () => {
    router.push('/dashboard/clients', { scroll: false })
  }

  return (
    <Dialog open={isOpen} onClose={closeDrawer} className="relative z-50">
      {/* Backdrop */}
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
                        Client Information
                      </DialogTitle>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">
                        Detailed care profile and contact logistics
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* MANAGER EDIT BUTTON */}
                      {isManager && selectedClient && <EditClientModal client={selectedClient} />}
                      <button
                        type="button"
                        onClick={closeDrawer}
                        className="rounded-lg text-slate-400 hover:text-slate-600 focus:outline-none p-1"
                      >
                        <span className="sr-only">Close panel</span>
                        <XMarkIcon aria-hidden="true" className="size-6" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Body Content */}
                {selectedClient && (
                  <div className="flex-1 px-6 py-6 space-y-6">
                    {/* Identity Hero */}
                    <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                      {Array.isArray(selectedClient.pictures) && selectedClient.pictures[0]?.url ? (
                        <img
                          src={selectedClient.pictures[0].url}
                          alt={selectedClient.fullName}
                          className="size-16 rounded-2xl object-cover bg-white border border-slate-200 shadow-2xs"
                        />
                      ) : (
                        <div className="size-16 rounded-2xl bg-sky-50 flex items-center justify-center font-bold text-[#41a6f4] text-xl border border-sky-100 shadow-2xs">
                          {selectedClient.firstName?.charAt(0)}
                          {selectedClient.lastName?.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">
                          {selectedClient.fullName ||
                            `${selectedClient.firstName} ${selectedClient.lastName}`}
                        </h2>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-sky-50 text-[11px] font-semibold text-[#41a6f4] mt-1">
                          Active Client
                        </span>
                      </div>
                    </div>

                    {/* Contact Actions */}
                    <div className="grid grid-cols-2 gap-3">
                      <a
                        href={`tel:${selectedClient.phoneNumber}`}
                        className="flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs py-2.5 px-3 rounded-xl transition-colors"
                      >
                        <PhoneIcon className="size-4 text-emerald-600" />
                        Call
                      </a>
                      <a
                        href={`mailto:${selectedClient.email}`}
                        className="flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs py-2.5 px-3 rounded-xl transition-colors"
                      >
                        <EnvelopeIcon className="size-4 text-[#41a6f4]" />
                        Email
                      </a>
                    </div>

                    {/* Address Detail Card */}
                    <div className="space-y-2">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Primary Address
                      </span>
                      <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-3.5 space-y-2">
                        <div className="flex items-start gap-2.5 text-xs text-slate-700">
                          <MapPinIcon className="size-4 text-slate-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="font-medium">{selectedClient.address}</p>
                            {selectedClient.zipCode && (
                              <p className="text-slate-400 mt-0.5">
                                Zip Code: {selectedClient.zipCode}
                              </p>
                            )}
                          </div>
                        </div>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedClient.address)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block text-xs font-semibold text-[#41a6f4] hover:underline pl-6"
                        >
                          Open in Google Maps →
                        </a>
                      </div>
                    </div>

                    {/* Care Notes */}
                    <div className="space-y-2">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Driver Care Notes
                      </span>
                      <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-3.5 flex items-start gap-2.5 text-xs">
                        <DocumentTextIcon className="size-4 text-slate-400 mt-0.5 shrink-0" />
                        <p className="text-slate-600 leading-relaxed italic">
                          {selectedClient.notes ||
                            'No special instructions logged for this client.'}
                        </p>
                      </div>
                    </div>

                    {/* Additional Photo Gallery */}
                    {Array.isArray(selectedClient.pictures) &&
                      selectedClient.pictures.length > 1 && (
                        <div className="space-y-2">
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Reference Photos
                          </span>
                          <div className="grid grid-cols-3 gap-2">
                            {selectedClient.pictures.slice(1).map((pic: any, idx: number) => (
                              <img
                                key={idx}
                                src={pic.url}
                                alt="Client Attachment"
                                className="size-20 rounded-xl object-cover border border-slate-200"
                              />
                            ))}
                          </div>
                        </div>
                      )}
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

// Exported component wrapped in Suspense
export default function ClientDrawer({ clients = [] }: { clients?: any[] }) {
  return (
    <Suspense fallback={null}>
      <ClientDrawerContent clients={clients} />
    </Suspense>
  )
}
