'use client'
import React, { createContext, useContext } from 'react'
import { useTimer as useTimerHook } from '../dashboard/actions/useTimer'

const TimerContext = createContext<ReturnType<typeof useTimerHook> | null>(null)

export const TimerProvider = ({
  children,
  jobId,
}: {
  children: React.ReactNode
  jobId: string | number
}) => {
  // Coerce it safely into a pure string format expected by your custom hook engine
  const safeJobId = String(jobId)

  const timer = useTimerHook(safeJobId)
  return <TimerContext.Provider value={timer}>{children}</TimerContext.Provider>
}

export const useTimerContext = () => {
  const context = useContext(TimerContext)
  if (!context) throw new Error('useTimerContext must be used within TimerProvider')
  return context
}
