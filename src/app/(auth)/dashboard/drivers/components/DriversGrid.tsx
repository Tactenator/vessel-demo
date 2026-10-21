'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  UserIcon,
  PhoneIcon,
  MagnifyingGlassIcon,
  ChevronRightIcon,
  BriefcaseIcon,
} from '@heroicons/react/24/outline'
import EditDriverModal from '../../components/EditDriverModal'
import DeleteDriverModal from '../../components/DeleteDriverModal'

interface DriverGridProps {
  drivers?: any[]
  isManager?: boolean
}

export default function DriverGrid({ drivers = [], isManager = true }: DriverGridProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredDrivers = drivers.filter((driver) => {
    const term = searchTerm.toLowerCase()
    const name = `${driver.firstName || ''} ${driver.lastName || ''}`.trim()
    return (
      name.toLowerCase().includes(term) ||
      driver.email?.toLowerCase().includes(term) ||
      driver.phoneNumber?.toLowerCase().includes(term)
    )
  })

  return (
    <div className="space-y-6">
      {/* Search Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3.5 top-3.5 size-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search drivers by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:border-[#41a6f4] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#41a6f4] transition-all"
          />
        </div>
        <div className="text-xs font-semibold text-slate-400 px-1">
          Showing {filteredDrivers.length} {filteredDrivers.length === 1 ? 'driver' : 'drivers'}
        </div>
      </div>

      {/* Grid Layout */}
      {filteredDrivers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDrivers.map((driver) => {
            const avatarUrl = driver.avatar?.url || driver.picture?.url || null
            const fullName = `${driver.firstName || ''} ${driver.lastName || ''}`.trim() || 'Driver'
            const isActive = driver.active === true

            return (
              <div
                key={driver.id}
                className="group bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-[#41a6f4]/60 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <Link href={`?driverId=${driver.id}`} scroll={false}>
                  <div>
                    {/* Card Header: Avatar & Name */}
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={fullName}
                          className="size-11 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-200/80"
                        />
                      ) : (
                        <div className="size-11 rounded-xl bg-sky-50 flex items-center justify-center font-bold text-[#41a6f4] text-base shrink-0 border border-sky-100">
                          {driver.firstName?.charAt(0) || 'D'}
                          {driver.lastName?.charAt(0) || ''}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 group-hover:text-[#41a6f4] transition-colors truncate text-base">
                            {fullName}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-400 font-medium truncate">
                          {driver.email}
                        </p>
                      </div>
                      <ChevronRightIcon className="size-4 text-slate-300 group-hover:text-[#41a6f4] group-hover:translate-x-0.5 transition-all shrink-0" />
                    </div>

                    {/* Card Details & Active Status */}
                    <div className="space-y-2.5 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 text-slate-600">
                          <PhoneIcon className="size-4 text-slate-400 shrink-0" />
                          <span className="font-medium">{driver.phoneNumber || 'No phone'}</span>
                        </div>

                        {/* Active Status Badge */}
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${
                              isActive ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 text-slate-600">
                        <BriefcaseIcon className="size-4 text-slate-400 shrink-0" />
                        <span className="font-semibold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                          {driver.address || 'No address'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 text-slate-600">
                        <BriefcaseIcon className="size-4 text-slate-400 shrink-0" />
                        <span className="font-semibold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                          {driver.position || 'Driver'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Footer Action Bar */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <Link
                    href={`?driverId=${driver.id}`}
                    scroll={false}
                    className="text-[#41a6f4] font-semibold hover:underline"
                  >
                    View Profile
                  </Link>

                  {/* Edit/Delete Driver Modals strictly for full managers */}
                  {isManager && (
                    <div className="flex items-center gap-2">
                      <EditDriverModal driver={driver} />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs">
          <UserIcon className="mx-auto size-10 text-slate-300" />
          <h3 className="mt-2 text-sm font-semibold text-slate-900">No drivers found</h3>
          <p className="mt-1 text-xs text-slate-400 italic">Try adjusting your search terms.</p>
        </div>
      )}
    </div>
  )
}
