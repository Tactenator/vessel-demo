'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
  getDay,
} from 'date-fns'
import {
  MapPinIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  FlagIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  UserIcon,
} from '@heroicons/react/24/outline'
import AddJobModal from '../components/AddJobModal'

const VENUE_TIMEZONE = 'America/Chicago'

function toCentralDateString(isoString: string | Date) {
  if (!isoString) return ''
  const d = typeof isoString === 'string' ? new Date(isoString) : isoString
  return d.toLocaleDateString('en-CA', { timeZone: VENUE_TIMEZONE })
}

function getCentralTodayDate() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: VENUE_TIMEZONE,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(new Date())

  const map: Record<string, number> = {}
  for (const p of parts) {
    if (p.type !== 'literal') map[p.type] = parseInt(p.value, 10)
  }
  return new Date(map.year, map.month - 1, map.day)
}

function EquipmentBadges({ equipment }: { equipment?: string | string[] }) {
  if (!equipment) return null
  const list = Array.isArray(equipment) ? equipment : [equipment]
  if (list.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-1.5 mt-2">
      {list.includes('wheelchair') && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold uppercase tracking-wider">
          <svg
            className="size-3 text-indigo-400 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
          Wheelchair Required
        </span>
      )}

      {list.includes('gloves') && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
          <svg
            className="size-3 text-amber-400 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3.5V4.5a1.5 1.5 0 013 0V11"
            />
          </svg>
          Gloves Required
        </span>
      )}
    </div>
  )
}

interface HomeClientProps {
  user: any
  jobs: any[]
  drivers?: any[]
  vehicles?: any[]
  clients?: any[]
  locations?: any[]
}

