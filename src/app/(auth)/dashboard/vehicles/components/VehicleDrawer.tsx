'use client'

import { Suspense, useState } from 'react'
import { Dialog, DialogPanel, DialogTitle, DialogBackdrop } from '@headlessui/react'
import {
  XMarkIcon,
  FireIcon,
  WrenchScrewdriverIcon,
  BanknotesIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline'
import { useRouter, useSearchParams } from 'next/navigation'
import AddMaintenanceModal from './AddMaintenanceModal'
import VehicleStatusForm from './VehicleStatusForm'
import VehicleDocumentsSection from './VehicleDocumentsSection'
import EditVehicleModal from './EditVehicleModal'
import DeleteVehicleModal from './DeleteVehicleModal'
import { updateMaintenanceStatus } from '../../actions/updateMaintenanceStatus'

function vehicleIdOf(ref: any) {
  return typeof ref === 'object' ? ref?.id : ref
}

const STATUS_STYLES: Record<string, string> = {
  needed: 'bg-rose-50 border-rose-200 text-rose-700',
  scheduled: 'bg-amber-50 border-amber-200 text-amber-700',
  completed: 'bg-emerald-50 border-emerald-200 text-emerald-700',
}

function MaintenanceRow({ item, isManager }: { item: any; isManager: boolean }) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusChange = async (status: string) => {
    setIsUpdating(true)
    await updateMaintenanceStatus(item.id, status as 'needed' | 'scheduled' | 'completed')
    router.refresh()
    setIsUpdating(false)
  }

  return (
    <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-3.5 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-slate-800">{item.item}</p>
          {item.dueDate && (
            <p className="text-[11px] text-slate-400 mt-0.5">
              Due {new Date(item.dueDate).toLocaleDateString()}
            </p>
          )}
        </div>
        <span
          className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${STATUS_STYLES[item.status] || STATUS_STYLES.needed}`}
        >
          {item.status}
        </span>
      </div>

      {item.notes && <p className="text-xs text-slate-500 italic">{item.notes}</p>}
      {item.cost && <p className="text-xs text-slate-600 font-semibold">Cost: ${item.cost}</p>}

      {isManager && item.status !== 'completed' && (
        <div className="flex items-center gap-2 pt-1">
          {item.status === 'needed' && (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => handleStatusChange('scheduled')}
              className="text-[11px] font-bold text-amber-600 hover:underline disabled:opacity-50"
            >
              Mark Scheduled
            </button>
          )}
          <button
            type="button"
            disabled={isUpdating}
            onClick={() => handleStatusChange('completed')}
            className="text-[11px] font-bold text-emerald-600 hover:underline disabled:opacity-50"
          >
            Mark Completed
          </button>
        </div>
      )}
    </div>
  )
}

function VehicleDrawerContent({
  vehicles = [],
  maintenanceItems = [],
  expenses = [],
  isManager = false,
}: {
  vehicles?: any[]
  maintenanceItems?: any[]
  expenses?: any[]
  isManager?: boolean
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const vehicleId = searchParams.get('vehicleId')
  const selectedVehicle = vehicles.find((v) => String(v.id) === String(vehicleId))

  const isOpen = !!selectedVehicle

  const closeDrawer = () => {
    router.push('/dashboard/vehicles', { scroll: false })
  }

  const vehicleMaintenance = selectedVehicle
    ? maintenanceItems.filter(
        (m) => String(vehicleIdOf(m.vehicle)) === String(selectedVehicle.id),
      )
    : []

  const vehicleExpenses = selectedVehicle
    ? expenses.filter((e) => String(vehicleIdOf(e.vehicle)) === String(selectedVehicle.id))
    : []

  const totalExpenses = vehicleExpenses.reduce((sum, e) => sum + (parseFloat(e.price) || 0), 0)

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
                        Vehicle Details
                      </DialogTitle>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">
                        Info, maintenance, and expense history
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {selectedVehicle && isManager && (
                        <>
                          <EditVehicleModal vehicle={selectedVehicle} />
                          <DeleteVehicleModal vehicle={selectedVehicle} />
                        </>
                      )}
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

                {selectedVehicle && (
                  <div className="flex-1 px-6 py-6 space-y-6">
                    {/* Identity Hero */}
                    <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                      <div
                        className="size-16 rounded-2xl border border-slate-200 shadow-2xs shrink-0"
                        style={{ backgroundColor: selectedVehicle.carColor || '#e2e8f0' }}
                      />
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">
                          {selectedVehicle.name || selectedVehicle.fullTitle}
                        </h2>
                        {selectedVehicle.name && (
                          <p className="text-xs text-slate-400 font-medium">
                            {selectedVehicle.fullTitle}
                          </p>
                        )}
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold mt-1 ${
                            selectedVehicle.needsGas
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          <FireIcon className="size-3" />
                          {selectedVehicle.needsGas ? 'Needs Gas' : 'Fuel OK'}
                        </span>
                      </div>
                    </div>

                    {/* Vehicle Info */}
                    <div className="space-y-2">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Vehicle Info
                      </span>
                      <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-3.5 grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-slate-400">Year</p>
                          <p className="font-semibold text-slate-700">
                            {selectedVehicle.vehicleYear}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400">Make</p>
                          <p className="font-semibold text-slate-700">
                            {selectedVehicle.vehicleMake}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400">Model</p>
                          <p className="font-semibold text-slate-700">
                            {selectedVehicle.vehicleModel}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400">Odometer</p>
                          <p className="font-semibold text-slate-700">
                            {selectedVehicle.odometer || 'Not logged'}
                          </p>
                        </div>
                      </div>
                      {selectedVehicle.notes && (
                        <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-3.5 flex items-start gap-2.5 text-xs">
                          <DocumentTextIcon className="size-4 text-slate-400 mt-0.5 shrink-0" />
                          <p className="text-slate-600 leading-relaxed italic">
                            {selectedVehicle.notes}
                          </p>
                        </div>
                      )}

                      {/* MANAGER-ONLY: Odometer & Gas Status Update */}
                      {isManager && (
                        <VehicleStatusForm
                          vehicleId={selectedVehicle.id}
                          currentOdometer={selectedVehicle.odometer}
                          currentNeedsGas={selectedVehicle.needsGas}
                        />
                      )}
                    </div>

                    {/* Documents */}
                    <VehicleDocumentsSection
                      vehicleId={selectedVehicle.id}
                      documents={selectedVehicle.documents}
                      vehicleDocuments={selectedVehicle.vehicleDocuments}
                      isManager={isManager}
                    />

                    {/* Maintenance Items */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          <WrenchScrewdriverIcon className="size-3.5 inline -mt-0.5 mr-1" />
                          Maintenance Items
                        </span>
                        {isManager && <AddMaintenanceModal vehicleId={selectedVehicle.id} />}
                      </div>

                      {vehicleMaintenance.length > 0 ? (
                        <div className="space-y-2">
                          {vehicleMaintenance.map((item) => (
                            <MaintenanceRow key={item.id} item={item} isManager={isManager} />
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic px-1">
                          No maintenance items logged for this vehicle.
                        </p>
                      )}
                    </div>

                    {/* Expense Reports */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          <BanknotesIcon className="size-3.5 inline -mt-0.5 mr-1" />
                          Expense Reports
                        </span>
                        <span className="text-xs font-bold text-slate-700">
                          Total: ${totalExpenses.toFixed(2)}
                        </span>
                      </div>

                      {vehicleExpenses.length > 0 ? (
                        <div className="space-y-2">
                          {vehicleExpenses.map((expense) => {
                            const receipt = expense.receipt
                            const receiptUrl =
                              typeof receipt === 'object' && receipt ? receipt.url : null

                            return (
                              <div
                                key={expense.id}
                                className="bg-slate-50/70 border border-slate-100 rounded-xl p-3.5 text-xs"
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-semibold text-slate-800">
                                      {expense.itemsPurchased}
                                    </p>
                                    <p className="text-slate-400 text-[11px] mt-0.5">
                                      {expense.date
                                        ? new Date(expense.date).toLocaleDateString()
                                        : ''}
                                    </p>
                                  </div>
                                  <span className="font-bold text-slate-700">
                                    ${expense.price}
                                  </span>
                                </div>

                                <div className="mt-2 pt-2 border-t border-slate-100/80">
                                  {receiptUrl ? (
                                    <a
                                      href={receiptUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1.5 text-[#41a6f4] font-bold hover:underline"
                                    >
                                      <DocumentTextIcon className="size-3.5" />
                                      View Receipt
                                    </a>
                                  ) : (
                                    <span className="text-slate-400 italic">
                                      No receipt attached
                                    </span>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic px-1">
                          No expenses logged for this vehicle yet.
                        </p>
                      )}
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
                    Close
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

export default function VehicleDrawer(props: {
  vehicles?: any[]
  maintenanceItems?: any[]
  expenses?: any[]
  isManager?: boolean
}) {
  return (
    <Suspense fallback={null}>
      <VehicleDrawerContent {...props} />
    </Suspense>
  )
}
