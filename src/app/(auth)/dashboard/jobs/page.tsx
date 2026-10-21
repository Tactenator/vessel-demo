'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getUser } from '../actions/_getUser'
import { redirect } from 'next/navigation'
import AddJobModal from '../components/AddJobModal'
import JobsTableClient from './components/JobsTableClient'

export default async function ManagerJobsPage() {
  const user = await getUser()

  if (!user || (user.position !== 'manager' && user.position !== 'assistant')) {
    redirect('/dashboard')
  }

  const isManager = user.position === 'manager'
  const payload = await getPayload({ config: configPromise })

  // Fetch all jobs, drivers, vehicles, clients, and locations in parallel
  const [jobsRes, driversRes, vehiclesRes, clientsRes, locationsRes] = await Promise.all([
    payload.find({
      collection: 'jobs',
      limit: 200,
      // Client/driver/vehicle/location are direct relationships on jobs — depth 1
      // resolves them fully for this table. depth 2 would additionally pull each
      // vehicle's/client's uploaded documents (full Media docs, 3 image sizes
      // each), which the table and edit modal never read.
      depth: 1,
      overrideAccess: true,
      sort: '-startingDateAndTime',
    }),
    payload.find({
      collection: 'drivers',
      limit: 100,
      overrideAccess: true,
    }),
    payload.find({
      collection: 'vehicles',
      limit: 100,
      overrideAccess: true,
    }),
    payload.find({
      collection: 'clients',
      limit: 100,
      overrideAccess: true,
    }),
    payload.find({
      collection: 'locations',
      limit: 100,
      overrideAccess: true,
    }),
  ])

  const jobs = jobsRes.docs
  const drivers = driversRes.docs
  const vehicles = vehiclesRes.docs
  const clients = clientsRes.docs
  const locations = locationsRes.docs

  return (
    <div>
      <div className="lg:pl-72 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-5">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Management Portal
            </p>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              All Dispatched Jobs ({jobs.length})
            </h1>
          </div>

          {/* Only render AddJobModal for full managers */}
          {isManager && (
            <AddJobModal
              drivers={drivers}
              vehicles={vehicles}
              clients={clients}
              locations={locations}
            />
          )}
        </div>

        {/* Client Component handling stateful multi-criteria filtering */}
        <JobsTableClient
          jobs={jobs}
          drivers={drivers}
          vehicles={vehicles}
          clients={clients}
          locations={locations}
          isManager={isManager}
        />
      </div>
    </div>
  )
}
