'use client'

import { APIProvider, Map, Marker, useMapsLibrary, useMap } from '@vis.gl/react-google-maps'
import { useEffect, useRef } from 'react'

// 1. Updated Interface to match the flattened array shape from your page
interface Order {
  stopId: string | number // Using stopId as the primary unique key
  id?: string | number // Keeping id optional just in case
  location?: {
    // Made location optional defensively
    lat: number
    lng: number
  }
  routeSequence?: number
}

interface RouteMapProps {
  orders: Order[]
  polylineString: string
}

export default function RouteMap({ orders, polylineString }: RouteMapProps) {
  const mapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

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
    <APIProvider apiKey={mapsApiKey} libraries={['geometry']}>
      <div className="w-full h-[500px] rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100">
        <Map
          defaultCenter={{ lat: 41.2565, lng: -95.9345 }}
          defaultZoom={12}
          mapId={process.env.NEXT_PUBLIC_GOOGLE_MAP_ID || 'DEMO_MAP_ID'}
          gestureHandling="cooperative"
          disableDefaultUI={false}
        >
          {orders.map((order) => {
            // 2. Defensive guard: skip rendering markers that don't have geo data
            if (!order.location?.lat || !order.location?.lng) return null

            return (
              <Marker
                key={order.stopId || order.id} // Fallback to id if stopId missing
                position={{ lat: order.location.lat, lng: order.location.lng }}
                label={{
                  text: order.routeSequence?.toString() || '',
                  color: '#ffffff',
                  className: 'font-bold text-xs',
                }}
              />
            )
          })}

          <PolylineOverlay encodedPath={polylineString} />
          <MapBoundsHandler orders={orders} />
        </Map>
      </div>
    </APIProvider>
  )
}

// Handles map viewport balancing dynamically
function MapBoundsHandler({ orders }: { orders: Order[] }) {
  const map = useMap()

  useEffect(() => {
    if (!map || orders.length === 0 || typeof window === 'undefined' || !(window as any).google)
      return

    const bounds = new (window as any).google.maps.LatLngBounds()
    let hasValidBounds = false

    orders.forEach((order) => {
      if (order.location?.lat && order.location?.lng) {
        bounds.extend({ lat: order.location.lat, lng: order.location.lng })
        hasValidBounds = true
      }
    })

    // Only apply if we actually extended the bounds object
    if (hasValidBounds) {
      map.fitBounds(bounds, {
        top: 50,
        right: 50,
        bottom: 50,
        left: 50,
      })
    }
  }, [map, orders])

  return null
}

function PolylineOverlay({ encodedPath }: { encodedPath: string }) {
  const map = useMap()
  const mapsLib = useMapsLibrary('geometry')
  const polylineRef = useRef<any>(null)

  useEffect(() => {
    if (
      !map ||
      !mapsLib ||
      !encodedPath ||
      typeof window === 'undefined' ||
      !(window as any).google
    ) {
      return
    }

    const gMaps = (window as any).google.maps

    try {
      const path = gMaps.geometry.encoding.decodePath(encodedPath)

      if (polylineRef.current) {
        polylineRef.current.setPath(path)
        polylineRef.current.setMap(map)
      } else {
        polylineRef.current = new gMaps.Polyline({
          path,
          strokeColor: '#41a6f4',
          strokeOpacity: 0.85,
          strokeWeight: 5,
          map: map,
        })
      }

      // Fit the viewport to the actual generated route geometry (not just the stop
      // markers) — this is the authoritative "size of the path", and doesn't depend
      // on every stop having resolved coordinates the way the marker-only bounds in
      // MapBoundsHandler does. Without this, a newly generated path could leave the
      // map zoomed into wherever it happened to be centered before, or on a single
      // stop if marker bounds ended up degenerate.
      if (path.length > 0) {
        const bounds = new gMaps.LatLngBounds()
        path.forEach((point: any) => bounds.extend(point))
        map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 })

        // fitBounds on a degenerate box (e.g. a route with duplicate/overlapping
        // stops collapses to a single point) snaps to Google's max zoom, which
        // reads as "zoomed in on nothing." Clamp it back to a sane street-level
        // zoom so a bad/duplicate stop can't make the map unusable.
        const MAX_REASONABLE_ZOOM = 16
        gMaps.event.addListenerOnce(map, 'bounds_changed', () => {
          if ((map.getZoom?.() ?? 0) > MAX_REASONABLE_ZOOM) {
            map.setZoom(MAX_REASONABLE_ZOOM)
          }
        })
      }
    } catch (error) {
      console.error('Failed to decode map polyline string:', error)
    }

    return () => {
      if (polylineRef.current) {
        polylineRef.current.setMap(null)
        polylineRef.current = null
      }
    }
  }, [map, mapsLib, encodedPath])

  return null
}
