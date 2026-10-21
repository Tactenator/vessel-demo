'use client'
import { useState, useEffect, useCallback } from 'react'

export const useTimer = (jobId: string) => {
  const [elapsedTime, setElapsedTime] = useState(0)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [now, setNow] = useState(Date.now())

  const ELAPSED_KEY = `job_${jobId}_elapsed`
  const START_KEY = `job_${jobId}_start_time`

  useEffect(() => {
    const savedElapsed = localStorage.getItem(ELAPSED_KEY)
    const savedStartTime = localStorage.getItem(START_KEY)
    if (savedElapsed) setElapsedTime(parseInt(savedElapsed, 10))
    if (savedStartTime) {
      setStartTime(parseInt(savedStartTime, 10))
      setIsRunning(true)
    }
    setIsLoaded(true)
  }, [jobId, ELAPSED_KEY, START_KEY])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning) {
      interval = setInterval(() => setNow(Date.now()), 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning])

  const totalSeconds =
    isRunning && startTime ? elapsedTime + Math.floor((now - startTime) / 1000) : elapsedTime

  const startTimer = useCallback(() => {
    if (!isRunning) {
      const start = Date.now()
      setStartTime(start)
      setIsRunning(true)
      localStorage.setItem(START_KEY, start.toString())
    }
  }, [isRunning, START_KEY])

  const pauseTimer = useCallback(() => {
    if (isRunning && startTime) {
      const sessionDuration = Math.floor((Date.now() - startTime) / 1000)
      const newTotal = elapsedTime + sessionDuration
      setElapsedTime(newTotal)
      setStartTime(null)
      setIsRunning(false)
      localStorage.setItem(ELAPSED_KEY, newTotal.toString())
      localStorage.removeItem(START_KEY)
    }
  }, [isRunning, startTime, elapsedTime, ELAPSED_KEY, START_KEY])

  const resetTimer = useCallback(() => {
    setElapsedTime(0)
    setStartTime(null)
    setIsRunning(false)
    localStorage.removeItem(ELAPSED_KEY)
    localStorage.removeItem(START_KEY)
  }, [ELAPSED_KEY, START_KEY])

  return { totalSeconds, isRunning, isLoaded, startTimer, pauseTimer, resetTimer }
}
