import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getUser } from '../../actions/_getUser'
import { redirect } from 'next/navigation'
import { UserMinusIcon, CalendarDaysIcon } from '@heroicons/react/24/outline'
import EditOnCallModal from '../../components/editOnCallModal'

const OnCall = async () => {
  const user = await getUser()
  if (!user) redirect('/login')

  const isManager = user.position === 'manager'
  const payload = await getPayload({ config: configPromise })

  const [onCallRes, driversRes] = await Promise.all([
    payload.find({
      collection: 'on-call',
      depth: 2,
      limit: 1,
      sort: '-createdAt',
      overrideAccess: true,
    }),
    isManager
      ? payload.find({
          collection: 'drivers',
          limit: 100,
          overrideAccess: true,
        })
      : Promise.resolve({ docs: [] }),
  ])

  const currentOnCall = onCallRes.docs[0]
  const drivers = driversRes.docs

  if (!currentOnCall) {
    return (
      <div className="w-full max-w-sm rounded-2xl bg-white border border-slate-200 p-6 text-center shadow-xs space-y-4">
        <UserMinusIcon className="mx-auto size-8 text-slate-300" />
        <div>
          <h3 className="text-sm font-semibold text-slate-900">No Schedule</h3>
          <p className="mt-1 text-xs text-slate-400 italic">No current on-call rotation found.</p>
        </div>
        {isManager && <EditOnCallModal drivers={drivers} isManager={isManager} />}
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm rounded-2xl bg-white border border-slate-200 p-6 shadow-xs">
      {/* Header section */}
      <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#41a6f4]">
            On-Call Rotation
          </span>
          <p className="text-lg font-bold text-slate-900 mt-0.5">{currentOnCall.weekend}</p>
        </div>
        <div className="flex items-center gap-2">
          {isManager && (
            <EditOnCallModal
              currentOnCall={currentOnCall}
              drivers={drivers}
              isManager={isManager}
            />
          )}
          <div className="h-9 w-9 rounded-xl bg-sky-50 flex items-center justify-center shrink-0">
            <CalendarDaysIcon className="h-5 w-5 text-[#41a6f4]" />
          </div>
        </div>
      </div>

      {/* Driver list */}
      <div className="space-y-2.5">
        {currentOnCall.driver && currentOnCall.driver.length > 0 ? (
          currentOnCall.driver.map((d: any, index: number) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100/80 hover:border-slate-200 transition-all group"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-[#41a6f4] to-sky-400 flex items-center justify-center text-xs font-bold text-white shadow-xs shrink-0">
                {d.firstName?.charAt(0) || d.fullName?.charAt(0) || 'D'}
              </div>

              <div className="truncate">
                <p className="text-sm font-bold text-slate-800 group-hover:text-[#41a6f4] transition-colors truncate">
                  {d.fullName ||
                    `${d.firstName || ''} ${d.lastName || ''}`.trim() ||
                    'Unnamed Driver'}
                </p>
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">
                  {index === 0 ? 'Primary Contact' : 'Backup Cover'}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-400 italic text-center py-2">
            No active cover units assigned.
          </p>
        )}
      </div>

      {/* Action Footer Notice */}
      <div className="mt-5 pt-3 border-t border-slate-100">
        <p className="text-[11px] text-slate-400 text-center leading-normal">
          If you are scheduled, please keep your dispatch comms channel open.
        </p>
      </div>
    </div>
  )
}

export default OnCall
