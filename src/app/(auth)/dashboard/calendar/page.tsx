'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getUser } from '../actions/_getUser'
import { redirect } from 'next/navigation'
import ManagerMonthSchedule from './components/ManagerMonthSchedule'

export default async function CalendarPage() {
  const user = await getUser()

  if (!user || (user.position !== 'manager' && user.position !== 'assistant')) {
    redirect('/dashboard')
  }

  const payload = await getPayload({ config: configPromise })

  const [jobsRes, driversRes, vehiclesRes, clientsRes, locationsRes] = await Promise.all([
    payload.find({
      collection: 'jobs',
      limit: 300,
      depth: 2,
      overrideAccess: true,
      sort: 'startingDateAndTime',
    }),
    payload.find({ collection: 'drivers', limit: 100, overrideAccess: true }),
    payload.find({ collection: 'vehicles', limit: 100, overrideAccess: true }),
    payload.find({ collection: 'clients', limit: 100, overrideAccess: true }),
    payload.find({ collection: 'locations', limit: 100, overrideAccess: true }),
  ])

  const formattedJobs = jobsRes.docs.map((job: any) => ({
    id: job.id,
    name: job.client?.fullName || 'Client Trip',
    date: job.startingDateAndTime,
    noTime: job.noTime || false,
    status: job.status,
    pickupDriver: job.pickupDriver,
    dropoffDriver: job.dropoffDriver,
  }))

  return (
    <div>
      <div className="lg:pl-72 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <ManagerMonthSchedule
          user={user}
          jobs={formattedJobs}
          drivers={driversRes.docs}
          vehicles={vehiclesRes.docs}
          clients={clientsRes.docs}
          locations={locationsRes.docs}
        />
      </div>
    </div>
  )
}
