'use client'

import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { useLiveLocation } from '../actions/useLiveLocation'

interface LiveLocationReporterProps {
  jobId: string
  jobStatus: 'pending' | 'in_progress' | 'completed' | 'cancelled'
}

export default function LiveLocationReporter({ jobId, jobStatus }: LiveLocationReporterProps) {
  const { permissionState } = useLiveLocation(jobId, jobStatus === 'in_progress')

  if (permissionState !== 'denied' && permissionState !== 'unsupported') {
    return null
  }

  return (
    <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-300">
      <ExclamationTriangleIcon className="size-3.5 shrink-0" />
      {permissionState === 'denied'
        ? 'Location sharing is off — enable location access to let dispatch see your live position.'
        : "This browser doesn't support live location sharing."}
    </div>
  )
}
