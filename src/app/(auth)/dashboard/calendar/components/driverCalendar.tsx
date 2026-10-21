'use client'

import { useState, useMemo } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
  startOfToday,
  parseISO,
  getDay,
} from 'date-fns'
import {
  CalendarIcon,
  MapPinIcon,
  DocumentTextIcon,
  FlagIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'

export default function DriverCalendar({ initialJobs = [] }) {
  const today = startOfToday()
  const [selectedDay, setSelectedDay] = useState(today)

  const currentMonthStart = startOfMonth(today)
  const currentMonthEnd = endOfMonth(today)

  const days = useMemo(() => {
    return eachDayOfInterval({
      start: currentMonthStart,
      end: currentMonthEnd,
    })
  }, [currentMonthStart, currentMonthEnd])

  const selectedDayJobs = useMemo(() => {
    return initialJobs.filter((job) => {
      if (!job.date) return false
      return isSameDay(parseISO(job.date), selectedDay)
    })
  }, [initialJobs, selectedDay])

  const hasJob = (day) => initialJobs.some((job) => job.date && isSameDay(parseISO(job.date), day))

  return (
    <div className="min-h-screen bg-slate-50/50 pt-24 pb-12">
      <div className="mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl">
        {/* Header Section */}
        <div className="border-b border-slate-200 pb-6 mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Schedule</h1>
          <p className="mt-2 text-sm text-slate-500 leading-relaxed">
            View and manage your homecare shifts, pickup times, and transit routing rules.
          </p>
        </div>

        {/* Dashboard Dynamic Split Layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          {/* LEFT: SELECTED DAY'S SCHEDULE WORK LIST */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                <h2 className="text-base font-bold text-slate-900">
                  {format(selectedDay, 'EEEE, MMMM d')}
                </h2>
                <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
                  {selectedDayJobs.length}{' '}
                  {selectedDayJobs.length === 1 ? 'Assignment' : 'Assignments'}
                </span>
              </div>

              {selectedDayJobs.length > 0 ? (
                <ol className="divide-y divide-slate-100">
                  {selectedDayJobs.map((job) => (
                    <li key={job.id} className="py-5 first:pt-0 last:pb-0 group">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-bold text-slate-900 group-hover:text-[#41a6f4] transition-colors text-base">
                            {job.name}
                          </h3>
                        </div>
                        <div className="inline-flex items-center gap-1.5 rounded-lg bg-sky-50 px-2.5 py-1 text-xs font-semibold text-[#41a6f4] whitespace-nowrap">
                          <CalendarIcon className="size-3.5" />
                          {format(parseISO(job.date), 'h:mm a')}
                        </div>
                      </div>

                      {/* Route Progression Metadata Grid */}
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 rounded-xl p-4 border border-slate-100">
                        <div className="flex items-start gap-2.5 text-sm">
                          <MapPinIcon className="size-4 text-emerald-500 mt-0.5 shrink-0" />
                          <div>
                            <span className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                              Starting Location
                            </span>
                            <span className="text-slate-700 font-medium">
                              {job.startingLocation || 'Not Specified'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5 text-sm">
                          <FlagIcon className="size-4 text-rose-500 mt-0.5 shrink-0" />
                          <div>
                            <span className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                              Destination
                            </span>
                            <span className="text-slate-700 font-medium">
                              {job.endingLocation || 'Not Specified'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Optional Dispatch Notes Segment */}
                      {job.notes && (
                        <div className="mt-3 flex items-start gap-2 pl-4 text-sm text-slate-500">
                          <DocumentTextIcon className="size-4 text-slate-400 mt-0.5 shrink-0" />
                          <p className="italic leading-relaxed">{job.notes}</p>
                        </div>
                      )}
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="text-center py-12">
                  <CalendarIcon className="mx-auto size-10 text-slate-300" />
                  <p className="mt-3 text-sm font-medium text-slate-500">
                    No homecare runs assigned for this date.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: COMPACT INLINE MONTH CALENDAR CARD */}
          <div className="lg:col-span-5 order-1 lg:order-2">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs sticky top-28">
              {/* Calendar Switcher Bar */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-bold text-slate-900">{format(today, 'MMMM yyyy')}</h2>
                <div className="flex items-center gap-1 rounded-lg border border-slate-200 p-0.5">
                  <button
                    type="button"
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-50 disabled:opacity-50"
                    disabled
                  >
                    <ChevronLeftIcon className="size-4" />
                  </button>
                  <button
                    type="button"
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-50 disabled:opacity-50"
                    disabled
                  >
                    <ChevronRightIcon className="size-4" />
                  </button>
                </div>
              </div>

              {/* Day Titles Matrix Row */}
              <div className="grid grid-cols-7 gap-y-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                <div>M</div>
                <div>T</div>
                <div>W</div>
                <div>T</div>
                <div>F</div>
                <div>S</div>
                <div>S</div>
              </div>

              {/* Day Grid Matrix Elements */}
              <div className="grid grid-cols-7 gap-1 bg-slate-100/50 p-1 rounded-xl border border-slate-100">
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
                        relative flex flex-col items-center justify-center aspect-square rounded-lg transition-all text-sm font-semibold focus:outline-none
                        ${isSelected ? 'bg-[#41a6f4] text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-50'}
                        ${!isSelected && isCurrentDay ? 'ring-2 ring-inset ring-[#41a6f4]/30 text-[#41a6f4]' : ''}
                      `}
                    >
                      <time dateTime={format(day, 'yyyy-MM-dd')}>{format(day, 'd')}</time>

                      {/* Job Alert Dot Marker */}
                      {dayHasJobs && (
                        <span
                          className={`absolute bottom-1.5 size-1 rounded-full ${
                            isSelected ? 'bg-white' : 'bg-[#41a6f4]'
                          }`}
                        />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
