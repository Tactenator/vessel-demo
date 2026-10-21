'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getUser } from '../actions/_getUser'
import { redirect } from 'next/navigation'
import LocationGrid from './components/LocationGrid'
import AddLocationModal from './components/AddLocationModal'

export default async function LocationsPage() {
  const user = await getUser()

  // Guard: Allow access to both managers and assistants
  if (!user || (user.position !== 'manager' && user.position !== 'assistant')) {
    redirect('/dashboard')
  }

  const isManager = user.position === 'manager'
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'locations',
    limit: 0,
    overrideAccess: true,
    sort: 'name',
  })

  return (
    <div className="min-h-screen bg-slate-50/50">
      <main className="lg:pl-72 min-h-screen">
        <div className="pt-24 pb-12 mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-6 mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Locations
              </h1>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                Directory of pickup, dropoff, and waypoint addresses used across job routes.
              </p>
            </div>

            {/* Add Location Button strictly for managers */}
            {isManager && <AddLocationModal />}
          </div>

          <LocationGrid locations={result.docs} isManager={isManager} />
        </div>
      </main>
    </div>
  )
}
