'use client'
import { useEffect, useRef } from 'react'
import { useTimerContext } from '../../context/TimerContext'

interface DriveTimerProps {
  jobId: string | number
  jobStatus: 'pending' | 'in_progress' | 'completed' | 'cancelled' | string
  driveTime?: string | null
}

const formatTime = (seconds: number) => {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return [hrs, mins, secs].map((v) => (v < 10 ? '0' + v : v)).join(':')
}

const DriveTimer = ({ jobId, jobStatus, driveTime }: DriveTimerProps) => {
  const { totalSeconds, isRunning, isLoaded, startTimer, pauseTimer } = useTimerContext()

  // Failsafe: if the page loads (or refreshes) with the job already 'in_progress' but
  // the local timer isn't running (e.g. localStorage was cleared, or status was set
  // in_progress from elsewhere), auto-resume it. Runs only once per mount — checking
  // this on every isRunning change caused it to fire mid-completion: StatusPicker's
  // pauseTimer() flips isRunning to false a render or two before the server-refreshed
  // jobStatus prop catches up to 'completed', and this effect was reading that stale
  // 'in_progress' prop and immediately restarting the timer.
  const hasCheckedFailsafe = useRef(false)
  useEffect(() => {
    if (isLoaded && !hasCheckedFailsafe.current) {
      hasCheckedFailsafe.current = true
      if (jobStatus === 'in_progress' && !isRunning) {
        startTimer()
      }
    }
  }, [isLoaded, jobStatus, isRunning, startTimer])

  if (!isLoaded) return null

  // Once the drive is completed, the live context timer has already been reset —
  // show the final time that was actually saved to the job instead of a blank/zeroed
  // counter.
  if (jobStatus === 'completed') {
    const finalSeconds = Number(driveTime) || 0
    return (
      <div className="space-y-2">
        <div className="text-3xl font-mono font-bold tracking-wider text-white bg-black/30 p-3 rounded-xl text-center border border-white/5 tabular-nums">
          {formatTime(finalSeconds)}
        </div>
        <p className="text-[11px] text-emerald-300 text-center font-semibold">
          Final drive time
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Visual Alert Notice */}
      {jobStatus === 'in_progress' && !isRunning && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] p-2 rounded-lg animate-pulse text-center">
          ⚠️ Notice: Job status is active. Running failsafe backup...
        </div>
      )}

      {/* Timer Counter Display */}
      <div className="text-3xl font-mono font-bold tracking-wider text-white bg-black/30 p-3 rounded-xl text-center border border-white/5 tabular-nums">
        {formatTime(totalSeconds)}
      </div>

      {/* Manual Override Action Button */}
      <button
        onClick={isRunning ? pauseTimer : startTimer}
        className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all active:scale-95 ${
          isRunning
            ? 'bg-amber-600 hover:bg-amber-500 text-white'
            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
        }`}
      >
        {isRunning ? 'MANUAL PAUSE' : 'MANUAL START'}
      </button>
    </div>
  )
}

export default DriveTimer
