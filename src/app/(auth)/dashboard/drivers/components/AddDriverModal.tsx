'use client'

import { useState, Fragment } from 'react'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { UserPlusIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { createDriver } from '../../actions/createDriver'
import { formatPhoneNumberInput, isValidPhoneNumber } from '@/utilities/phone'

const initialFormData = {
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  phoneNumber: '',
  address: '',
  position: 'driver' as 'manager' | 'assistant' | 'driver',
  primaryColor: '#41a6f4',
  password: '',
  confirmPassword: '',
}

export default function AddDriverModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [active, setActive] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [formData, setFormData] = useState(initialFormData)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, phoneNumber: formatPhoneNumberInput(e.target.value) }))
  }

  const resetForm = () => {
    setFormData(initialFormData)
    setActive(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!isValidPhoneNumber(formData.phoneNumber)) {
      setErrorMsg('Phone number must be exactly 10 digits.')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match.')
      return
    }

    setIsSubmitting(true)

    const payload = new FormData()
    payload.append('firstName', formData.firstName)
    payload.append('lastName', formData.lastName)
    payload.append('username', formData.username)
    payload.append('email', formData.email)
    payload.append('phoneNumber', formData.phoneNumber)
    payload.append('address', formData.address)
    payload.append('position', formData.position)
    payload.append('primaryColor', formData.primaryColor)
    payload.append('password', formData.password)
    if (active) payload.append('active', 'on')

    const res = await createDriver(payload)

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
        <UserPlusIcon className="size-4" />
        <span>Add New Driver</span>
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
                      Add New Driver
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

                  <form
                    onSubmit={handleSubmit}
                    className="space-y-4 text-xs font-medium max-h-[70vh] overflow-y-auto pr-1"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-600 mb-1">First Name *</label>
                        <input
                          type="text"
                          name="firstName"
                          required
                          value={formData.firstName}
                          onChange={handleChange}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-slate-800 focus:border-[#41a6f4] focus:bg-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 mb-1">Last Name *</label>
                        <input
                          type="text"
                          name="lastName"
                          required
                          value={formData.lastName}
                          onChange={handleChange}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-slate-800 focus:border-[#41a6f4] focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-600 mb-1">Username *</label>
                        <input
                          type="text"
                          name="username"
                          required
                          value={formData.username}
                          onChange={handleChange}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-slate-800 focus:border-[#41a6f4] focus:bg-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 mb-1">Email Address</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-slate-800 focus:border-[#41a6f4] focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-600 mb-1">Phone Number *</label>
                        <input
                          type="tel"
                          inputMode="tel"
                          name="phoneNumber"
                          required
                          value={formData.phoneNumber}
                          onChange={handlePhoneChange}
                          placeholder="(555) 123-4567"
                          maxLength={14}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-slate-800 focus:border-[#41a6f4] focus:bg-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 mb-1">Role / Position</label>
                        <select
                          name="position"
                          value={formData.position}
                          onChange={handleChange}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-slate-800 focus:border-[#41a6f4] focus:bg-white focus:outline-none"
                        >
                          <option value="driver">Driver</option>
                          <option value="assistant">Assistant</option>
                          <option value="manager">Manager</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1">Address *</label>
                      <input
                        type="text"
                        name="address"
                        required
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-slate-800 focus:border-[#41a6f4] focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-[auto_1fr] gap-3 items-end">
                      <div>
                        <label className="block text-slate-600 mb-1">Color</label>
                        <input
                          type="color"
                          name="primaryColor"
                          value={formData.primaryColor}
                          onChange={handleChange}
                          className="h-9 w-14 rounded-lg border border-slate-200 bg-slate-50/50 cursor-pointer"
                        />
                      </div>
                      <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-900 text-xs">Account Status</p>
                          <p className="text-[11px] text-slate-500">Inactive drivers can&apos;t log in</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={active}
                            onChange={(e) => setActive(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-600 mb-1">Password *</label>
                        <input
                          type="password"
                          name="password"
                          required
                          minLength={10}
                          value={formData.password}
                          onChange={handleChange}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-slate-800 focus:border-[#41a6f4] focus:bg-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 mb-1">Confirm Password *</label>
                        <input
                          type="password"
                          name="confirmPassword"
                          required
                          minLength={10}
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-slate-800 focus:border-[#41a6f4] focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400 -mt-2">
                      Must be at least 10 characters with an uppercase letter, lowercase letter, number, and special character.
                    </p>

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
                        {isSubmitting ? 'Creating...' : 'Create Driver'}
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
