'use client'

import { useState, Fragment } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { TrashIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { deleteDriver } from '../actions/deleteDriver'

export default function DeleteDriverModal({ driver }: { driver: any }) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const driverName = `${driver.firstName || ''} ${driver.lastName || ''}`.trim() || 'this driver'

  const handleDelete = async () => {
    setErrorMsg('')
    setIsSubmitting(true)

    const res = await deleteDriver(driver.id)

    if (res.success) {
      setIsOpen(false)
      router.push('/dashboard/drivers', { scroll: false })
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
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold uppercase tracking-wider hover:bg-rose-100 transition-all"
      >
        <TrashIcon className="size-4" /> Delete
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
                <DialogPanel className="w-full max-w-sm transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all border border-slate-200">
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-rose-50 border border-rose-200">
                      <ExclamationTriangleIcon className="size-5 text-rose-600" />
                    </div>
                    <div>
                      <DialogTitle as="h3" className="text-base font-bold text-slate-900">
                        Delete {driverName}?
                      </DialogTitle>
                      <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                        This permanently removes the driver&apos;s account and login access. This
                        action cannot be undone.
                      </p>
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="mt-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-600">
                      {errorMsg}
                    </div>
                  )}

                  <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleDelete}
                      className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-700 transition-colors disabled:opacity-50"
                    >
                      {isSubmitting ? 'Deleting...' : 'Delete Driver'}
                    </button>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}
