import { useEffect, useRef, useCallback } from 'react'

export function useWakeLock() {
  const wakeLockRef = useRef(null)

  const requestWakeLock = useCallback(async () => {
    if (!('wakeLock' in navigator)) return
    try {
      wakeLockRef.current = await navigator.wakeLock.request('screen')
      wakeLockRef.current.addEventListener('release', () => {
        wakeLockRef.current = null
      })
    } catch (err) {
      console.warn('Wake lock request failed:', err)
    }
  }, [])

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      await wakeLockRef.current.release()
      wakeLockRef.current = null
    }
  }, [])

  // Re-acquire on visibility change (iOS / backgrounded tabs)
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && !wakeLockRef.current) {
        await requestWakeLock()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [requestWakeLock])

  return { requestWakeLock, releaseWakeLock }
}
