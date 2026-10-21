'use client'

import { useEffect, useState } from 'react'
import { APIProvider, Map, Marker, InfoWindow } from '@vis.gl/react-google-maps'
import { MapPinIcon, UserIcon } from '@heroicons/react/24/outline'
import {
  getActiveDriverLocations,
  type ActiveDriverLocation,
} from '../../actions/getActiveDriverLocations'

const POLL_INTERVAL_MS = 20_000
const STALE_AFTER_MS = 2 * 60_000
const DEFAULT_CENTER = { lat: 41.2565, lng: -95.9345 }

function timeAgo(iso: string) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000))
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ago`
}

function isStale(iso: string) {
  return Date.now() - new Date(iso).getTime() > STALE_AFTER_MS
}

interface LiveTrackingMapProps {
  initialLocations: ActiveDriverLocation[]
}

export default function LiveTrackingMap({ initialLocations }: LiveTrackingMapProps) {
  const [locations, setLocations] = useState<ActiveDriverLocation[]>(initialLocations)
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null)
  const [, forceTick] = useState(0)

  const mapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  useEffect(() => {
    const poll = setInterval(async () => {
      const fresh = await getActiveDriverLocations()
      setLocations(fresh)
    }, POLL_INTERVAL_MS)

    // Re-render every 15s so "time ago" labels and staleness stay current
    // between polls, without needing another network round trip.
    const tick = setInterval(() => forceTick((n) => n + 1), 15_000)

    return () => {
      clearInterval(poll)
      clearInterval(tick)
    }
  }, [])

  const selectedDriver = locations.find((l) => l.driverId === selectedDriverId) || null

  if (!mapsApiKey) {
    return (
      <div className="w-full h-[500px] rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center p-6 text-center">
        <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center mb-3">
          <svg
            className="h-6 w-6 text-amber-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-slate-800">Map Configuration Missing</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          Please check your local environment configurations and add your public map authorization
          key.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
      <div className="lg:col-span-2">
        <APIProvider apiKey={mapsApiKey}>
          <div className="w-full h-[500px] rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100">
            <Map
              defaultCenter={
                locations[0] ? { lat: locations[0].lat, lng: locations[0].lng } : DEFAULT_CENTER
              }
              defaultZoom={locations.length > 0 ? 12 : 10}
              mapId={process.env.NEXT_PUBLIC_GOOGLE_MAP_ID || 'DEMO_MAP_ID'}
              gestureHandling="cooperative"
              disableDefaultUI={false}
            >
              {locations.map((loc) => (
                <Marker
                  key={loc.driverId}
                  position={{ lat: loc.lat, lng: loc.lng }}
                  opacity={isStale(loc.updatedAt) ? 0.4 : 1}
                  onClick={() => setSelectedDriverId(loc.driverId)}
                />
              ))}

              {selectedDriver && (
                <InfoWindow
                  position={{ lat: selectedDriver.lat, lng: selectedDriver.lng }}
                  onCloseClick={() => setSelectedDriverId(null)}
                >
                  <div className="text-xs space-y-0.5 p-1">
                    <p className="font-bold text-slate-900">{selectedDriver.driverName}</p>
                    <p className="text-slate-500">{selectedDriver.clientName}</p>
                    <p className="text-slate-400">{timeAgo(selectedDriver.updatedAt)}</p>
                  </div>
                </InfoWindow>
              )}
            </Map>
          </div>
        </APIProvider>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Active Drivers
          </span>
          <span className="text-xs font-semibold text-slate-500">{locations.length}</span>
        </div>

        {locations.length > 0 ? (
          <ul className="divide-y divide-slate-100">
            {locations.map((loc) => {
              const stale = isStale(loc.updatedAt)
              return (
                <li key={loc.driverId}>
                  <button
                    type="button"
                    onClick={() => setSelectedDriverId(loc.driverId)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors"
                  >
                    <span
                      className="size-8 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: loc.driverColor, opacity: stale ? 0.4 : 1 }}
                    >
                      <UserIcon className="size-4 text-white" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {loc.driverName}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">{loc.clientName}</p>
                    </div>
                    <span
                      className={`text-[10px] font-semibold shrink-0 ${stale ? 'text-amber-500' : 'text-emerald-600'}`}
                    >
                      {timeAgo(loc.updatedAt)}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        ) : (
          <div className="p-8 text-center">
            <MapPinIcon className="mx-auto size-8 text-slate-300" />
            <p className="mt-2 text-xs text-slate-400 italic">
              No drivers currently on active drives.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
