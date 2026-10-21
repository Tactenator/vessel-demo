import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getUser } from '../actions/_getUser'
import OnCall from '../calendar/components/onCall'
import EditDriverScheduleModal from '../components/editDriverScheduleModal'
import ScheduleWeekNavigator from '../components/ScheduleWeekNavigator'

// Helper to calculate target week's boundaries (Monday 00:00:00 – Sunday 23:59:59)
function getWeekRange(targetDateStr?: string) {
  let baseDate: Date

  if (targetDateStr) {
    const [year, month, day] = targetDateStr.split('-').map(Number)
    baseDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0))
  } else {
    baseDate = new Date()
  }

  const dayOfWeek = baseDate.getUTCDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek

  const monday = new Date(baseDate)
  monday.setUTCDate(baseDate.getUTCDate() + mondayOffset)
  monday.setUTCHours(0, 0, 0, 0)

  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(monday)
    d.setUTCDate(monday.getUTCDate() + i)
    return d
  })

  const start = new Date(monday)
  const end = new Date(monday)
  end.setUTCDate(monday.getUTCDate() + 6)
  end.setUTCHours(23, 59, 59, 999)

  return { days, start, end }
}

export default async function WeeklyScheduleGrid({
  searchParams,
}: {
  searchParams?: Promise<{ week?: string }>
}) {
  const resolvedParams = searchParams ? await searchParams : {}
  const weekParam = resolvedParams.week

  const user = await getUser()
  const isManager = user?.position === 'manager'

  const payload = await getPayload({ config: configPromise })
  const { days, start, end } = getWeekRange(weekParam)

  // Today's UTC calendar-day bounds, used for the daily roster below.
  // Kept as a UTC day (not a local/Chicago day) to match todayString further
  // down, which the week grid already uses to highlight "today"'s column.
  const todayStart = new Date()
  todayStart.setUTCHours(0, 0, 0, 0)
  const todayEnd = new Date(todayStart)
  todayEnd.setUTCHours(23, 59, 59, 999)

  // 1. Fetch shifts scheduled for target week range, drivers, and today's jobs in parallel
  const [shiftsResult, driversResult, jobsResult] = await Promise.all([
    payload.find({
      collection: 'schedule',
      where: {
        and: [
          { date: { greater_than_equal: start.toISOString() } },
          { date: { less_than_equal: end.toISOString() } },
        ],
      },
      depth: 1,
      limit: 0,
    }),
    payload.find({
      collection: 'drivers',
      limit: 0,
    }),
    payload.find({
      collection: 'jobs',
      where: {
        and: [
          { startingDateAndTime: { greater_than_equal: todayStart.toISOString() } },
          { startingDateAndTime: { less_than_equal: todayEnd.toISOString() } },
        ],
      },
      depth: 1,
      limit: 0,
      overrideAccess: true,
    }),
  ])

  // 2. HashMap lookup structure (using YYYY-MM-DD from UTC date)
  const scheduleLookup: Record<string, Record<string, any>> = {}

  shiftsResult.docs.forEach((shift: any) => {
    const driverId = typeof shift.driver === 'object' ? shift.driver.id : shift.driver
    if (!driverId) return

    const dateString = new Date(shift.date).toISOString().split('T')[0]

    if (!scheduleLookup[driverId]) {
      scheduleLookup[driverId] = {}
    }
    scheduleLookup[driverId][dateString] = shift
  })

  // 3. Group today's jobs by driver (a job counts for both its pickup and dropoff
  // driver, but only once each even if the same driver covers both legs)
  const jobsByDriver: Record<string, any[]> = {}
  jobsResult.docs.forEach((job: any) => {
    if (job.status === 'cancelled') return
    const driverIds = new Set<string>()
    ;[job.pickupDriver, job.dropoffDriver].forEach((d) => {
      const id = typeof d === 'object' ? d?.id : d
      if (id) driverIds.add(id)
    })
    driverIds.forEach((driverId) => {
      if (!jobsByDriver[driverId]) jobsByDriver[driverId] = []
      jobsByDriver[driverId].push(job)
    })
  })

  const getClientName = (client: any) =>
    client?.fullName || `${client?.firstName || ''} ${client?.lastName || ''}`.trim() || 'Client'

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  }

  const todayString = new Date().toISOString().split('T')[0]

  // 4. Build today's roster: one row per driver with their shift status,
  // current/next ride, ride count, and on-call flag for today.
  const roster = driversResult.docs
    .map((driver: any) => {
      const shiftToday = scheduleLookup[driver.id]?.[todayString]
      const jobsToday = (jobsByDriver[driver.id] || []).slice().sort(
        (a: any, b: any) =>
          new Date(a.startingDateAndTime).getTime() - new Date(b.startingDateAndTime).getTime(),
      )

      const activeJob = jobsToday.find((j: any) => j.status === 'in_progress')
      const nextJob = jobsToday.find((j: any) => j.status === 'pending')
      const displayJob = activeJob || nextJob || null

      const statusKey = !shiftToday ? 'off' : activeJob ? 'on_route' : 'available'

      return {
        driver,
        shiftToday,
        onCallToday: shiftToday?.onCall === true,
        ridesToday: jobsToday.length,
        displayJob,
        isJobActive: !!activeJob,
        statusKey,
      }
    })
    .sort((a: any, b: any) => {
      const order: Record<string, number> = { on_route: 0, available: 1, off: 2 }
      if (order[a.statusKey] !== order[b.statusKey]) return order[a.statusKey] - order[b.statusKey]
      const nameA = `${a.driver.firstName || ''} ${a.driver.lastName || ''}`.trim()
      const nameB = `${b.driver.firstName || ''} ${b.driver.lastName || ''}`.trim()
      return nameA.localeCompare(nameB)
    })

  const statusBadge: Record<string, { label: string; className: string }> = {
    on_route: { label: 'On Route', className: 'bg-sky-50 border-sky-200 text-sky-700' },
    available: { label: 'Available', className: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
    off: { label: 'Off Today', className: 'bg-slate-100 border-slate-200 text-slate-500' },
  }

  const startStr = start.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
  const endStr = end.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })

  return (
    <main className="lg:pl-72 p-4 md:p-8 bg-slate-50/50 min-h-screen antialiased space-y-6">
      {/* TODAY'S ROSTER */}
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xs border border-slate-200 p-6 md:p-8">
        <div className="mb-6 border-b border-slate-100 pb-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Live Roster
          </p>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Today&apos;s Drivers</h2>
        </div>

        {/* MOBILE VIEW */}
        <div className="block md:hidden space-y-3">
          {roster.map(({ driver, onCallToday, ridesToday, displayJob, statusKey }) => {
            const driverName = `${driver.firstName || ''} ${driver.lastName || ''}`.trim()
            const badge = statusBadge[statusKey]

            return (
              <div
                key={driver.id}
                className={`border border-slate-200 rounded-2xl p-4 ${
                  statusKey === 'off' ? 'bg-slate-50/60 opacity-70' : 'bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-bold text-sm text-slate-900">{driverName}</span>
                  <div className="flex items-center gap-1.5">
                    {onCallToday && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-amber-50 border-amber-200 text-amber-700">
                        On Call
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-slate-600">
                  {displayJob ? (
                    <span>
                      {getClientName(displayJob.client)} &middot;{' '}
                      {displayJob.status === 'in_progress' ? 'In progress' : 'Next'} at{' '}
                      {formatTime(displayJob.startingDateAndTime)}
                    </span>
                  ) : (
                    <span className="text-slate-400 italic">No rides today</span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 font-medium">
                  {ridesToday} {ridesToday === 1 ? 'ride' : 'rides'} today
                </div>
              </div>
            )
          })}
        </div>

        {/* DESKTOP VIEW */}
        <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-left">
                <th className="p-3.5 font-bold text-xs uppercase tracking-wider text-slate-400">
                  Driver
                </th>
                <th className="p-3.5 font-bold text-xs uppercase tracking-wider text-slate-400">
                  Job
                </th>
                <th className="p-3.5 font-bold text-xs uppercase tracking-wider text-slate-400">
                  Status
                </th>
                <th className="p-3.5 font-bold text-xs uppercase tracking-wider text-slate-400">
                  Rides Today
                </th>
                <th className="p-3.5 font-bold text-xs uppercase tracking-wider text-slate-400">
                  On Call
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {roster.map(({ driver, onCallToday, ridesToday, displayJob, statusKey }) => {
                const driverName = `${driver.firstName || ''} ${driver.lastName || ''}`.trim()
                const badge = statusBadge[statusKey]

                return (
                  <tr
                    key={driver.id}
                    className={statusKey === 'off' ? 'bg-slate-50/50 text-slate-400' : ''}
                  >
                    <td className="p-3.5 font-bold text-sm text-slate-900">
                      {driverName}
                      <p className="text-xs font-normal text-slate-400">{driver.phoneNumber}</p>
                    </td>
                    <td className="p-3.5 text-xs text-slate-600 max-w-xs">
                      {displayJob ? (
                        <div>
                          <span className="font-semibold text-slate-800">
                            {getClientName(displayJob.client)}
                          </span>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {displayJob.status === 'in_progress' ? 'In progress' : 'Next'} at{' '}
                            {formatTime(displayJob.startingDateAndTime)}
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No rides today</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td className="p-3.5 text-sm font-semibold text-slate-700">{ridesToday}</td>
                    <td className="p-3.5">
                      {onCallToday ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-amber-50 border-amber-200 text-amber-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                          On Call
                        </span>
                      ) : (
                        <span className="text-slate-300 text-xs">&mdash;</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* WEEKLY SHIFT GRID */}
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xs border border-slate-200 p-6 md:p-8">
        <div className="mb-6 border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              Roster & Shift Matrix
            </p>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Driver Weekly Schedule
            </h2>
          </div>

          {/* Week Date Picker & Navigator */}
          <ScheduleWeekNavigator startOfWeekStr={startStr} endOfWeekStr={endStr} />
        </div>

        {/* MOBILE VIEW */}
        <div className="block md:hidden space-y-6">
          {driversResult.docs.map((driver: any) => {
            const driverShiftsMap = scheduleLookup[driver.id] || {}
            const driverShifts = Object.values(driverShiftsMap).sort(
              (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime(),
            )

            const driverName = `${driver.firstName || ''} ${driver.lastName || ''}`.trim()

            return (
              <div
                key={driver.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs"
              >
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{driverName}</h3>
                    <span className="text-xs text-slate-500">{driver.phoneNumber}</span>
                  </div>

                  {/* Schedule edit modal for managers only */}
                  {isManager && (
                    <EditDriverScheduleModal
                      driver={driver}
                      weekDays={days}
                      scheduleLookup={scheduleLookup}
                      isManager={isManager}
                    />
                  )}
                </div>

                <div className="divide-y divide-slate-100">
                  {driverShifts.length > 0 ? (
                    driverShifts.map((shift: any) => {
                      const shiftDate = new Date(shift.date)
                      const dayStr = shiftDate.toISOString().split('T')[0]
                      const isToday = dayStr === todayString

                      return (
                        <div
                          key={shift.id}
                          className={`p-4 flex items-start gap-4 ${isToday ? 'bg-sky-50/40' : ''}`}
                        >
                          <div className="text-center min-w-[50px]">
                            <div
                              className={`text-xs font-bold uppercase tracking-wider ${
                                isToday ? 'text-[#41a6f4]' : 'text-slate-400'
                              }`}
                            >
                              {shiftDate.toLocaleDateString([], {
                                weekday: 'short',
                                timeZone: 'UTC',
                              })}
                            </div>
                            <div
                              className={`text-lg font-extrabold leading-tight mt-0.5 ${
                                isToday ? 'text-slate-900' : 'text-slate-800'
                              }`}
                            >
                              {shiftDate.toLocaleDateString([], {
                                day: 'numeric',
                                timeZone: 'UTC',
                              })}
                            </div>
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                  shift.onCall
                                    ? 'bg-amber-50 border-amber-200 text-amber-700'
                                    : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                }`}
                              >
                                {shift.onCall ? 'On Call' : 'Active Shift'}
                              </span>
                            </div>

                            {!shift.onCall && (
                              <div className="text-xs font-bold text-slate-700">
                                {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                              </div>
                            )}

                            {shift.notes && (
                              <p className="text-xs text-slate-500 mt-1 bg-slate-50 p-2 rounded-lg border border-slate-100 italic">
                                {shift.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-400 italic">
                      No shifts scheduled this week
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* DESKTOP VIEW */}
        <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full border-collapse min-w-[950px] table-fixed">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-left">
                <th className="p-4 font-bold text-xs uppercase tracking-wider text-slate-400 w-56 bg-slate-50 sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                  Driver & Actions
                </th>
                {days.map((day) => {
                  const dayString = day.toISOString().split('T')[0]
                  const isToday = dayString === todayString
                  return (
                    <th
                      key={day.toISOString()}
                      className={`p-4 font-bold text-xs border-l border-slate-200 ${
                        isToday ? 'bg-sky-50/60 text-[#41a6f4]' : 'text-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="uppercase tracking-wider">
                          {day.toLocaleDateString([], { weekday: 'short', timeZone: 'UTC' })}
                        </span>
                        {isToday && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-[#41a6f4] text-white uppercase tracking-wider">
                            Today
                          </span>
                        )}
                      </div>
                      <div
                        className={`text-xs mt-0.5 font-medium ${isToday ? 'text-[#41a6f4]' : 'text-slate-400'}`}
                      >
                        {day.toLocaleDateString([], {
                          month: 'numeric',
                          day: 'numeric',
                          timeZone: 'UTC',
                        })}
                      </div>
                    </th>
                  )
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              {driversResult.docs.map((driver: any) => {
                const driverName = `${driver.firstName || ''} ${driver.lastName || ''}`.trim()

                return (
                  <tr key={driver.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-bold text-sm text-slate-900 bg-white sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] space-y-2">
                      <div>
                        {driverName}
                        <p className="text-xs font-normal text-slate-400">{driver.phoneNumber}</p>
                      </div>

                      {/* Schedule edit modal for managers only */}
                      {isManager && (
                        <EditDriverScheduleModal
                          driver={driver}
                          weekDays={days}
                          scheduleLookup={scheduleLookup}
                          isManager={isManager}
                        />
                      )}
                    </td>

                    {days.map((day) => {
                      const dayString = day.toISOString().split('T')[0]
                      const isToday = dayString === todayString
                      const shift = scheduleLookup[driver.id]?.[dayString]

                      return (
                        <td
                          key={day.toISOString()}
                          className={`p-3 border-l border-slate-100 align-top transition-colors ${
                            isToday ? 'bg-sky-50/20' : ''
                          }`}
                        >
                          {shift ? (
                            <div
                              className={`rounded-xl p-2.5 text-xs border ${
                                shift.onCall
                                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                              }`}
                            >
                              {shift.onCall ? (
                                <div className="flex items-center gap-1.5 font-bold text-amber-800">
                                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                                  On Call
                                </div>
                              ) : (
                                <div>
                                  <div className="font-bold text-emerald-900 mb-0.5">
                                    Active Shift
                                  </div>
                                  <div className="text-emerald-700 font-medium text-[11px]">
                                    {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                                  </div>
                                </div>
                              )}

                              {shift.notes && (
                                <div
                                  className={`mt-1.5 pt-1.5 border-t text-[10px] line-clamp-2 ${
                                    shift.onCall
                                      ? 'border-amber-200/60 text-amber-700'
                                      : 'border-emerald-200/60 text-emerald-700'
                                  }`}
                                >
                                  {shift.notes}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-4 text-slate-300 text-xs">
                              —
                            </div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <OnCall />
      </div>
    </main>
  )
}
