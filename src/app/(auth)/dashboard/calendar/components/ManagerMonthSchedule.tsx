'use client'

import { useMemo, useState } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isToday,
  getDay,
  addMonths,
  subMonths,
} from 'date-fns'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
} from '@heroicons/react/24/outline'
import AddJobModal from '../../components/AddJobModal'

const VENUE_TIMEZONE = 'America/Chicago'

function toCentralDateString(isoString: string | Date) {
  if (!isoString) return ''
  const d = typeof isoString === 'string' ? new Date(isoString) : isoString
  return d.toLocaleDateString('en-CA', { timeZone: VENUE_TIMEZONE })
}

function formatTime(isoString: string) {
  if (!isoString) return ''
  return new Date(isoString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: VENUE_TIMEZONE,
  })
}

interface ManagerMonthScheduleProps {
  user?: any
  jobs: any[]
  drivers?: any[]
  vehicles?: any[]
  clients?: any[]
  locations?: any[]
}

export default function ManagerMonthSchedule({
  user,
  jobs = [],
  drivers = [],
  vehicles = [],
  clients = [],
  locations = [],
}: ManagerMonthScheduleProps) {
  const isManager = user?.position === 'manager'
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)

  const days = useMemo(() => {
    return eachDayOfInterval({ start: monthStart, end: monthEnd })
  }, [monthStart, monthEnd])

  // Map jobs by date key ('YYYY-MM-DD')
  const jobsByDateMap = useMemo(() => {
    const map = new Map<string, any[]>()

    jobs.forEach((job) => {
      if (!job.date) return
      const dateKey = toCentralDateString(job.date)
      if (!map.has(dateKey)) {
        map.set(dateKey, [])
      }
      map.get(dateKey)!.push(job)
    })

    // Sort jobs on each day chronologically by start time
    map.forEach((dayJobs) => {
      dayJobs.sort((a, b) => {
        if (a.noTime) return 1
        if (b.noTime) return -1
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      })
    })

    return map
  }, [jobs])

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
      {/* HEADER & MONTH NAVIGATION + ADD JOB MODAL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-sky-50 border border-sky-100 text-[#41a6f4]">
            <CalendarDaysIcon className="size-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Master Dispatch Calendar
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Add Job Modal Trigger strictly for Managers */}
          {isManager && (
            <AddJobModal
              drivers={drivers}
              vehicles={vehicles}
              clients={clients}
              locations={locations}
            />
          )}

          {/* Month Navigation Controls */}
          <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
            <button
              type="button"
              onClick={() => setCurrentMonth((prev) => subMonths(prev, 1))}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-xs"
              title="Previous Month"
            >
              <ChevronLeftIcon className="size-4" />
            </button>

            <button
              type="button"
              onClick={() => setCurrentMonth(new Date())}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shadow-xs"
            >
              Today
            </button>

            <button
              type="button"
              onClick={() => setCurrentMonth((prev) => addMonths(prev, 1))}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-xs"
              title="Next Month"
            >
              <ChevronRightIcon className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* DAYS OF WEEK HEADER */}
      <div className="grid grid-cols-7 gap-px border border-slate-200 rounded-t-2xl overflow-hidden text-center text-[11px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 py-2.5">
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
        <div>Sun</div>
      </div>

      {/* FULL-WIDTH MONTH GRID */}
      <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-b-2xl overflow-hidden">
        {days.map((day, dayIdx) => {
          const dayNum = getDay(day)
          // Adjust Monday start (Monday = 1, Sunday = 7)
          const colStart = dayIdx === 0 ? { gridColumnStart: dayNum === 0 ? 7 : dayNum } : {}
          const dateKey = format(day, 'yyyy-MM-dd')
          const dayJobs = jobsByDateMap.get(dateKey) || []
          const isCurrentDay = isToday(day)

          return (
            <div
              key={day.toString()}
              style={colStart}
              className={`min-h-[140px] sm:min-h-[170px] bg-white p-2 flex flex-col justify-start transition-colors ${
                isCurrentDay ? 'bg-sky-50/40 ring-2 ring-inset ring-[#41a6f4]/30' : ''
              }`}
            >
              {/* Day Number Header */}
              <div className="flex items-center justify-between mb-1.5 px-1">
                <span
                  className={`inline-flex items-center justify-center size-6 rounded-full text-xs font-bold ${
                    isCurrentDay ? 'bg-[#41a6f4] text-white shadow-xs' : 'text-slate-700 font-bold'
                  }`}
                >
                  {format(day, 'd')}
                </span>

                {dayJobs.length > 0 && (
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    {dayJobs.length} {dayJobs.length === 1 ? 'drive' : 'drives'}
                  </span>
                )}
              </div>

              {/* Scheduled Drives List for this Day */}
              <div className="flex-1 space-y-1.5 overflow-y-auto max-h-[130px] pr-0.5 custom-scrollbar">
                {dayJobs.map((job) => {
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

                  const driverLabel = samePickupAndDropoff
                    ? formatDriverName(pickupDriverObj)
                    : `${formatDriverName(pickupDriverObj)} → ${formatDriverName(dropoffDriverObj)}`

                  const driverBgColor =
                    pickupDriverObj?.backgroundColor ||
                    pickupDriverObj?.primaryColor ||
                    pickupDriverObj?.color ||
                    '#1a2236'

                  return (
                    <a
                      key={job.id}
                      href={`/dashboard/drives/${job.id}`}
                      style={{ backgroundColor: driverBgColor }}
                      className="group flex flex-col gap-0.5 p-2 rounded-xl text-white text-xs border border-white/10 shadow-xs hover:scale-[1.02] transition-transform"
                    >
                      {/* Time & Status Row */}
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        {job.noTime ? (
                          <span className="text-amber-300 inline-flex items-center gap-0.5">
                            <ClockIcon className="size-3" /> Flex
                          </span>
                        ) : (
                          <span className="text-sky-300">{formatTime(job.date)}</span>
                        )}

                        <span
                          className={`px-1.5 py-0.2 rounded-full uppercase tracking-wider text-[8px] border ${
                            job.status === 'completed'
                              ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                              : job.status === 'in_progress'
                                ? 'bg-amber-500/20 border-amber-400/40 text-amber-300'
                                : job.status === 'cancelled'
                                  ? 'bg-rose-500/20 border-rose-400/40 text-rose-300'
                                  : 'bg-slate-700/60 border-slate-600 text-slate-300'
                          }`}
                        >
                          {job.status?.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Client Name */}
                      <p className="font-bold truncate text-white group-hover:underline underline-offset-2">
                        {job.name}
                      </p>

                      {/* Driver Badge */}
                      <div className="flex items-center gap-1 text-[9px] text-slate-200 mt-0.5 truncate">
                        <UserIcon className="size-3 text-sky-300 shrink-0" />
                        <span className="truncate font-medium">{driverLabel}</span>
                      </div>
                    </a>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
