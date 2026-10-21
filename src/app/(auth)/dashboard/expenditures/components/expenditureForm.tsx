'use client'

import { useActionState, useRef, useEffect, useState } from 'react'
import { createNewInvoice } from '../../actions/createNewInovice'
import {
  BanknotesIcon,
  CalendarIcon,
  DocumentArrowUpIcon,
  ShoppingBagIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  TruckIcon,
} from '@heroicons/react/24/outline'

interface ExpenditureFormProps {
  vehicles?: any[]
}

export default function ExpenditureForm({ vehicles = [] }: ExpenditureFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const [state, action, isPending] = useActionState(createNewInvoice, null)
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)

  // Reset the form values smoothly upon a verified server success callback
  useEffect(() => {
    if (state?.success && formRef.current) {
      formRef.current.reset()
      setSelectedFileName(null)
    }
  }, [state])

  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
      {/* Container Header Profile */}
      <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Log Expenditure</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Submit business receipts.</p>
        </div>
        <div className="h-9 w-9 rounded-xl bg-sky-50 flex items-center justify-center shrink-0">
          <BanknotesIcon className="h-5 w-5 text-[#41a6f4]" />
        </div>
      </div>

      <form ref={formRef} action={action} className="space-y-4">
        {/* Vehicle Selector */}
        <div>
          <label
            htmlFor="vehicleId"
            className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2"
          >
            Vehicle (Optional)
          </label>
          <div className="relative">
            <select
              id="vehicleId"
              name="vehicleId"
              defaultValue=""
              className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 pl-10 text-sm font-medium text-slate-800 transition-all focus:border-[#41a6f4] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#41a6f4] appearance-none"
            >
              <option value="">Not vehicle-related</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name || v.fullTitle}
                </option>
              ))}
            </select>
            <TruckIcon className="absolute left-3.5 top-3.5 size-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Item Input field */}
        <div>
          <label
            htmlFor="itemsPurchased"
            className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2"
          >
            Item(s) Purchased
          </label>
          <div className="relative">
            <input
              id="itemsPurchased"
              name="itemsPurchased"
              required
              type="text"
              placeholder="Office supplies, fuel refill, etc."
              className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 pl-10 text-sm font-medium text-slate-800 placeholder-slate-400 transition-all focus:border-[#41a6f4] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#41a6f4]"
            />
            <ShoppingBagIcon className="absolute left-3.5 top-3.5 size-4 text-slate-400" />
          </div>
        </div>

        {/* Dual Column Layout Grid: Date & Cost Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="date"
              className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2"
            >
              Date of Purchase
            </label>
            <div className="relative">
              <input
                id="date"
                name="date"
                required
                type="date"
                className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 pl-10 text-sm font-medium text-slate-800 transition-all focus:border-[#41a6f4] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#41a6f4]"
              />
              <CalendarIcon className="absolute left-3.5 top-3.5 size-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label
              htmlFor="price"
              className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2"
            >
              Total Price ($)
            </label>
            <div className="relative">
              <input
                id="price"
                name="price"
                required
                type="text"
                placeholder="0.00"
                className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 pl-10 text-sm font-medium text-slate-800 placeholder-slate-400 transition-all focus:border-[#41a6f4] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#41a6f4]"
              />
              <span className="absolute left-3.5 top-3.5 text-sm font-bold text-slate-400 select-none">
                $
              </span>
            </div>
          </div>
        </div>

        {/* Custom Drag Drop Receipt Attachment Wrapper */}
        <div>
          <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Receipt Document
          </span>
          <label
            htmlFor="file"
            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all group ${
              selectedFileName
                ? 'border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50'
                : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-[#41a6f4]/50'
            }`}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
              {selectedFileName ? (
                <>
                  <CheckCircleIcon className="size-6 text-emerald-500 mb-2 shrink-0" />
                  <p className="text-xs font-semibold text-emerald-700 break-all">
                    {selectedFileName}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">Click to choose a different file</p>
                </>
              ) : (
                <>
                  <DocumentArrowUpIcon className="size-6 text-slate-400 group-hover:text-[#41a6f4] transition-colors mb-2 shrink-0" />
                  <p className="text-xs font-semibold text-slate-600">
                    Click to attach receipt image
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">PDF, PNG, or JPG formats supported</p>
                </>
              )}
            </div>
            <input
              id="file"
              name="file"
              type="file"
              className="hidden"
              onChange={(e) => setSelectedFileName(e.target.files?.[0]?.name || null)}
            />
          </label>
        </div>

        {/* Inline State Feedback Message Banners (Replaces old window alerts) */}
        {state?.success && (
          <div className="flex items-start gap-2.5 rounded-xl bg-emerald-50 p-3 border border-emerald-100 text-emerald-800 text-xs font-medium">
            <CheckCircleIcon className="size-4 text-emerald-600 mt-0.5 shrink-0" />
            <p>Expenditure added and cataloged successfully!</p>
          </div>
        )}

        {state?.error && (
          <div className="flex items-start gap-2.5 rounded-xl bg-rose-50 p-3 border border-rose-100 text-rose-800 text-xs font-medium">
            <ExclamationCircleIcon className="size-4 text-rose-600 mt-0.5 shrink-0" />
            <p>Error processing invoice: {state.error}</p>
          </div>
        )}

        {/* Action Form Confirmation Layer Trigger */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-[#41a6f4] text-white py-3 px-4 rounded-xl font-semibold hover:bg-[#3592dd] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#41a6f4] disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed shadow-sm text-sm"
        >
          {isPending ? (
            <span className="inline-flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Processing Form...
            </span>
          ) : (
            'Add Expenditure Assignment'
          )}
        </button>
      </form>
    </div>
  )
}
