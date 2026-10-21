'use client'

import { useTransition, useState } from 'react'
import { updateStopStatus } from '../../actions/updateStopStatus'
import {
  MapPinIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline'

interface Location {
  lat: number
  lng: number
}

interface Order {
  id: string
  stopId: string
  routeSequence: number
  customerName: string
  address: string
  status: 'pending' | 'delivered' | 'cancelled'
  location: Location
}

interface OrderListProps {
  orders: Order[]
  routeId: string
}

export default function OrderList({ orders, routeId }: OrderListProps) {
  const [isPending, startTransition] = useTransition()
  // Track exactly which route array row is undergoing a transition state mutation
  const [activeUpdatingId, setActiveUpdatingId] = useState<string | null>(null)

  const handleUpdate = (stopId: string, nextStatus: 'pending' | 'delivered' | 'cancelled') => {
    setActiveUpdatingId(stopId)
    startTransition(async () => {
      await updateStopStatus({
        routeId,
        stopId,
        newStatus: nextStatus,
      })
      setActiveUpdatingId(null)
    })
  }

  return (
    <div className="flex flex-col gap-3 w-full max-w-2xl mx-auto py-6 ">
      {/* Header Context Metrics */}
      <div className="mb-3 px-1">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Stops for Today</h2>
        <p className="text-xs text-slate-400 mt-0.5 font-medium">
          Manage live route sequencing targets and dispatch closures.
        </p>
      </div>

      {orders.map((order) => {
        // Track visual loading indicators based on the route array stopId row
        const isThisItemUpdating = isPending && activeUpdatingId === order.stopId

        return (
          <div
            key={order.stopId}
            className="group border border-slate-200 bg-white rounded-2xl shadow-xs overflow-hidden transition-all duration-200"
          >
            {/* Native Checkbox Accordion Controller Trick */}
            <details className="peer open:bg-slate-50/40 transition-colors">
              <summary className="list-none cursor-pointer flex items-center gap-4 p-4 select-none focus:outline-none">
                {/* Route Order Indicator Badge */}
                <div className="flex-none w-8 h-8 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm flex items-center justify-center border border-slate-200 group-hover:bg-[#41a6f4] group-hover:text-white group-hover:border-[#41a6f4] transition-colors shadow-2xs">
                  {order.routeSequence}
                </div>

                {/* Identity Frame Block */}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-slate-800 tracking-tight truncate">
                    {order.customerName}
                  </div>
                  <div className="text-xs text-slate-400 font-medium truncate mt-0.5 max-w-[240px]">
                    {order.address?.split(',')[0] || 'No Address Provided'}
                  </div>
                </div>

                {/* Structured Status Badges Layout */}
                <div className="flex items-center gap-2.5">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      order.status === 'pending'
                        ? 'bg-amber-50 border-amber-200 text-amber-700'
                        : order.status === 'delivered'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : 'bg-rose-50 border-rose-200 text-rose-700'
                    }`}
                  >
                    {order.status || 'pending'}
                  </span>

                  {/* Micro Dynamic Chevron Motion */}
                  <ChevronDownIcon className="size-4 text-slate-400 group-open:rotate-180 transition-transform duration-200 shrink-0" />
                </div>
              </summary>

              {/* Accordion Internal Panel Block */}
              <div className="p-4 pt-1 border-t border-slate-100 bg-white">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2">
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Full Destination Address
                    </span>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#41a6f4] hover:text-[#3592dd] underline break-all leading-normal"
                    >
                      <MapPinIcon className="size-3.5 shrink-0" />
                      {order.address}
                    </a>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Geographic Coordinates
                    </span>
                    <p className="text-xs font-mono font-medium text-slate-600 bg-slate-50 border border-slate-100 rounded-lg p-2 inline-block">
                      {order.location?.lat?.toFixed(5) || 0}, {order.location?.lng?.toFixed(5) || 0}
                    </p>
                  </div>
                </div>

                {/* Sub-Action Control Row */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
                  <p className="text-[10px] font-mono text-slate-400">
                    Stop Ref ID: {order.stopId}
                  </p>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      disabled={isPending || order.status === 'cancelled'}
                      onClick={() => handleUpdate(order.stopId, 'cancelled')}
                      className="inline-flex items-center justify-center gap-1.5 flex-1 sm:flex-none border border-slate-200 hover:border-rose-200 hover:bg-rose-50 text-slate-600 hover:text-rose-700 font-semibold px-3 py-1.5 rounded-xl text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <XCircleIcon className="size-4" />
                      Cancel
                    </button>

                    <button
                      disabled={isPending || order.status === 'delivered'}
                      onClick={() => handleUpdate(order.stopId, 'delivered')}
                      className="inline-flex items-center justify-center gap-1.5 flex-1 sm:flex-none bg-[#41a6f4] hover:bg-[#3592dd] text-white font-semibold px-4 py-1.5 rounded-xl text-xs shadow-xs transition-colors disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed"
                    >
                      {isThisItemUpdating ? (
                        <>
                          <svg
                            className="animate-spin h-3.5 w-3.5 text-current"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircleIcon className="size-4" />
                          Complete Stop
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </details>
          </div>
        )
      })}
    </div>
  )
}
