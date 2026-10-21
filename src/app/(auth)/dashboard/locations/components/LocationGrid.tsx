'use client'

import { useState } from 'react'
import { MapPinIcon, PhoneIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import EditLocationModal from './EditLocationModal'

interface LocationGridProps {
  locations?: any[]
  isManager?: boolean
}

export default function LocationGrid({ locations = [], isManager = false }: LocationGridProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredLocations = locations.filter((location) => {
    const term = searchTerm.toLowerCase()
    return (
      location.name?.toLowerCase().includes(term) ||
      location.address?.toLowerCase().includes(term) ||
      location.phoneNumber?.toLowerCase().includes(term)
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
            placeholder="Search locations by name, address, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:border-[#41a6f4] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#41a6f4] transition-all"
          />
        </div>
        <div className="text-xs font-semibold text-slate-400 px-1">
          Showing {filteredLocations.length}{' '}
          {filteredLocations.length === 1 ? 'location' : 'locations'}
        </div>
      </div>

      {/* Grid Layout */}
      {filteredLocations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLocations.map((location) => (
            <div
              key={location.id}
              className="group bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-[#41a6f4]/60 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
                <div className="size-11 rounded-xl bg-sky-50 flex items-center justify-center shrink-0">
                  <MapPinIcon className="size-5 text-[#41a6f4]" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-slate-900 truncate text-base">{location.name}</h3>
                </div>
                {isManager && <EditLocationModal location={location} />}
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-start gap-2.5 text-slate-600">
                  <MapPinIcon className="size-4 text-slate-400 shrink-0 mt-0.5" />
                  <span className="font-medium line-clamp-2">{location.address}</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-600">
                  <PhoneIcon className="size-4 text-slate-400 shrink-0" />
                  <span className="font-medium">{location.phoneNumber}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs">
          <MapPinIcon className="mx-auto size-10 text-slate-300" />
          <h3 className="mt-2 text-sm font-semibold text-slate-900">No locations found</h3>
          <p className="mt-1 text-xs text-slate-400 italic">
            Try adjusting your search query or clear filters.
          </p>
        </div>
      )}
    </div>
  )
}
