'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FireIcon } from '@heroicons/react/24/outline'
import { updateVehicleStatus } from '../../actions/updateVehicleStatus'

interface VehicleStatusFormProps {
  vehicleId: string
  currentOdometer?: string
  currentNeedsGas?: boolean
}

export default function VehicleStatusForm({
  vehicleId,
  currentOdometer = '',
  currentNeedsGas = false,
}: VehicleStatusFormProps) {
  const router = useRouter()
  const [odometer, setOdometer] = useState(currentOdometer)
  const [needsGas, setNeedsGas] = useState(currentNeedsGas)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [savedMsg, setSavedMsg] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSavedMsg(false)
    setIsSubmitting(true)

    const res = await updateVehicleStatus({ vehicleId, odometer, needsGas })

    if (res.success) {
      setSavedMsg(true)
      router.refresh()
    } else {
      setErrorMsg(res.error || 'Something went wrong.')
    }

    setIsSubmitting(false)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-slate-50/70 border border-slate-100 rounded-xl p-3.5 space-y-3"
    >
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <label className="block text-slate-500 mb-1 font-semibold">Odometer</label>
          <input
            type="text"
            value={odometer}
            onChange={(e) => {
              setOdometer(e.target.value)
              setSavedMsg(false)
            }}
            className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-800 focus:border-[#41a6f4] focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-slate-500 mb-1 font-semibold">Needs Gas?</label>
          <select
            value={needsGas ? 'true' : 'false'}
            onChange={(e) => {
              setNeedsGas(e.target.value === 'true')
              setSavedMsg(false)
            }}
            className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-800 focus:border-[#41a6f4] focus:outline-none"
          >
            <option value="false">No — Fuel OK</option>
            <option value="true">Yes — Needs Gas</option>
          </select>
        </div>
      </div>

      {errorMsg && <p className="text-[11px] font-semibold text-rose-600">{errorMsg}</p>}
      {savedMsg && !errorMsg && (
        <p className="text-[11px] font-semibold text-emerald-600">Vehicle status updated.</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#41a6f4] px-3 py-1.5 text-[11px] font-bold text-white hover:bg-[#3491d8] transition-colors disabled:opacity-50"
      >
        <FireIcon className="size-3.5" />
        {isSubmitting ? 'Saving...' : 'Update Odometer & Gas Status'}
      </button>
    </form>
  )
}
