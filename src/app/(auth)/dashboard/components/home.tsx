'use server'

import { getPayload } from 'payload'
import React from 'react'
import configPromise from '@payload-config'
import { getUser } from '../actions/_getUser'
import PageTopper from '../components/pageTopper'
import { redirect } from 'next/navigation'
import HomeClient from './homeClient'

function getCentralTimeParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  })
  const parts = formatter.formatToParts(date)
  const map: Record<string, number> = {}
  for (const p of parts) {
    if (p.type !== 'literal') {
      map[p.type] = parseInt(p.value, 10)
    }
  }
  return { year: map.year, month: map.month - 1, day: map.day }
}

const Home = async () => {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  const payload = await getPayload({ config: configPromise })
  const isManager = user.position === 'manager'
  const isAssistant = user.position === 'assistant'
  const isManagerOrAssistant = isManager || isAssistant

  const { year, month, day } = getCentralTimeParts()

  let startOfRange: Date
  let endOfRange: Date

  if (isManagerOrAssistant) {
    startOfRange = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0))
    endOfRange = new Date(Date.UTC(year, month + 1, 1, 12, 0, 0, 0))
  } else {
    startOfRange = new Date(Date.UTC(year, month, day, 0, 0, 0, 0))
    startOfRange.setHours(startOfRange.getHours() - 6)

    endOfRange = new Date(Date.UTC(year, month, day, 23, 59, 59, 999))
    endOfRange.setHours(endOfRange.getHours() + 6)
  }

  // Fetch jobs alongside select dropdown lists for managers and assistants
  const [jobsRes, driversRes, vehiclesRes, clientsRes, locationsRes] = await Promise.all([
    isManagerOrAssistant
      ? payload.find({
          collection: 'jobs',
          limit: 150,
          // Client/driver/vehicle/location are direct relationships on jobs — depth 1
          // resolves them fully. depth 2 would additionally pull each vehicle's/client's
          // uploaded documents (full Media docs, each with 3 generated image sizes),
          // which this list view never reads.
          depth: 1,
          overrideAccess: true,
          where: {
            startingDateAndTime: {
              greater_than_equal: startOfRange.toISOString(),
              less_than_equal: endOfRange.toISOString(),
            },
          },
          sort: 'startingDateAndTime',
        })
      : payload.find({
          collection: 'jobs',
          limit: 30,
          depth: 1,
          overrideAccess: true,
          where: {
            and: [
              {
                or: [
                  { pickupDriver: { equals: user.id } },
                  { dropoffDriver: { equals: user.id } },
                ],
              },
              {
                startingDateAndTime: {
                  greater_than_equal: startOfRange.toISOString(),
                  less_than_equal: endOfRange.toISOString(),
                },
              },
            ],
          },
          sort: 'startingDateAndTime',
        }),

    isManagerOrAssistant
      ? payload.find({ collection: 'drivers', limit: 100, overrideAccess: true })
      : Promise.resolve({ docs: [] }),
    isManagerOrAssistant
      ? payload.find({ collection: 'vehicles', limit: 100, overrideAccess: true })
      : Promise.resolve({ docs: [] }),
    isManagerOrAssistant
      ? payload.find({ collection: 'clients', limit: 100, overrideAccess: true })
      : Promise.resolve({ docs: [] }),
    isManagerOrAssistant
      ? payload.find({ collection: 'locations', limit: 100, overrideAccess: true })
      : Promise.resolve({ docs: [] }),
  ])

  const formattedJobs = jobsRes.docs.map((job: any) => {
    const hasStops = Array.isArray(job.stops) && job.stops.length > 0
    const firstStop = hasStops ? job.stops[0]?.location : null
    const lastStop = hasStops ? job.stops[job.stops.length - 1]?.location : null

    const startLoc =
      (typeof firstStop === 'object' ? firstStop?.name || firstStop?.address : '') ||
      job.startingLocation?.name ||
      job.startingLocation?.address ||
      'Start Location'

    const endLoc =
      (typeof lastStop === 'object' ? lastStop?.name || lastStop?.address : '') ||
      job.endingLocation?.name ||
      job.endingLocation?.address ||
      'End Location'

    return {
      id: job.id,
      name: job.client?.fullName || 'Client Trip',
      date: job.startingDateAndTime,
      noTime: job.noTime || false,
      stopCount: hasStops ? job.stops.length : 2,
      startingLocation: startLoc,
      endingLocation: endLoc,
      status: job.status,
      jobType: job.jobType,
      vehicle: job.vehicle,
      client: job.client,
      pickupDriver: job.pickupDriver,
      dropoffDriver: job.dropoffDriver,
      rawJob: job,
    }
  })

  return (
    <main className="pb-16 lg:pl-72 bg-slate-50/50 min-h-screen">
      <PageTopper
        image={'/dashboard-banner.webp'}
        text={`Welcome, ${user?.firstName} ${user?.lastName}`}
      />
      <HomeClient
        user={user}
        jobs={formattedJobs}
        drivers={driversRes.docs}
        vehicles={vehiclesRes.docs}
        clients={clientsRes.docs}
        locations={locationsRes.docs}
      />
    </main>
  )
}

export default Home
