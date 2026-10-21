'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getUser } from '../../actions/_getUser'
import { notFound } from 'next/navigation'
import StatusPicker from '../../components/statusPicker'
import {
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  BanknotesIcon,
  UserIcon,
  FlagIcon,
} from '@heroicons/react/24/outline'
import DriveTimer from '../../components/timer'
import { TimerProvider } from '@/app/(auth)/context/TimerContext'
import DriveNotes from '../../components/driveNotes'
import CashPaymentForm from '../../components/CashPaymentForm'
import LiveLocationReporter from '../../components/LiveLocationReporter'
import EditJobModal from '../../components/editJobModal'

function EquipmentBadges({ equipment }: { equipment?: string | string[] }) {
  if (!equipment) return null
  const list = Array.isArray(equipment) ? equipment : [equipment]
  if (list.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2 pt-2">
      {list.includes('wheelchair') && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
          Wheelchair Required
        </span>
      )}

      {list.includes('gloves') && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
          Gloves Required
        </span>
      )}
    </div>
  )
}

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const mapsKey = process.env.GOOGLE_MAPS_API_KEY
  const VENUE_TIMEZONE = 'America/Chicago'

  const formatTime = (isoString?: string) => {
    if (!isoString) return ''
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: VENUE_TIMEZONE,
    })
  }

  const formatDate = (isoString?: string, options?: Intl.DateTimeFormatOptions) => {
    if (!isoString) return ''
    return new Date(isoString).toLocaleString('en-US', {
      ...options,
      timeZone: VENUE_TIMEZONE,
    })
  }

  const getDriverName = (driver: any) => {
    if (!driver || typeof driver !== 'object') return 'Unassigned'
    return `${driver.firstName || ''} ${driver.lastName || ''}`.trim() || 'Unassigned'
  }

  const slug = (await params).id

  const payload = await getPayload({ config: configPromise })
  const user = await getUser()
  const isManager = user?.position === 'manager'

  let job: any
  let invoices: any[] = []
  let driversList: any[] = []
  let vehiclesList: any[] = []
  let clientsList: any[] = []
  let locationsList: any[] = []

  try {
    // 1. Fetch Primary Job
    const result = await payload.find({
      collection: 'jobs',
      where: {
        id: { equals: slug },
      },
      overrideAccess: true,
      depth: 2,
      user: user,
    })
    job = result.docs[0]

    // 2. Fetch Cash Invoices for this job
    if (job) {
      const invoiceRes = await payload.find({
        collection: 'cash-invoices',
        where: {
          job: { equals: job.id },
        },
        overrideAccess: true,
        depth: 1,
        sort: '-createdAt',
      })
      invoices = invoiceRes.docs
    }

    // 3. Manager Option: Fetch all dynamic options for EditJobModal
    if (isManager) {
      const [driversRes, vehiclesRes, clientsRes, locationsRes] = await Promise.all([
        payload.find({
          collection: 'drivers',
          overrideAccess: true,
          limit: 100,
        }),
        payload.find({
          collection: 'vehicles',
          overrideAccess: true,
          limit: 100,
        }),
        payload.find({
          collection: 'clients',
          overrideAccess: true,
          limit: 100,
        }),
        payload.find({
          collection: 'locations',
          overrideAccess: true,
          limit: 100,
        }),
      ])

      driversList = driversRes.docs
      vehiclesList = vehiclesRes.docs
      clientsList = clientsRes.docs
      locationsList = locationsRes.docs
    }
  } catch (err) {
    console.error('Error fetching job details:', err)
    return notFound()
  }

  if (!job) return notFound()

  // Compute total cash collected
  const totalCashCollected = invoices.reduce(
    (sum: number, inv: any) => sum + (Number(inv.amountReceived) || 0),
    0,
  )

  // Normalize route stops array
  const routeStops =
    Array.isArray(job.stops) && job.stops.length > 0
      ? job.stops.map((s: any) => ({
          address: typeof s.location === 'object' ? s.location?.address : '',
          note: s.note,
        }))
      : [
          { address: job.startingLocation?.address, note: 'Pickup' },
          { address: job.endingLocation?.address, note: 'Dropoff' },
        ].filter((s) => Boolean(s.address))

  function createGoogleMapsLink(address: string) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
  }

  // Rendered as a browser-facing <img src>, so this must use the public/browser key
  // (referrer-restricted to this domain) — not the server-only mapsKey, which should
  // never be exposed in page source.
  const staticMapBrowserKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  const getStaticMapUrl = (lat: number, lng: number, color = 'red') => {
    if (!lat || !lng) return ''
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=600x400&markers=color:${color}|${lat},${lng}&key=${staticMapBrowserKey}`
  }

  async function fetchMultiStopMapData(stops: { address: string; note?: string }[]) {
    const fetchSingle = async (addr: string) => {
      if (!addr) return null
      try {
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addr)}&key=${mapsKey}`,
        )
        const data = await res.json()
        if (data.status !== 'OK') {
          console.error(
            `Geocoding failed for "${addr}": ${data.status} ${data.error_message || ''}`,
          )
          return null
        }
        return data.results[0].geometry.location
      } catch (e) {
        console.error(`Geocoding request failed for "${addr}":`, e)
        return null
      }
    }

    const coordsList = await Promise.all(stops.map((s) => fetchSingle(s.address)))

    let totalDistanceMeters = 0
    let totalDurationSeconds = 0
    let hasRouteData = false

    for (let i = 0; i < coordsList.length - 1; i++) {
      const origin = coordsList[i]
      const dest = coordsList[i + 1]
      if (origin && dest) {
        try {
          const distRes = await fetch(
            `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin.lat},${origin.lng}&destinations=${dest.lat},${dest.lng}&mode=driving&units=imperial&key=${mapsKey}`,
          )
          const distData = await distRes.json()
          const element = distData.rows?.[0]?.elements?.[0]
          if (element?.status === 'OK') {
            totalDistanceMeters += element.distance.value
            totalDurationSeconds += element.duration.value
            hasRouteData = true
          } else if (distData.status !== 'OK') {
            console.error(
              `Distance Matrix API request failed: ${distData.status} ${distData.error_message || ''}`,
            )
          } else if (element?.status && element.status !== 'OK') {
            console.error(`Distance Matrix element status: ${element.status}`)
          }
        } catch (e) {
          console.error('Distance calculation error', e)
        }
      }
    }

    const totalMiles = (totalDistanceMeters * 0.000621371).toFixed(1)
    const totalMinutes = Math.round(totalDurationSeconds / 60)

    return {
      coordsList,
      hasRouteData,
      totalMiles: `${totalMiles} mi`,
      totalDuration: `${totalMinutes} mins`,
    }
  }

  const mapData = await fetchMultiStopMapData(routeStops)

  const currentTime = new Date()
  const scheduledStartTime = new Date(job.startingDateAndTime)
  const isPastScheduledStart = currentTime > scheduledStartTime

  const showStartReminder = !job.noTime && isPastScheduledStart && job.status === 'pending'

  return (
    <div>
      <TimerProvider jobId={job.id}>
        <div className="lg:pl-72 py-10 px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
          {/* Start Reminder Banner */}
          {showStartReminder && (
            <div className="w-full max-w-4xl mx-auto rounded-2xl bg-red-500/10 border border-red-500/30 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
              <div className="flex items-center gap-3">
                <span className="flex h-3 w-3 relative">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 animate-pulse"></span>
                </span>
                <div>
                  <h4 className="text-sm font-bold text-red-500 uppercase tracking-wider animate-pulse">
                    Attention Required: Start Drive
                  </h4>
                  <p className="text-xs text-gray-900">
                    The scheduled start time ({formatTime(job.startingDateAndTime)}) has passed.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Active Drive Banner */}
          {job.status === 'in_progress' && (
            <div className="w-full max-w-4xl mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <div>
                  <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
                    Drive Time Active
                  </h4>
                  <p className="text-xs text-gray-300">
                    The trip clock is tracking metrics automatically for this client dispatch
                    session.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TOP SECTION: Contact & Timing Card */}
          <div className="w-full max-w-4xl overflow-hidden rounded-2xl bg-[#1a2236] shadow-2xl ring-1 ring-white/10 mx-auto">
            <div className="bg-white/5 px-6 py-3 border-b border-white/5 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-300">
                Job Created • {formatDate(job.createdAt, { month: 'short', day: 'numeric' })}
              </p>

              <div className="flex items-center gap-3">
                {job.noTime && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-bold uppercase tracking-wider">
                    <ClockIcon className="size-3.5" /> Flexible Schedule
                  </span>
                )}

                {/* MANAGER EDIT BUTTON ONLY */}
                {isManager && (
                  <EditJobModal
                    job={job}
                    drivers={driversList}
                    vehicles={vehiclesList}
                    clients={clientsList}
                    locations={locationsList}
                  />
                )}
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-8">
                {/* Contact Info & Equipment Badges */}
                <div className="flex-1 space-y-4">
                  <div>
                    <h2 className="text-[12px] font-black uppercase tracking-[0.2em] text-gray-300 mb-1">
                      Client Name
                    </h2>
                    <p className="text-2xl font-extrabold text-white">
                      {typeof job.client === 'object' ? job.client?.fullName : 'N/A'}
                    </p>
                  </div>

                  <a
                    href={`tel:${typeof job.client === 'object' ? job.client?.phoneNumber : ''}`}
                    className="inline-flex items-center gap-x-3 rounded-xl bg-indigo-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-400 transition-all active:scale-95"
                  >
                    <PhoneIcon className="size-5" />
                    {typeof job.client === 'object' ? job.client?.phoneNumber : 'N/A'}
                  </a>

                  {/* DRIVER ASSIGNMENT DISPLAY */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs font-bold uppercase tracking-wider">
                      <UserIcon className="size-3.5" />
                      Pickup: {getDriverName(job.pickupDriver)}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold uppercase tracking-wider">
                      <FlagIcon className="size-3.5" />
                      Dropoff: {getDriverName(job.dropoffDriver)}
                    </span>
                  </div>

                  {/* EQUIPMENT NEEDED DISPLAY */}
                  <EquipmentBadges equipment={job.equipmentNeeded} />

                  <div className="pt-2">
                    {mapData.hasRouteData ? (
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-indigo-400 uppercase tracking-wider">
                          Total Distance: {mapData.totalMiles} ({routeStops.length} Stops)
                        </p>
                        <p className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
                          Est. Total Drive Time: {mapData.totalDuration}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 italic">Route data calculating...</p>
                    )}
                  </div>
                  <div>
                    <DriveNotes jobId={job.id} />
                  </div>
                </div>

                {/* Schedule Card Block */}
                <div className="flex-1 rounded-xl bg-black/20 p-5 ring-1 ring-white/5">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 mb-3">
                    Schedule
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="h-2 w-2 rounded-full bg-emerald-500" />
                      <div>
                        <p className="text-[10px] font-bold text-gray-300 uppercase">Start</p>
                        <p className="text-sm font-bold text-white">
                          {formatDate(job.startingDateAndTime, { month: 'short', day: 'numeric' })}
                          {job.noTime ? (
                            <span className="ml-1.5 text-xs font-semibold text-amber-300">
                              (Flexible Time)
                            </span>
                          ) : (
                            ` @ ${formatTime(job.startingDateAndTime)}`
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="h-2 w-2 rounded-full bg-red-500" />
                      <div>
                        <p className="text-[10px] font-bold text-gray-300 uppercase">End</p>
                        <p className="text-sm font-bold text-white">
                          {formatDate(job.endingDateAndTime, { month: 'short', day: 'numeric' })}
                          {job.noTime ? (
                            <span className="ml-1.5 text-xs font-semibold text-amber-300">
                              (Flexible Time)
                            </span>
                          ) : (
                            ` @ ${formatTime(job.endingDateAndTime)}`
                          )}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h2 className="text-white font-semibold mb-2">Drive Timer</h2>
                      <DriveTimer jobId={job.id} jobStatus={job.status} driveTime={job.driveTime} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Status & Notes Row */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-white/5">
                <div>
                  <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-3">
                    Update Status
                  </h2>
                  <StatusPicker jobId={job.id} currentStatus={job.status} />
                  <div className="mt-2">
                    <LiveLocationReporter jobId={job.id} jobStatus={job.status} />
                  </div>
                </div>
                <div>
                  <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 mb-2">
                    Notes about Client
                  </h2>
                  <div className="rounded-lg bg-black/10 p-4 text-sm leading-relaxed text-gray-300 italic border border-white/5">
                    &apos;{job.client?.notes || 'No notes provided'}&apos;
                  </div>
                </div>
              </div>

              {/* CASH INVOICES SECTION */}
              <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BanknotesIcon className="size-5 text-emerald-400" />
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">
                      Cash Invoices & Receipts
                    </h2>
                  </div>
                  <span className="text-xs font-extrabold text-white bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
                    Total Collected: ${totalCashCollected.toFixed(2)}
                  </span>
                </div>

                {/* Receipts History */}
                {invoices.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {invoices.map((inv: any) => (
                      <div
                        key={inv.id}
                        className="flex items-center justify-between p-3.5 rounded-xl bg-black/20 border border-white/5 text-xs"
                      >
                        <div>
                          <p className="font-bold text-white">{inv.receiptNumber || 'Receipt'}</p>
                          <p className="text-gray-400 text-[11px] mt-0.5">
                            {inv.notes || 'Cash payment received'}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-extrabold text-emerald-400 text-sm">
                            ${Number(inv.amountReceived || 0).toFixed(2)}
                          </span>
                          <span className="block text-[9px] uppercase tracking-wider text-emerald-500 font-bold mt-0.5">
                            {inv.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">
                    No cash receipts logged for this drive yet.
                  </p>
                )}

                {/* Form to Record Cash Payment */}
                <CashPaymentForm
                  jobId={job.id}
                  driverId={
                    typeof job.dropoffDriver === 'object' ? job.dropoffDriver?.id : user.id
                  }
                />
              </div>
            </div>
          </div>

          {/* DYNAMIC MULTI-STOP MAP GRID */}
          <div className="w-full max-w-4xl mx-auto space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-widest">
                Route Stops ({routeStops.length})
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {routeStops.map((stop: any, index: number) => {
                const coords = mapData.coordsList[index]
                const isFirst = index === 0
                const isLast = index === routeStops.length - 1
                const pinColor = isFirst ? 'blue' : isLast ? 'rose' : 'orange'

                return (
                  <a
                    key={index}
                    href={createGoogleMapsLink(stop.address)}
                    target="_blank"
                    rel="noreferrer"
                    className="group relative overflow-hidden rounded-2xl bg-[#1a2236] p-4 ring-1 ring-white/10 transition-all hover:bg-[#212b45] flex flex-col justify-between"
                  >
                    <div>
                      <div className="aspect-video w-full rounded-lg bg-gray-800 mb-4 overflow-hidden border border-white/5">
                        <div className="flex h-full w-full items-center justify-center bg-indigo-500/10">
                          {coords ? (
                            <img
                              src={getStaticMapUrl(coords.lat, coords.lng, pinColor)}
                              alt={`Stop ${index + 1}`}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-indigo-400 font-bold text-xs uppercase tracking-widest">
                              Map Loading...
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center justify-center size-5 rounded-full text-[10px] font-black text-white ${
                              isFirst ? 'bg-indigo-500' : isLast ? 'bg-rose-500' : 'bg-amber-500'
                            }`}
                          >
                            {index + 1}
                          </span>
                          <h4
                            className={`text-[10px] font-black uppercase tracking-widest ${
                              isFirst
                                ? 'text-indigo-400'
                                : isLast
                                  ? 'text-rose-400'
                                  : 'text-amber-400'
                            }`}
                          >
                            {isFirst
                              ? 'Start Location'
                              : isLast
                                ? 'Final Destination'
                                : `Stop #${index + 1}`}
                          </h4>
                        </div>

                        <p className="text-sm font-bold text-white group-hover:underline underline-offset-4 leading-snug pt-1">
                          {stop.address || 'Address pending'}
                        </p>

                        {stop.note && (
                          <p className="text-xs text-indigo-300 italic pt-1">
                            Note: &quot;{stop.note}&quot;
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-400 font-medium">
                      <span>Open in Maps</span>
                      <MapPinIcon className="size-4 text-indigo-400" />
                    </div>
                  </a>
                )
              })}
            </div>
          </div>
        </div>
      </TimerProvider>
    </div>
  )
}

export default Page
