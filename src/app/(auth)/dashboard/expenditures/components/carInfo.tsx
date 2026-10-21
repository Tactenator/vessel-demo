// 1. CRITICAL: Removed 'use server' from this top line!
// This is now a standard React Server Component (RSC).

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getUser } from '../../actions/_getUser'
import { notFound } from 'next/navigation'
import { updateGasStatus } from '../../actions/updateGas'
import { TruckIcon, FireIcon } from '@heroicons/react/24/outline'

const CarList = async () => {
  const payload = await getPayload({ config: configPromise })
  const user = await getUser()

  if (!user) return notFound()

  try {
    const result = await payload.find({
      collection: 'vehicles',
      overrideAccess: true,
      depth: 2,
    })

    const cars = result.docs

    if (!cars || cars.length === 0) {
      return (
        <div className="w-full rounded-2xl bg-white border border-slate-200 p-6 text-center shadow-xs">
          <TruckIcon className="mx-auto size-8 text-slate-300" />
          <h3 className="mt-2 text-sm font-semibold text-slate-900">No Vehicles</h3>
          <p className="mt-1 text-xs text-slate-400 italic">
            No fleet vehicles currently assigned.
          </p>
        </div>
      )
    }

    return (
      <div className="w-full bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Vehicle Status</h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Which car or fleet asset did you handle today?
            </p>
          </div>
          <div className="h-9 w-9 rounded-xl bg-sky-50 flex items-center justify-center shrink-0">
            <TruckIcon className="h-5 w-5 text-[#41a6f4]" />
          </div>
        </div>

        {/* 2. The form action safely executes your Server Action on submission */}
        <form
          action={async (formData: FormData) => {
            'use server'
            await updateGasStatus(formData)
          }}
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="vehicleId"
              className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2"
            >
              Select Vehicle
            </label>
            <div className="relative">
              <select
                id="vehicleId"
                name="vehicleId"
                className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm font-medium text-slate-800 transition-all focus:border-[#41a6f4] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#41a6f4] appearance-none"
              >
                {cars.map((car) => (
                  <option key={car.id} value={car.id}>
                    {car.name || car.fullTitle} {car.needsGas ? ' ⛽' : ''}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400">
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="needsGas"
              className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2"
            >
              Does this car need refueled?
            </label>
            <div className="relative">
              <select
                id="needsGas"
                name="needsGas"
                className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm font-medium text-slate-800 transition-all focus:border-[#41a6f4] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#41a6f4] appearance-none"
              >
                <option value="false">No — Fuel Levels Are Good</option>
                <option value="true">Yes — Needs Gas</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400">
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="needsGas"
              className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2"
            >
              Current Odometer Reading
            </label>
            <div className="relative">
              <input
                type="text"
                id="odometer"
                name="odometer"
                className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm font-medium text-slate-800 transition-all focus:border-[#41a6f4] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#41a6f4] appearance-none"
              ></input>
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-[#41a6f4] text-white py-3 px-4 rounded-xl font-semibold hover:bg-[#3592dd] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#41a6f4] shadow-sm text-sm"
          >
            <FireIcon className="size-4" />
            Update Car Information
          </button>
        </form>
      </div>
    )
  } catch (err) {
    console.error('Fetch error:', err)
    return notFound()
  }
}

export default CarList
