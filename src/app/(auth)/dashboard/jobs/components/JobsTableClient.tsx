'use client'

import { useState, useMemo } from 'react'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ClockIcon,
  ArrowTopRightOnSquareIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import EditJobModal from '../../components/editJobModal'

const VENUE_TIMEZONE = 'America/Chicago'

function formatDate(isoString?: string) {
  if (!isoString) return 'Flexible'
  return new Date(isoString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: VENUE_TIMEZONE,
  })
}

// Convert ISO string to YYYY-MM-DD in Central Time for date field comparisons
function toCentralYYYYMMDD(isoString?: string) {
  if (!isoString) return ''
  const d = new Date(isoString)
  return d.toLocaleDateString('en-CA', { timeZone: VENUE_TIMEZONE })
}

interface JobsTableClientProps {
  jobs: any[]
  drivers: any[]
  vehicles: any[]
  clients: any[]
  locations: any[]
  isManager?: boolean
}

export default function JobsTableClient({
  jobs = [],
  drivers = [],
  vehicles = [],
  clients = [],
  locations = [],
  isManager = true,
}: JobsTableClientProps) {
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClient, setSelectedClient] = useState('')
  const [selectedDriver, setSelectedDriver] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')

  // Multi-criteria Filtering
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const clientObj = typeof job.client === 'object' ? job.client : null
      const pickupDriverObj = typeof job.pickupDriver === 'object' ? job.pickupDriver : null
      const dropoffDriverObj = typeof job.dropoffDriver === 'object' ? job.dropoffDriver : null
      const vehicleObj = typeof job.vehicle === 'object' ? job.vehicle : null

      const clientName =
        clientObj?.fullName || `${clientObj?.firstName || ''} ${clientObj?.lastName || ''}`.trim()
      const driverName = [
        pickupDriverObj ? `${pickupDriverObj.firstName || ''} ${pickupDriverObj.lastName || ''}` : '',
        dropoffDriverObj
          ? `${dropoffDriverObj.firstName || ''} ${dropoffDriverObj.lastName || ''}`
          : '',
      ]
        .join(' ')
        .trim()
      const vehicleTitle =
        vehicleObj?.name ||
        vehicleObj?.fullTitle ||
        `${vehicleObj?.vehicleMake || ''} ${vehicleObj?.vehicleModel || ''}`.trim()

      // Route stops search matching
      const stopsLocations = Array.isArray(job.stops)
        ? job.stops
            .map((s: any) =>
              typeof s.location === 'object' ? s.location?.name || s.location?.address : '',
            )
            .filter(Boolean)
            .join(' ')
        : ''

      // 1. Text Search (Client Name, Driver Name, Vehicle, Notes, or Stops)
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase()
        const matchesSearch =
          clientName.toLowerCase().includes(term) ||
          driverName.toLowerCase().includes(term) ||
          vehicleTitle.toLowerCase().includes(term) ||
          stopsLocations.toLowerCase().includes(term) ||
          (job.notes && job.notes.toLowerCase().includes(term))

        if (!matchesSearch) return false
      }

      // 2. Client Filter
      if (selectedClient) {
        const clientId = typeof job.client === 'object' ? job.client?.id : job.client
        if (String(clientId) !== String(selectedClient)) return false
      }

      // 3. Driver Filter
      if (selectedDriver) {
        const pickupId =
          typeof job.pickupDriver === 'object' ? job.pickupDriver?.id : job.pickupDriver
        const dropoffId =
          typeof job.dropoffDriver === 'object' ? job.dropoffDriver?.id : job.dropoffDriver

        if (selectedDriver === 'unassigned') {
          if (pickupId || dropoffId) return false
        } else {
          const matches =
            String(pickupId) === String(selectedDriver) ||
            String(dropoffId) === String(selectedDriver)
          if (!matches) return false
        }
      }

      // 4. Status Filter
      if (selectedStatus) {
        if (job.status !== selectedStatus) return false
      }

      // 5. Date Filter (YYYY-MM-DD)
      if (selectedDate) {
        if (!job.startingDateAndTime) return false
        const jobDateStr = toCentralYYYYMMDD(job.startingDateAndTime)
        if (jobDateStr !== selectedDate) return false
      }

      // 6. Location Filter
      if (selectedLocation) {
        const hasLocationMatch = Array.isArray(job.stops)
          ? job.stops.some((s: any) => {
              const locId = typeof s.location === 'object' ? s.location?.id : s.location
              return String(locId) === String(selectedLocation)
            })
          : false

        if (!hasLocationMatch) return false
      }

      return true
    })
  }, [
    jobs,
    searchTerm,
    selectedClient,
    selectedDriver,
    selectedStatus,
    selectedDate,
    selectedLocation,
  ])

  const hasActiveFilters =
    Boolean(searchTerm) ||
    Boolean(selectedClient) ||
    Boolean(selectedDriver) ||
    Boolean(selectedStatus) ||
    Boolean(selectedDate) ||
    Boolean(selectedLocation)

  const resetFilters = () => {
    setSearchTerm('')
    setSelectedClient('')
    setSelectedDriver('')
    setSelectedStatus('')
    setSelectedDate('')
    setSelectedLocation('')
  }

  return (
    <div className="space-y-4">
      {/* FILTER CONTROL BAR */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-3">
        {/* Top Row: Search Input & Filter Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3.5 top-3.5 size-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by client, driver, vehicle, notes, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-[#41a6f4] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#41a6f4] transition-all"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <FunnelIcon className="size-4 text-[#41a6f4]" />
            <span>
              Showing <strong className="text-slate-900">{filteredJobs.length}</strong> of{' '}
              {jobs.length} jobs
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="ml-2 inline-flex items-center gap-1 text-[11px] font-bold text-rose-500 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1 rounded-lg transition-colors"
              >
                <XMarkIcon className="size-3.5" /> Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Bottom Row: Dropdown Selectors */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 text-xs">
          {/* Client Selector */}
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-slate-700 font-medium focus:border-[#41a6f4] focus:bg-white focus:outline-none"
          >
            <option value="">All Clients</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.fullName || `${c.firstName || ''} ${c.lastName || ''}` || c.email}
              </option>
            ))}
          </select>

          {/* Driver Selector */}
          <select
            value={selectedDriver}
            onChange={(e) => setSelectedDriver(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-slate-700 font-medium focus:border-[#41a6f4] focus:bg-white focus:outline-none"
          >
            <option value="">All Drivers</option>
            <option value="unassigned">Unassigned</option>
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.firstName} {d.lastName}
              </option>
            ))}
          </select>

          {/* Status Selector */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-slate-700 font-medium focus:border-[#41a6f4] focus:bg-white focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Location Selector */}
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-slate-700 font-medium focus:border-[#41a6f4] focus:bg-white focus:outline-none"
          >
            <option value="">All Locations</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name || loc.address}
              </option>
            ))}
          </select>

          {/* Date Picker */}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-slate-700 font-medium focus:border-[#41a6f4] focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* JOBS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Client</th>
                <th className="py-3.5 px-4">Scheduled Start</th>
                <th className="py-3.5 px-4">Pickup Driver</th>
                <th className="py-3.5 px-4">Dropoff Driver</th>
                <th className="py-3.5 px-4">Vehicle</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => {
                  const pickupDriverObj =
                    typeof job.pickupDriver === 'object' ? job.pickupDriver : null
                  const dropoffDriverObj =
                    typeof job.dropoffDriver === 'object' ? job.dropoffDriver : null
                  const vehicleObj = typeof job.vehicle === 'object' ? job.vehicle : null
                  const clientObj = typeof job.client === 'object' ? job.client : null

                  return (
                    <tr key={job.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Client */}
                      <td className="py-4 px-4 font-bold text-slate-900">
                        {clientObj?.fullName ||
                          `${clientObj?.firstName || ''} ${clientObj?.lastName || ''}`.trim() ||
                          'Client Trip'}
                      </td>

                      {/* Schedule */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {job.noTime ? (
                          <span className="inline-flex items-center gap-1 text-amber-600 font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                            <ClockIcon className="size-3" /> Flexible
                          </span>
                        ) : (
                          <span>{formatDate(job.startingDateAndTime)}</span>
                        )}
                      </td>

                      {/* Pickup Driver */}
                      <td className="py-4 px-4">
                        {pickupDriverObj ? (
                          <span className="font-semibold text-slate-800">
                            {pickupDriverObj.firstName} {pickupDriverObj.lastName}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>

                      {/* Dropoff Driver */}
                      <td className="py-4 px-4">
                        {dropoffDriverObj ? (
                          <span className="font-semibold text-slate-800">
                            {dropoffDriverObj.firstName} {dropoffDriverObj.lastName}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>

                      {/* Vehicle */}
                      <td className="py-4 px-4">
                        {vehicleObj ? (
                          <span className="text-slate-600">
                            {vehicleObj.name ||
                              vehicleObj.fullTitle ||
                              [
                                vehicleObj.vehicleYear,
                                vehicleObj.vehicleMake,
                                vehicleObj.vehicleModel,
                              ]
                                .filter(Boolean)
                                .join(' ') ||
                              vehicleObj.id}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">None</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            job.status === 'pending'
                              ? 'bg-slate-100 border-slate-200 text-slate-600'
                              : job.status === 'in_progress'
                                ? 'bg-amber-50 border-amber-200 text-amber-700'
                                : job.status === 'completed'
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                  : 'bg-rose-50 border-rose-200 text-rose-700'
                          }`}
                        >
                          {job.status?.replace('_', ' ') || 'Pending'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={`/dashboard/drives/${job.id}`}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                            title="View Job Details"
                          >
                            <ArrowTopRightOnSquareIcon className="size-4" />
                          </a>

                          {/* Edit Modal only accessible to full Managers */}
                          {isManager && (
                            <EditJobModal
                              job={job}
                              drivers={drivers}
                              vehicles={vehicles}
                              clients={clients}
                              locations={locations}
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 italic">
                    No jobs match the specified criteria. Try clearing or adjusting your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
