'use client'
import { useEffect, useRef, useState } from 'react'
import { updateDriverLocation } from './updateDriverLocation'

const PING_INTERVAL_MS = 20_000

type PermissionState = 'idle' | 'granted' | 'denied' | 'unsupported'

export const useLiveLocation = (jobId: string, isActive: boolean) => {
  const [permissionState, setPermissionState] = useState<PermissionState>('idle')
  const [lastSentAt, setLastSentAt] = useState<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!isActive) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setPermissionState('unsupported')
      return
    }

    let cancelled = false

    const sendPing = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (cancelled) return
          setPermissionState('granted')
          updateDriverLocation({
            jobId,
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy ?? undefined,
            heading: position.coords.heading ?? undefined,
            speed: position.coords.speed ?? undefined,
          }).then((res) => {
            if (!cancelled && res.success) setLastSentAt(Date.now())
          })
        },
        (error) => {
          if (cancelled) return
          if (error.code === error.PERMISSION_DENIED) {
            setPermissionState('denied')
          }
        },
        { enableHighAccuracy: true, timeout: 15_000, maximumAge: 10_000 },
      )
    }

    sendPing()
    intervalRef.current = setInterval(sendPing, PING_INTERVAL_MS)

    return () => {
      cancelled = true
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isActive, jobId])

  return { permissionState, lastSentAt }
}
