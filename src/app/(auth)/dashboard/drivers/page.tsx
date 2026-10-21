'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getUser } from '../actions/_getUser'
import { redirect } from 'next/navigation'
import DriverGrid from './components/DriversGrid'
import DriverDrawer from './components/DriversDrawer'
import AddDriverModal from './components/AddDriverModal'

export default async function DriversPage() {
  const user = await getUser()

  // Guard: Allow access to both managers and assistants
  if (!user || (user.position !== 'manager' && user.position !== 'assistant')) {
    redirect('/dashboard')
  }

  const isManager = user.position === 'manager'
  const payload = await getPayload({ config: configPromise })

  const driversRes = await payload.find({
    collection: 'drivers',
    limit: 100,
    overrideAccess: true,
  })

  const drivers = driversRes.docs

  return (
    <div>
      <div className="lg:pl-72 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-5 gap-4">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Management Portal
            </p>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Team Drivers ({drivers.length})
            </h1>
          </div>

          {/* Add Driver Modal strictly for full managers */}
          {isManager && <AddDriverModal />}
        </div>

        <DriverGrid drivers={drivers} isManager={isManager} />
        <DriverDrawer drivers={drivers} isManager={isManager} />
      </div>
    </div>
  )
}
