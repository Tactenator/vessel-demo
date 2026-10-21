'use client'

import { useState, useRef, Fragment } from 'react'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { PlusIcon, XMarkIcon, MegaphoneIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline'
import { createMessage } from '../actions/createMessage'

export default function CreateMessageModal({ drivers = [] }: { drivers?: any[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sendToAll, setSendToAll] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    try {
      await createMessage(formData)
      formRef.current?.reset()
      setSendToAll(false)
      setIsOpen(false)
    } catch (err) {
      console.error('Error dispatching message:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-[#41a6f4] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#3491d8] transition-all"
      >
        <PlusIcon className="size-4 stroke-[2.5]" />
        <span>Compose Message</span>
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
                  {/* Modal Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                    <div>
                      <DialogTitle as="h3" className="text-lg font-bold text-slate-900">
                        New Message
                      </DialogTitle>
                      <p className="text-xs text-slate-500">
                        Dispatch notifications or direct notes to drivers
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

                  {/* Message Form */}
                  <form
                    ref={formRef}
                    action={handleSubmit}
                    className="space-y-4 text-xs font-medium"
                  >
                    {/* Broadcast Toggle Banner */}
                    <div className="p-3.5 rounded-xl border border-sky-100 bg-sky-50/60 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <MegaphoneIcon className="size-5 text-[#41a6f4] shrink-0" />
                        <div>
                          <p className="font-bold text-slate-900 text-xs">
                            Broadcast to All Drivers
                          </p>
                          <p className="text-[10px] text-slate-500">
                            Send message to every active driver account
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="sendToAll"
                          checked={sendToAll}
                          onChange={(e) => setSendToAll(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#41a6f4]"></div>
                      </label>
                    </div>

                    {/* Target Driver Selection */}
                    {!sendToAll && (
                      <div>
                        <label className="block text-slate-600 mb-1">
                          Select Recipient Driver(s) *
                        </label>
                        <select
                          name="driver"
                          multiple
                          required={!sendToAll}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-slate-800 focus:border-[#41a6f4] focus:bg-white focus:outline-none min-h-[100px]"
                        >
                          {drivers.map((d) => (
                            <option key={d.id} value={d.id} className="py-1 px-2">
                              {d.firstName} {d.lastName} ({d.email})
                            </option>
                          ))}
                        </select>
                        <p className="text-[10px] text-slate-400 italic mt-1">
                          Hold Ctrl/Cmd to select multiple drivers.
                        </p>
                      </div>
                    )}

                    {/* Message Type */}
                    <div>
                      <label className="block text-slate-600 mb-1">Notification Type</label>
                      <select
                        name="type"
                        defaultValue="direct"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-slate-800 focus:border-[#41a6f4] focus:bg-white focus:outline-none"
                      >
                        <option value="direct">Direct Note</option>
                        <option value="broadcast">General Announcement</option>
                        <option value="urgent">Urgent Alert</option>
                      </select>
                    </div>

                    {/* Subject */}
                    <div>
                      <label className="block text-slate-600 mb-1">Subject Line *</label>
                      <input
                        type="text"
                        name="subject"
                        required
                        placeholder="e.g. Schedule Update for Tomorrow"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-slate-800 placeholder-slate-400 focus:border-[#41a6f4] focus:bg-white focus:outline-none"
                      />
                    </div>

                    {/* Message Body */}
                    <div>
                      <label className="block text-slate-600 mb-1">Message Content *</label>
                      <textarea
                        name="message"
                        required
                        rows={5}
                        placeholder="Type your message details here..."
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-slate-800 placeholder-slate-400 focus:border-[#41a6f4] focus:bg-white focus:outline-none"
                      />
                    </div>

                    {/* Form Actions */}
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
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#41a6f4] px-4 py-2 font-bold text-white shadow-xs hover:bg-[#3491d8] transition-colors disabled:opacity-50"
                      >
                        <PaperAirplaneIcon className="size-4" />
                        <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
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
