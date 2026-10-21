'use client'

import { useRef, useState } from 'react'
import { recordCashPayment } from '../actions/recordCashPayment'

export default function CashPaymentForm({ jobId, driverId }: { jobId: string; driverId: string }) {
  const formRef = useRef<HTMLFormElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    try {
      await recordCashPayment(formData)
      formRef.current?.reset()
    } catch (err) {
      console.error('Error recording payment:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form ref={formRef} action={handleSubmit} className="pt-2 space-y-3">
      <input type="hidden" name="jobId" value={jobId} />
      <input type="hidden" name="driverId" value={driverId} />

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="number"
          name="amount"
          step="0.01"
          min="0"
          placeholder="Amount ($)"
          required
          className="sm:w-1/3 rounded-xl bg-black/30 border border-white/10 px-4 py-2.5 text-xs font-bold text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
        />
        <input
          type="text"
          name="notes"
          placeholder="Payment note (optional)"
          className="flex-1 rounded-xl bg-black/30 border border-white/10 px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-[0.99] shrink-0"
        >
          {isSubmitting ? 'Saving...' : 'Record Cash'}
        </button>
      </div>
    </form>
  )
}
