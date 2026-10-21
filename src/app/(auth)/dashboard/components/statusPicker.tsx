'use client'
import { updateStatus } from '../actions/updateStatus'
import { saveDriveTime } from '../actions/saveDriveTime'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTimerContext } from '../../context/TimerContext'

// 1. Define the explicit strict union type matching your action/Payload schema
type JobStatus = 'in_progress' | 'pending' | 'completed' | 'cancelled'

// 2. Accept either string or number for the ID from the parent template
function StatusPicker({
  jobId,
  currentStatus,
}: {
  jobId: string | number
  currentStatus: JobStatus
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // 3. Force the state hook to strictly use the JobStatus union type
  const [status, setStatus] = useState<JobStatus>(currentStatus)
  const { totalSeconds, startTimer, pauseTimer, resetTimer } = useTimerContext()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // 4. Use type assertion (as JobStatus) so TypeScript knows the select option value is safe
    const nextStatus = e.target.value as JobStatus
    const previousStatus = status
    setStatus(nextStatus)

    startTransition(async () => {
      // 5. Convert the ID safely to a string to satisfy the action signatures
      const stringJobId = String(jobId)

      await updateStatus(stringJobId, nextStatus)

      if (nextStatus === 'in_progress') {
        startTimer()
      } else if (previousStatus === 'in_progress' && nextStatus !== 'completed') {
        pauseTimer()
      } else if (nextStatus === 'completed') {
        pauseTimer()

        // 6. Pass the raw numeric totalSeconds directly to the action instead of a string
        await saveDriveTime(stringJobId, totalSeconds)
        resetTimer()
      }

      router.refresh()
    })
  }

  // 7. Update the color helper parameter to use the strict union type
  const getStatusColor = (s: JobStatus) => {
    switch (s) {
      case 'pending':
        return 'bg-gray-500'
      case 'in_progress':
        return 'bg-yellow-500 animate-pulse'
      case 'completed':
        return 'bg-green-500'
      case 'cancelled':
        return 'bg-red-500'
      default:
        return 'bg-gray-900'
    }
  }

  return (
    <div className="flex items-center gap-2 mt-1">
      <div className={`h-3 w-3 rounded-full ${getStatusColor(status)}`} />
      <select
        disabled={isPending}
        value={status}
        onChange={handleChange}
        className={`bg-transparent font-medium text-xl text-white cursor-pointer focus:outline-none border-b border-transparent hover:border-gray-400 disabled:opacity-50`}
      >
        <option value="pending" className="text-black">
          Pending
        </option>
        <option value="in_progress" className="text-black">
          In Progress
        </option>
        <option value="completed" className="text-black">
          Completed
        </option>
        <option value="cancelled" className="text-black">
          Cancelled
        </option>
      </select>
      {isPending && <span className="text-xs text-gray-400">Updating...</span>}
    </div>
  )
}

export default StatusPicker
