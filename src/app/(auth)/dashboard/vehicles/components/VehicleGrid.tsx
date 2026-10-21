'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  TruckIcon,
  FireIcon,
  WrenchScrewdriverIcon,
  MagnifyingGlassIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'

interface VehicleGridProps {
  vehicles?: any[]
  maintenanceItems?: any[]
  expenses?: any[]
}

function vehicleIdOf(ref: any) {
  return typeof ref === 'object' ? ref?.id : ref
}

export default function VehicleGrid({
  vehicles = [],
  maintenanceItems = [],
  expenses = [],
}: VehicleGridProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredVehicles = vehicles.filter((v) => {
    const term = searchTerm.toLowerCase()
    return (
      v.name?.toLowerCase().includes(term) ||
      v.fullTitle?.toLowerCase().includes(term) ||
      v.vehicleMake?.toLowerCase().includes(term) ||
      v.vehicleModel?.toLowerCase().includes(term)
    )
  })

  const openItemCountFor = (vehicleId: string) =>
    maintenanceItems.filter(
      (m) => String(vehicleIdOf(m.vehicle)) === String(vehicleId) && m.status !== 'completed',
    ).length

  const expenseTotalFor = (vehicleId: string) =>
    expenses
      .filter((e) => String(vehicleIdOf(e.vehicle)) === String(vehicleId))
      .reduce((sum, e) => sum + (parseFloat(e.price) || 0), 0)

  return (
    <div className="space-y-6">
      {/* Search Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3.5 top-3.5 size-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search vehicles by make, model, or year..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:border-[#41a6f4] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#41a6f4] transition-all"
          />
        </div>
        <div className="text-xs font-semibold text-slate-400 px-1">
          Showing {filteredVehicles.length}{' '}
          {filteredVehicles.length === 1 ? 'vehicle' : 'vehicles'}
        </div>
      </div>

      {/* Grid Layout */}
      {filteredVehicles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVehicles.map((v) => {
            const openCount = openItemCountFor(v.id)
            const totalExpenses = expenseTotalFor(v.id)

            return (
              <Link
                key={v.id}
                href={`?vehicleId=${v.id}`}
                scroll={false}
                className="group bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-[#41a6f4]/60 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
                    <div
                      className="size-11 rounded-xl border border-slate-200 shrink-0"
                      style={{ backgroundColor: v.carColor || '#e2e8f0' }}
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-slate-900 group-hover:text-[#41a6f4] transition-colors truncate text-base">
                        {v.name || v.fullTitle}
                      </h3>
                      <p className="text-xs text-slate-400 font-medium truncate">
                        {v.name ? v.fullTitle : `Odometer: ${v.odometer || 'Not logged'}`}
                      </p>
                    </div>
                    <ChevronRightIcon className="size-4 text-slate-300 group-hover:text-[#41a6f4] group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex flex-wrap gap-1.5">
                      {v.needsGas ? (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                          <FireIcon className="size-3" /> Needs Gas
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                          <FireIcon className="size-3" /> Fuel OK
                        </span>
                      )}
                      {openCount > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-[10px] font-bold text-rose-700 uppercase tracking-wider">
                          <WrenchScrewdriverIcon className="size-3" /> {openCount} Open
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-slate-500 font-medium pt-1">
                      <span>Odometer</span>
                      <span className="font-bold text-slate-700">
                        {v.odometer || 'Not logged'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-500 font-medium">
                      <span>Logged Expenses</span>
                      <span className="font-bold text-slate-700">
                        ${totalExpenses.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-[#41a6f4] font-semibold group-hover:underline">
                    View Details
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs">
          <TruckIcon className="mx-auto size-10 text-slate-300" />
          <h3 className="mt-2 text-sm font-semibold text-slate-900">No vehicles found</h3>
          <p className="mt-1 text-xs text-slate-400 italic">
            Try adjusting your search query or clear filters.
          </p>
        </div>
      )}
    </div>
  )
}