export default function HomeClient({
  user,
  jobs = [],
  drivers = [],
  vehicles = [],
  clients = [],
  locations = [],
}: HomeClientProps) {
  const isManager = user?.position === 'manager'
  const isAssistant = user?.position === 'assistant'
  const isManagerOrAssistant = isManager || isAssistant

  const today = useMemo(() => getCentralTodayDate(), [])
  const [selectedDay, setSelectedDay] = useState<Date>(today)
  const [isMounted, setIsMounted] = useState(false)

  // Filter States
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedClient, setSelectedClient] = useState('')
  const [selectedDriver, setSelectedDriver] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const formatTime = (isoString: string) => {
    if (!isoString) return ''
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: VENUE_TIMEZONE,
    })
  }

  const formatDate = (isoString: string, options: any) => {
    if (!isoString) return ''
    return new Date(isoString).toLocaleString('en-US', {
      ...options,
      timeZone: VENUE_TIMEZONE,
    })
  }

  const currentMonthStart = startOfMonth(today)
  const currentMonthEnd = endOfMonth(today)

  const days = useMemo(() => {
    return eachDayOfInterval({
      start: currentMonthStart,
      end: currentMonthEnd,
    })
  }, [currentMonthStart, currentMonthEnd])

  const dateFilteredJobs = useMemo(() => {
    const targetDateStr = format(isManagerOrAssistant ? selectedDay : today, 'yyyy-MM-dd')
    return jobs.filter((job) => {
      if (!job.date) return false
      return toCentralDateString(job.date) === targetDateStr
    })
  }, [jobs, selectedDay, today, isManagerOrAssistant])

  const activeJobsList = useMemo(() => {
    return dateFilteredJobs.filter((job) => {
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase()
        const clientName = job.name || ''
        const startLoc = job.startingLocation || ''
        const endLoc = job.endingLocation || ''
        const type = job.jobType || ''

        const matchesSearch =
          clientName.toLowerCase().includes(term) ||
          startLoc.toLowerCase().includes(term) ||
          endLoc.toLowerCase().includes(term) ||
          type.toLowerCase().includes(term)

        if (!matchesSearch) return false
      }

      if (selectedStatus && job.status !== selectedStatus) {
        return false
      }

      if (selectedClient) {
        const clientId = typeof job.client === 'object' ? job.client?.id : job.client
        if (String(clientId) !== String(selectedClient)) return false
      }

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

      if (selectedLocation) {
        const rawStops = job.rawJob?.stops || []
        const hasMatch = Array.isArray(rawStops)
          ? rawStops.some((s: any) => {
              const locId = typeof s.location === 'object' ? s.location?.id : s.location
              return String(locId) === String(selectedLocation)
            })
          : false

        if (!hasMatch) return false
      }

      return true
    })
  }, [
    dateFilteredJobs,
    searchTerm,
    selectedStatus,
    selectedClient,
    selectedDriver,
    selectedLocation,
  ])

  const hasJob = (day: Date) => {
    const dayStr = format(day, 'yyyy-MM-dd')
    return jobs.some((job) => job.date && toCentralDateString(job.date) === dayStr)
  }

  const hasActiveFilters =
    Boolean(searchTerm) ||
    Boolean(selectedStatus) ||
    Boolean(selectedClient) ||
    Boolean(selectedDriver) ||
    Boolean(selectedLocation)

  const resetFilters = () => {
    setSearchTerm('')
    setSelectedStatus('')
    setSelectedClient('')
    setSelectedDriver('')
    setSelectedLocation('')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 mb-6 gap-4">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Dispatch Workspace
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900" suppressHydrationWarning>
            {isManagerOrAssistant
              ? `Schedule • ${format(selectedDay, 'EEEE, MMMM d, yyyy')}`
              : `Today's Drives • ${format(today, 'MMMM d, yyyy')}`}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 rounded-xl bg-white px-4 py-2 border border-slate-200 text-xs font-semibold text-slate-600 shadow-xs">
            <CalendarIcon className="size-4 text-[#41a6f4]" />
            <span>{activeJobsList.length} Dispatched</span>
          </div>

          {/* AddJobModal strictly for managers */}
          {isManager && (
            <AddJobModal
              drivers={drivers}
              vehicles={vehicles}
              clients={clients}
              locations={locations}
            />
          )}
        </div>
      </div>

      {/* DASHBOARD GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* MAIN COLUMN: DRIVES LIST & FILTERS */}
        <div className={`${isManagerOrAssistant ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-4`}>
          {/* SEARCH & FILTER BAR */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3.5 top-3.5 size-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter drives by client, location, or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-[#41a6f4] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#41a6f4] transition-all"
                />
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-500 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1.5 rounded-xl transition-colors shrink-0"
                >
                  <XMarkIcon className="size-3.5" /> Clear Filters
                </button>
              )}
            </div>

            {/* DROPDOWN FILTERS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-2.5 py-1.5 text-slate-700 font-medium focus:border-[#41a6f4] focus:bg-white focus:outline-none"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              {isManagerOrAssistant && (
                <select
                  value={selectedDriver}
                  onChange={(e) => setSelectedDriver(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-2.5 py-1.5 text-slate-700 font-medium focus:border-[#41a6f4] focus:bg-white focus:outline-none"
                >
                  <option value="">All Drivers</option>
                  <option value="unassigned">Unassigned</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.firstName} {d.lastName}
                    </option>
                  ))}
                </select>
              )}

              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-2.5 py-1.5 text-slate-700 font-medium focus:border-[#41a6f4] focus:bg-white focus:outline-none"
              >
                <option value="">All Clients</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName || `${c.firstName || ''} ${c.lastName || ''}` || c.email}
                  </option>
                ))}
              </select>

              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-2.5 py-1.5 text-slate-700 font-medium focus:border-[#41a6f4] focus:bg-white focus:outline-none"
              >
                <option value="">All Locations</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name || loc.address}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {isManagerOrAssistant && !isSameDay(selectedDay, today)
                ? `Runs for ${format(selectedDay, 'MMM d')}`
                : "Today's Active Drives"}
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              Showing {activeJobsList.length} items
            </span>
          </div>

          {activeJobsList.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
              <CalendarIcon className="mx-auto size-10 text-slate-300 mb-3" />
              <p className="text-sm font-medium text-slate-500">
                No drives match your current view or filter criteria.
              </p>
            </div>
          ) : (
            <div
              className={`grid grid-cols-1 ${
                isManagerOrAssistant ? 'grid-cols-1' : 'md:grid-cols-2 lg:grid-cols-3'
              } gap-4`}
            >
              {activeJobsList.map((job) => {
                const scheduledStart = new Date(job.date)

                const needsStartReminder =
                  isMounted &&
                  !job.noTime &&
                  new Date() > scheduledStart &&
                  job.status === 'pending'

                const equipment = job.equipmentNeeded || job.rawJob?.equipmentNeeded

                const pickupDriverObj =
                  typeof job.pickupDriver === 'object' ? job.pickupDriver : null
                const dropoffDriverObj =
                  typeof job.dropoffDriver === 'object' ? job.dropoffDriver : null

                const formatDriverName = (driverObj: any) =>
                  driverObj
                    ? `${driverObj.firstName || ''} ${driverObj.lastName || ''}`.trim() ||
                      driverObj.email
                    : 'Unassigned'

                const samePickupAndDropoff =
                  (pickupDriverObj?.id ?? null) === (dropoffDriverObj?.id ?? null)

                const pickupDriverName = formatDriverName(pickupDriverObj)
                const dropoffDriverName = formatDriverName(dropoffDriverObj)

                const pickupDriverColor =
                  pickupDriverObj?.primaryColor || pickupDriverObj?.backgroundColor || '#334155'
                const dropoffDriverColor =
                  dropoffDriverObj?.primaryColor || dropoffDriverObj?.backgroundColor || '#334155'

                return (
                  <a
                    href={`/dashboard/drives/${job.id}`}
                    key={job.id}
                    className={`group relative flex flex-col justify-between rounded-2xl bg-[#1a2236] text-white p-5 border shadow-xs transition-all hover:shadow-md hover:border-[#41a6f4]/50 active:scale-[0.99] ${
                      needsStartReminder
                        ? 'border-amber-500/50 ring-2 ring-amber-500/20'
                        : 'border-white/10'
                    }`}
                  >
                    <div className="space-y-4">
                      {/* Start Reminder Alert Badge */}
                      {needsStartReminder && (
                        <div className="flex items-center gap-x-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 px-3 py-1.5 rounded-xl animate-pulse">
                          <ExclamationTriangleIcon className="size-4 shrink-0 text-amber-400" />
                          <span className="text-[11px] font-bold uppercase tracking-wider">
                            Needs Attention: Start Timer
                          </span>
                        </div>
                      )}

                      {/* Header Row */}
                      <div className="flex items-center justify-between">
                        <div
                          className={`inline-flex items-center gap-x-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                            job.status === 'pending'
                              ? 'bg-slate-800 border-slate-700 text-slate-300'
                              : job.status === 'in_progress'
                                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                                : job.status === 'completed'
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                          }`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${
                              job.status === 'pending'
                                ? 'bg-slate-400'
                                : job.status === 'in_progress'
                                  ? 'bg-amber-400 animate-pulse'
                                  : job.status === 'completed'
                                    ? 'bg-emerald-400'
                                    : 'bg-rose-400'
                            }`}
                          />
                          <span className="text-[10px]">{job.status?.replace('_', ' ')}</span>
                        </div>

                        {/* Smart Time / Flexible Display */}
                        <div className="text-right">
                          {job.noTime ? (
                            <p className="text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                              <ClockIcon className="size-3" /> Flexible Time
                            </p>
                          ) : (
                            <p
                              className="text-sm font-bold text-[#41a6f4]"
                              suppressHydrationWarning
                            >
                              {formatTime(job.date)}
                            </p>
                          )}
                          <p
                            className="text-[11px] font-medium text-slate-400 uppercase mt-0.5"
                            suppressHydrationWarning
                          >
                            {formatDate(job.date, {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Client Info & Badges */}
                      <div>
                        <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-[#41a6f4] transition-colors">
                          {job.name}
                        </h3>

                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {/* DRIVER BADGE(S) */}
                          {samePickupAndDropoff ? (
                            <span
                              style={{ backgroundColor: pickupDriverColor }}
                              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider border border-white/20 shadow-xs"
                            >
                              <UserIcon className="size-3 text-white/80" />
                              {pickupDriverName}
                            </span>
                          ) : (
                            <>
                              <span
                                style={{ backgroundColor: pickupDriverColor }}
                                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider border border-white/20 shadow-xs"
                              >
                                <UserIcon className="size-3 text-white/80" />
                                Pickup: {pickupDriverName}
                              </span>
                              <span
                                style={{ backgroundColor: dropoffDriverColor }}
                                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider border border-white/20 shadow-xs"
                              >
                                <UserIcon className="size-3 text-white/80" />
                                Dropoff: {dropoffDriverName}
                              </span>
                            </>
                          )}

                          {job.jobType && (
                            <span className="rounded-lg bg-sky-500/10 border border-sky-500/30 px-2.5 py-0.5 text-[10px] font-bold text-[#41a6f4] uppercase tracking-wider">
                              {job.jobType}
                            </span>
                          )}
                          {job.stopCount > 2 && (
                            <span className="rounded-lg bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-0.5 text-[10px] font-bold text-indigo-300 uppercase tracking-wider">
                              {job.stopCount} Stops
                            </span>
                          )}
                          {(job.vehicle?.name || job.vehicle?.fullTitle) && (
                            <span className="rounded-lg bg-white/5 border border-white/10 px-2.5 py-0.5 text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                              {job.vehicle.name || job.vehicle.fullTitle}
                            </span>
                          )}
                        </div>

                        {/* EQUIPMENT NEEDED BADGES */}
                        <EquipmentBadges equipment={equipment} />
                      </div>

                      {/* Address Grid */}
                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/5">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-x-1.5">
                            <MapPinIcon className="size-3.5 text-[#41a6f4] shrink-0" />
                            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                              Pickup
                            </span>
                          </div>
                          <p className="text-xs font-bold text-slate-200 truncate">
                            {job.startingLocation}
                          </p>
                        </div>

                        <div className="space-y-0.5 border-l border-white/5 pl-3">
                          <div className="flex items-center gap-x-1.5">
                            <FlagIcon className="size-3.5 text-rose-400 shrink-0" />
                            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                              Dropoff
                            </span>
                          </div>
                          <p className="text-xs font-bold text-slate-200 truncate">
                            {job.endingLocation}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Footer Link */}
                    <div className="mt-4 flex items-center justify-between pt-2 border-t border-white/5 text-xs font-bold text-[#41a6f4]">
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                        View Details
                      </span>
                      <ChevronRightIcon className="size-4 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </a>
                )
              })}
            </div>
          )}
        </div>

        {/* SIDE PANEL: MANAGER & ASSISTANT INTERACTIVE CALENDAR */}
        {isManagerOrAssistant && (
          <div className="lg:col-span-5">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs sticky top-28 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  {format(today, 'MMMM yyyy')}
                </h2>
                <span className="text-xs font-semibold px-2 py-0.5 bg-sky-50 text-[#41a6f4] rounded-md border border-sky-100">
                  {isManager ? 'Manager View' : 'Assistant View'}
                </span>
              </div>

              {/* Day Titles */}
              <div className="grid grid-cols-7 gap-y-2 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <div>M</div>
                <div>T</div>
                <div>W</div>
                <div>T</div>
                <div>F</div>
                <div>S</div>
                <div>S</div>
              </div>

              {/* Calendar Grid Matrix */}
              <div className="grid grid-cols-7 gap-1 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                {days.map((day, dayIdx) => {
                  const dayNum = getDay(day)
                  const colStart =
                    dayIdx === 0 ? { gridColumnStart: dayNum === 0 ? 7 : dayNum } : {}
                  const isSelected = isSameDay(day, selectedDay)
                  const isCurrentDay = isToday(day)
                  const dayHasJobs = hasJob(day)

                  return (
                    <button
                      key={day.toString()}
                      type="button"
                      onClick={() => setSelectedDay(day)}
                      style={colStart}
                      className={`
                        relative flex flex-col items-center justify-center aspect-square rounded-lg transition-all text-xs font-bold focus:outline-none
                        ${
                          isSelected
                            ? 'bg-[#41a6f4] text-white shadow-xs'
                            : 'bg-white text-slate-700 hover:bg-slate-100/80 border border-slate-100'
                        }
                        ${
                          !isSelected && isCurrentDay
                            ? 'ring-2 ring-inset ring-[#41a6f4]/40 text-[#41a6f4]'
                            : ''
                        }
                      `}
                    >
                      <time dateTime={format(day, 'yyyy-MM-dd')}>{format(day, 'd')}</time>

                      {dayHasJobs && (
                        <span
                          className={`absolute bottom-1 size-1 rounded-full ${
                            isSelected ? 'bg-white' : 'bg-[#41a6f4]'
                          }`}
                        />
                      )}
                    </button>
                  )
                })}
              </div>

              {!isSameDay(selectedDay, today) && (
                <button
                  type="button"
                  onClick={() => setSelectedDay(today)}
                  className="w-full py-2 text-xs font-bold text-[#41a6f4] bg-sky-50 hover:bg-sky-100/60 rounded-xl transition-colors border border-sky-100"
                >
                  Jump to Today
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
