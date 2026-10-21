'use client'

import { useState } from 'react'
import { Dialog, DialogPanel, DialogTitle, DialogBackdrop } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useRouter, useSearchParams } from 'next/navigation'

export default function Drawer({ messages }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const messageId = searchParams.get('messageId')
  const selectedMessage = messages.find((m) => m.id === messageId)

  const isOpen = !!selectedMessage
  const closeDrawer = () => router.push('/dashboard/messages') // Or use router.back()

  const VENUE_TIMEZONE = 'America/Chicago'

  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: VENUE_TIMEZONE,
    })
  }

  const formatDate = (isoString, options) => {
    return new Date(isoString).toLocaleString('en-US', {
      ...options,
      timeZone: VENUE_TIMEZONE,
    })
  }

  // Define dynamic style classes for reuse
  const iconClasses = 'size-5 shrink-0 text-slate-400 group-hover:text-slate-600 transition-colors'
  const textSubtleClasses = 'text-slate-600 group-hover:text-slate-900 transition-all duration-200'
  const textClasses = 'text-slate-900 font-medium'

  return (
    <div>
      <Dialog open={isOpen} onClose={closeDrawer} className="relative z-50">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-slate-900/40 transition-opacity duration-300 ease-linear data-closed:opacity-0 backdrop-blur-sm"
        />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
              <DialogPanel
                transition
                className="pointer-events-auto w-screen max-w-md transform transition duration-500 ease-in-out data-closed:translate-x-full sm:duration-700 pt-16 lg:pt-0"
              >
                <div className="relative flex h-full flex-col overflow-y-auto bg-white shadow-xl">
                  {/* Drawer Header */}
                  <div className="border-b border-slate-200/80 px-6 py-6 sticky top-0 bg-white z-10">
                    <div className="flex items-start justify-between">
                      <div className="flex flex-col gap-2">
                        <DialogTitle className="text-xl font-bold text-slate-900 tracking-tight">
                          {selectedMessage && selectedMessage.subject}
                        </DialogTitle>
                        {selectedMessage && (
                          <div className="flex items-center gap-2">
                            <img
                              alt={selectedMessage.sender.fullName}
                              src="/sd-homecare-logo.png"
                              className="size-8 rounded-full bg-slate-100"
                            />
                            <div>
                              <p className={textClasses}>{selectedMessage.sender.fullName}</p>
                              <p className={textSubtleClasses}>
                                {formatDate(selectedMessage.createdAt, {
                                  month: 'short',
                                  day: 'numeric',
                                })}{' '}
                                at {formatTime(selectedMessage.createdAt)}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="ml-3 flex h-7 items-center pt-1">
                        <button
                          type="button"
                          onClick={() => closeDrawer()}
                          className="relative rounded-md text-slate-400 hover:text-slate-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#41a6f4] hover:cursor-pointer p-1"
                        >
                          <span className="absolute -inset-2.5" />
                          <span className="sr-only">Close panel</span>
                          <XMarkIcon aria-hidden="true" className="size-6" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Drawer Body - Message Content */}
                  <div className="relative mt-8 flex-1 px-6 sm:px-8 pb-10">
                    {selectedMessage && (
                      <div className="prose prose-slate max-w-none text-slate-700 text-base leading-relaxed">
                        {selectedMessage.message}
                      </div>
                    )}
                  </div>

                  {/* Drawer Footer - Action Area */}
                  <div className="sticky bottom-0 border-t border-slate-200/80 bg-white px-6 py-5 flex items-center justify-end gap-3 z-10">
                    <button
                      type="button"
                      onClick={() => closeDrawer()}
                      className="rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-200"
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
    </div>
  )
}
