// app/dispatch/page.tsx
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import RouteMap from './components/routesMap'
import { generateOmahaRoute } from '../actions/optimizeRoute'
import OrderList from './components/orderList'
import NoRoutesState from '../components/noRoutes'
import AddRouteModal from './components/AddRouteModal'
import AddStopModal from './components/AddStopModal'
import RouteSwitcher from './components/RouteSwitcher'
import { getUser } from '../actions/_getUser'

// CRITICAL FIX 1: Prevent Next.js from aggressively caching this page as a static HTML file.
// Without this, 'new Date()' is locked forever to the exact minute you deployed to production.
export const dynamic = 'force-dynamic'

export default async function DispatchPage({
  searchParams,
}: {
  searchParams: Promise<{ routeId?: string }>
}) {
  const { routeId } = await searchParams
  const payload = await getPayload({ config: configPromise })
  const user = await getUser()
  const isManager = user?.position === 'manager'

  // CRITICAL FIX 2: Compute current date based on standard Central Time (or target market time)
  // instead of relying blindly on the production server's host clock (which defaults to UTC).
  const targetTimeZone = 'America/Chicago' // Adjust if your market isn't Central Time

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: targetTimeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

  // Format returns "MM/DD/YYYY" -> split it up safely
  const [{ value: mm }, , { value: dd }, , { value: yyyy }] = formatter.formatToParts(new Date())
  const todayIso = `${yyyy}-${mm}-${dd}`

  // Create absolute, clean ISO bounds that perfectly target Payload's UTC zeroed stamps
  const startOfTodayIso = `${todayIso}T00:00:00.000Z`
  const endOfTodayIso = `${todayIso}T23:59:59.999Z`

  // Fetch data needed for route/stop creation alongside today's routes. The routes list only
  // needs `date` + `driver` (for the switcher labels) — the expensive part (stops -> order ->
  // address, at depth 2) is fetched separately below for just the one route being displayed,
  // instead of for every route in today's list.
  const [{ docs: routeSummaries }, { docs: drivers }, { docs: locations }] = await Promise.all([
    payload.find({
      collection: 'routes',
      depth: 1,
      limit: 100,
      sort: '-createdAt',
      select: { date: true, driver: true },
      where: {
        and: [
          { date: { greater_than_equal: startOfTodayIso } },
          { date: { less_than_equal: endOfTodayIso } },
        ],
      },
    }),
    payload.find({ collection: 'drivers', limit: 100, overrideAccess: true }),
    payload.find({ collection: 'locations', limit: 100, overrideAccess: true }),
  ])

  const targetRouteId = routeId
    ? (routeSummaries.find((r) => r.id === routeId)?.id ?? routeSummaries[0]?.id)
    : routeSummaries[0]?.id

  if (!targetRouteId) {
    return (
      <div className="flex min-h-screen bg-slate-50 w-full">
        <NoRoutesState
          action={
            isManager ? (
              <AddRouteModal
                drivers={drivers}
                locations={locations}
                defaultDate={todayIso}
                label="Create Today's Route"
              />
            ) : undefined
          }
        />
      </div>
    )
  }

  // Only the route actually being displayed needs the full depth-2 population
  // (stops -> order -> address) required to render the map and stop list.
  const currentRoute = await payload.findByID({
    collection: 'routes',
    id: targetRouteId,
    depth: 2,
  })

  // Safely map data fields down to the child components
  const flattenedOrders =
    currentRoute.stops?.map((stop, index) => {
      const orderData = stop.order as any
      // With depth: 2, `address` is the populated Location object rather than a string —
      // resolve it down to the human-readable address text for display.
      const addressText =
        orderData?.address && typeof orderData.address === 'object'
          ? orderData.address.address
          : orderData?.address

      return {
        ...orderData,
        address: addressText,
        routeSequence: index + 1,
        stopId: stop.id,
        status: stop.status,
      }
    }) || []

  const polylineString = currentRoute.encodedPolyline || ''

  return (
    // FIX 3: Added flex container layout so the sidebar and dashboard content
    // sit cleanly side-by-side instead of stacking vertically.
    <main className="min-h-screen bg-slate-50 w-full overflow-x-hidden">
      {/* Structural layout wrapper to defend Google Map width constraints. lg:pl-72 keeps
          content clear of the fixed-position desktop sidebar (w-72) so it doesn't clip under it. */}
      <div className="lg:pl-72 p-8 block w-full min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Daily Delivery Route:{' '}
              {currentRoute.date ? new Date(currentRoute.date).toLocaleDateString() : ''}
            </h1>
            {(() => {
              const driverName =
                typeof currentRoute.driver === 'object'
                  ? `${currentRoute.driver.firstName || ''} ${currentRoute.driver.lastName || ''}`.trim()
                  : ''
              return driverName ? (
                <p className="text-xs text-slate-500 mt-1 font-medium">Driver: {driverName}</p>
              ) : null
            })()}
          </div>

          {isManager && (
            <div className="flex items-center gap-2">
              {routeSummaries.length > 1 && (
                <RouteSwitcher
                  currentRouteId={currentRoute.id}
                  routes={routeSummaries.map((r) => {
                    const d = r.driver as any
                    const name =
                      typeof d === 'object' ? `${d.firstName || ''} ${d.lastName || ''}`.trim() : ''
                    return { id: r.id, label: name || 'Unassigned' }
                  })}
                />
              )}
              <AddStopModal routeId={currentRoute.id} locations={locations} />
              <AddRouteModal drivers={drivers} locations={locations} defaultDate={todayIso} />
            </div>
          )}
        </div>

        {/* Explicit block wrapper context prevents Map Canvas shrinking */}
        <div className="w-full block clear-both mb-6">
          <RouteMap orders={flattenedOrders} polylineString={polylineString} />
        </div>

        <form
          className="flex justify-start w-full max-w-2xl mb-6"
          action={async () => {
            'use server'
            await generateOmahaRoute(currentRoute.id)
          }}
        >
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 shadow-sm"
          >
            Generate Path
          </button>
        </form>

        <div className="w-full max-w-2xl h-[600px] overflow-y-auto border border-slate-100 rounded-2xl bg-white p-4">
          <OrderList orders={flattenedOrders} routeId={currentRoute.id} />
        </div>
      </div>
    </main>
  )
}
