'use client'

import { useRouter } from 'next/navigation'

interface RouteOption {
  id: string
  label: string
}

export default function RouteSwitcher({
  routes,
  currentRouteId,
}: {
  routes: RouteOption[]
  currentRouteId: string
}) {
  const router = useRouter()

  return (
    <select
      defaultValue={currentRouteId}
      onChange={(e) => router.push(`/dashboard/routes?routeId=${e.target.value}`)}
      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-[#41a6f4] focus:outline-none"
    >
      {routes.map((r) => (
        <option key={r.id} value={r.id}>
          {r.label}
        </option>
      ))}
    </select>
  )
}
