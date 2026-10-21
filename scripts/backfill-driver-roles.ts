/**
 * One-time backfill: copies the legacy single `driver` field on existing
 * Jobs onto the new `pickupDriver` and `dropoffDriver` fields (both set to
 * the same driver, since prior to this change a job only had one driver).
 *
 * Safe to re-run: only touches jobs that have a legacy `driver` but are
 * missing pickupDriver/dropoffDriver.
 *
 * Usage: node scripts/backfill-driver-roles.ts
 */
import { getPayload } from 'payload'
import configPromise from '../src/payload.config'

async function run() {
  console.log('Starting driver-role backfill script...')
  const payload = await getPayload({ config: configPromise })
  console.log('Payload initialized, querying jobs...')

  const { docs: jobs } = await payload.find({
    collection: 'jobs',
    limit: 0,
    depth: 0,
    overrideAccess: true,
    where: {
      driver: { exists: true },
    },
  })

  console.log(`Found ${jobs.length} job(s) with a legacy driver assigned.`)

  // Use a raw update against the underlying Mongo collection instead of
  // payload.update(): payload.update() re-validates the *entire* document,
  // and some legacy jobs predate required fields (e.g. equipmentNeeded)
  // added later, which would otherwise block this unrelated backfill.
  const jobsModel = (payload.db as { collections: Record<string, any> }).collections['jobs']

  let updated = 0
  for (const job of jobs) {
    const legacyDriverId = job.driver as string | null
    if (!legacyDriverId) continue
    if (job.pickupDriver && job.dropoffDriver) continue

    const set: Record<string, string> = {}
    if (!job.pickupDriver) set.pickupDriver = legacyDriverId
    if (!job.dropoffDriver) set.dropoffDriver = legacyDriverId

    await jobsModel.updateOne({ _id: job.id }, { $set: set })
    updated++
  }

  console.log(`Backfilled pickupDriver/dropoffDriver on ${updated} job(s).`)
}

try {
  await run()
  process.exit(0)
} catch (err) {
  console.error('Backfill failed:', err)
  process.exit(1)
}
