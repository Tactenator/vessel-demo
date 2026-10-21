'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getUser } from '../actions/_getUser'
import { redirect } from 'next/navigation'
import VehicleGrid from './components/VehicleGrid'
import VehicleDrawer from './components/VehicleDrawer'
import AddVehicleModal from './components/AddVehicleModal'

export default async function VehiclesPage() {
  const user = await getUser()

  // Guard: Allow access to both managers and assistants
  if (!user || (user.position !== 'manager' && user.position !== 'assistant')) {
    redirect('/dashboard')
  }

  const isManager = user.position === 'manager'
  const payload = await getPayload({ config: configPromise })

  const [vehiclesRes, maintenanceRes, expensesRes] = await Promise.all([
    payload.find({
      collection: 'vehicles',
      limit: 0,
      overrideAccess: true,
      depth: 2,
      sort: 'fullTitle',
    }),
    payload.find({
      collection: 'vehicle-maintenance',
      limit: 0,
      overrideAccess: true,
      depth: 1,
      sort: '-createdAt',
    }),
    payload.find({
      collection: 'payments',
      limit: 0,
      overrideAccess: true,
      depth: 1,
      sort: '-date',
    }),
  ])

  return (
    <div className="min-h-screen bg-slate-50/50">
      <main className="lg:pl-72 min-h-screen">
        <div className="pt-24 pb-12 mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-6 mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Fleet Management
              </h1>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                Vehicle info, maintenance items, fuel status, odometer readings, and expense
                reports across the fleet.
              </p>
            </div>

            {/* Add Vehicle Button strictly for managers */}
            {isManager && <AddVehicleModal />}
          </div>

          <VehicleGrid
            vehicles={vehiclesRes.docs}
            maintenanceItems={maintenanceRes.docs}
            expenses={expensesRes.docs}
          />
          <VehicleDrawer
            vehicles={vehiclesRes.docs}
            maintenanceItems={maintenanceRes.docs}
            expenses={expensesRes.docs}
            isManager={isManager}
          />
        </div>
      </main>
    </div>
  )
}
