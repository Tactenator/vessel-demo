'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  UserIcon,
  PhoneIcon,
  MapPinIcon,
  MagnifyingGlassIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'
import EditClientModal from './EditClientModal'

interface ClientGridProps {
  clients?: any[]
  isManager?: boolean
}

export default function ClientGrid({ clients = [], isManager = false }: ClientGridProps) {
  const [searchTerm, setSearchTerm] = useState('')

  // Filter clients dynamically by name, address, or phone number
  const filteredClients = clients.filter((client) => {
    const term = searchTerm.toLowerCase()
    const name = client.fullName || `${client.firstName} ${client.lastName}`
    return (
      name.toLowerCase().includes(term) ||
      client.phoneNumber?.toLowerCase().includes(term) ||
      client.address?.toLowerCase().includes(term)
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
            placeholder="Search clients by name, phone, or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:border-[#41a6f4] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#41a6f4] transition-all"
          />
        </div>
        <div className="text-xs font-semibold text-slate-400 px-1">
          Showing {filteredClients.length} {filteredClients.length === 1 ? 'client' : 'clients'}
        </div>
      </div>

      {/* Grid Layout */}
      {filteredClients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClients.map((client) => {
            const avatarImage =
              Array.isArray(client.pictures) && client.pictures[0]?.url
                ? client.pictures[0].url
                : null

            return (
              <div
                key={client.id}
                className="group bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-[#41a6f4]/60 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <Link href={`?clientId=${client.id}`} scroll={false}>
                  <div>
                    {/* Card Header: Avatar & Name */}
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
                      {avatarImage ? (
                        <img
                          src={avatarImage}
                          alt={client.fullName}
                          className="size-11 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-200/80"
                        />
                      ) : (
                        <div className="size-11 rounded-xl bg-sky-50 flex items-center justify-center font-bold text-[#41a6f4] text-base shrink-0">
                          {client.firstName?.charAt(0)}
                          {client.lastName?.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-slate-900 group-hover:text-[#41a6f4] transition-colors truncate text-base">
                          {client.fullName || `${client.firstName} ${client.lastName}`}
                        </h3>
                        <p className="text-xs text-slate-400 font-medium truncate">
                          {client.email}
                        </p>
                      </div>
                      <ChevronRightIcon className="size-4 text-slate-300 group-hover:text-[#41a6f4] group-hover:translate-x-0.5 transition-all shrink-0" />
                    </div>

                    {/* Card Details */}
                    <div className="space-y-2.5 text-xs">
                      <div className="flex items-center gap-2.5 text-slate-600">
                        <PhoneIcon className="size-4 text-slate-400 shrink-0" />
                        <span className="font-medium">{client.phoneNumber}</span>
                      </div>
                      <div className="flex items-start gap-2.5 text-slate-600">
                        <MapPinIcon className="size-4 text-slate-400 shrink-0 mt-0.5" />
                        <span className="font-medium line-clamp-2">
                          {client.address} {client.zipCode ? `, ${client.zipCode}` : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Footer Badge & Quick Action */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <Link
                    href={`?clientId=${client.id}`}
                    scroll={false}
                    className="text-[#41a6f4] font-semibold hover:underline"
                  >
                    View Details
                  </Link>

                  {/* Inline Edit Button strictly for Managers */}
                  {isManager && <EditClientModal client={client} />}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs">
          <UserIcon className="mx-auto size-10 text-slate-300" />
          <h3 className="mt-2 text-sm font-semibold text-slate-900">No clients found</h3>
          <p className="mt-1 text-xs text-slate-400 italic">
            Try adjusting your search query or clear filters.
          </p>
        </div>
      )}
    </div>
  )
}
