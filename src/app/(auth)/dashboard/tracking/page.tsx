'use server'

import { getUser } from '../actions/_getUser'
import { redirect } from 'next/navigation'
import { getActiveDriverLocations } from '../actions/getActiveDriverLocations'
import LiveTrackingMap from './components/LiveTrackingMap'

export default async function TrackingPage() {
  const user = await getUser()

  // Guard: Allow access to both managers and assistants
  if (!user || (user.position !== 'manager' && user.position !== 'assistant')) {
    redirect('/dashboard')
  }

  const initialLocations = await getActiveDriverLocations()

  return (
    <div className="min-h-screen bg-slate-50/50">
      <main className="lg:pl-72 min-h-screen">
        <div className="pt-24 pb-12 mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl">
          <div className="border-b border-slate-200 pb-6 mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Live Tracking
            </h1>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
              Current position of every driver on an active drive, updated automatically.
            </p>
          </div>

          <LiveTrackingMap initialLocations={initialLocations} />
        </div>
      </main>
    </div>
  )
}
