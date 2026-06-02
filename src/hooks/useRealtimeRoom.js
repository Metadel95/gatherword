import { useState, useEffect, useRef, useCallback } from 'react'
import {
  createRoom,
  checkRoomExists,
  subscribeToRoom,
  broadcastSlide as fbBroadcastSlide,
  clearBroadcast as fbClearBroadcast,
  joinRoomMember,
  leaveRoom,
  closeRoom,
  LocalChannel,
} from '../lib/firebase'

const USE_FIREBASE = Boolean(
  import.meta.env.VITE_FIREBASE_DATABASE_URL &&
  import.meta.env.VITE_FIREBASE_DATABASE_URL !== 'YOUR_DATABASE_URL'
)

export function useRealtimeRoom() {
  const [roomData, setRoomData] = useState(null)
  const [connected, setConnected] = useState(false)
  const channelRef = useRef(null)
  const unsubRef = useRef(null)
  const pollRef = useRef(null)
  const lastSlideTs = useRef(null)

  const cleanup = useCallback(() => {
    if (unsubRef.current) { unsubRef.current(); unsubRef.current = null }
    if (channelRef.current) { channelRef.current.close(); channelRef.current = null }
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
    setConnected(false)
    setRoomData(null)
  }, [])

  // ── LEADER ────────────────────────────────────────────────────────────────

  const createLeaderRoom = useCallback(async (roomCode, leaderName) => {
    cleanup()
    if (USE_FIREBASE) {
      await createRoom(roomCode, leaderName)
      const unsub = subscribeToRoom(roomCode, (data) => setRoomData(data))
      unsubRef.current = unsub
    } else {
      // LocalChannel mode
      const ch = new LocalChannel(roomCode)
      ch.clearStore()
      channelRef.current = ch
      const initialData = {
        code: roomCode,
        leaderName,
        currentSlide: null,
        members: {},
      }
      ch.emit('room_state', initialData)
      setRoomData(initialData)

      ch.on('join', (data) => {
        setRoomData((prev) => ({
          ...prev,
          members: {
            ...(prev?.members || {}),
            [data.memberId]: { name: data.memberName, online: true },
          },
        }))
      })
      ch.on('leave', (data) => {
        setRoomData((prev) => {
          const members = { ...(prev?.members || {}) }
          delete members[data.memberId]
          return { ...prev, members }
        })
      })
    }
    setConnected(true)
  }, [cleanup])

  const leaderBroadcast = useCallback(async (roomCode, slide, index, total) => {
    if (USE_FIREBASE) {
      await fbBroadcastSlide(roomCode, slide, index, total)
    } else {
      const ch = channelRef.current
      if (!ch) return
      const payload = { ...slide, index, total, broadcastAt: Date.now() }
      ch.emit('slide', payload)
      setRoomData((prev) => ({ ...prev, currentSlide: payload }))
    }
  }, [])

  const leaderClear = useCallback(async (roomCode) => {
    if (USE_FIREBASE) {
      await fbClearBroadcast(roomCode)
    } else {
      const ch = channelRef.current
      if (ch) ch.emit('slide', null)
      setRoomData((prev) => ({ ...prev, currentSlide: null }))
    }
  }, [])

  const leaderClose = useCallback(async (roomCode) => {
    if (USE_FIREBASE) await closeRoom(roomCode)
    cleanup()
  }, [cleanup])

  // ── MEMBER ────────────────────────────────────────────────────────────────

  const joinMemberRoom = useCallback(async (roomCode, memberId, memberName) => {
    cleanup()

    if (USE_FIREBASE) {
      const exists = await checkRoomExists(roomCode)
      if (!exists) throw new Error('Room not found')
      await joinRoomMember(roomCode, memberId, memberName)
      const unsub = subscribeToRoom(roomCode, (data) => setRoomData(data))
      unsubRef.current = unsub
    } else {
      const ch = new LocalChannel(roomCode)
      channelRef.current = ch
      ch.emit('join', { memberId, memberName })

      ch.on('slide', (data) => {
        setRoomData((prev) => ({ ...prev, currentSlide: data }))
      })

      // Poll localStorage as fallback (for same-device but different tab)
      pollRef.current = setInterval(() => {
        lastSlideTs.current = ch.pollStore('slide', lastSlideTs.current, (data) => {
          setRoomData((prev) => ({ ...prev, currentSlide: data }))
        })
      }, 600)
    }
    setConnected(true)
  }, [cleanup])

  const memberLeave = useCallback(async (roomCode, memberId) => {
    if (USE_FIREBASE) {
      await leaveRoom(roomCode, memberId)
    } else {
      channelRef.current?.emit('leave', { memberId })
    }
    cleanup()
  }, [cleanup])

  return {
    roomData,
    connected,
    createLeaderRoom,
    leaderBroadcast,
    leaderClear,
    leaderClose,
    joinMemberRoom,
    memberLeave,
    cleanup,
  }
}
