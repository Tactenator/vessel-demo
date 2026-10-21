'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeftIcon, ChevronRightIcon, CalendarDaysIcon } from '@heroicons/react/24/outline'

export default function ScheduleWeekNavigator({
  startOfWeekStr,
  endOfWeekStr,
}: {
  startOfWeekStr: string
  endOfWeekStr: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Change week by offset (+7 days or -7 days)
  const changeWeek = (daysOffset: number) => {
    const currentParam = searchParams.get('week')
    const baseDate = currentParam ? new Date(currentParam) : new Date()

    baseDate.setDate(baseDate.getDate() + daysOffset)
    const yyyyMmDd = baseDate.toISOString().split('T')[0]

    router.push(`/dashboard/schedule?week=${yyyyMmDd}`)
  }

  const resetToCurrentWeek = () => {
    router.push('/dashboard/schedule')
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="inline-flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200">
        <button
          type="button"
          onClick={() => changeWeek(-7)}
          className="p-1.5 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 transition-all"
          title="Previous Week"
        >
          <ChevronLeftIcon className="size-4" />
        </button>

        <span className="px-3 text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <CalendarDaysIcon className="size-4 text-[#41a6f4]" />
          {startOfWeekStr} — {endOfWeekStr}
        </span>

        <button
          type="button"
          onClick={() => changeWeek(7)}
          className="p-1.5 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 transition-all"
          title="Next Week"
        >
          <ChevronRightIcon className="size-4" />
        </button>
      </div>

      {searchParams.has('week') && (
        <button
          type="button"
          onClick={resetToCurrentWeek}
          className="px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-100 text-[#41a6f4] text-xs font-bold hover:bg-sky-100/60 transition-colors"
        >
          Jump to Current Week
        </button>
      )}
    </div>
  )
}
