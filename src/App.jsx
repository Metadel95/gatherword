import React, { useState, useCallback, useEffect, useRef } from 'react'
import { Toaster, toast } from 'react-hot-toast'
import { HomeScreen } from './components/HomeScreen'
import { LeaderScreen } from './components/LeaderScreen'
import { MemberScreen } from './components/MemberScreen'
import { useRealtimeRoom } from './hooks/useRealtimeRoom'

function generateRoomCode() {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

function generateMemberId() {
  return 'mbr_' + Math.random().toString(36).slice(2, 9)
}

const MEMBER_NAMES = [
  'Grace', 'David', 'Sarah', 'James', 'Ruth', 'Caleb', 'Hannah', 'Noah',
  'Miriam', 'Elijah', 'Rachel', 'Joshua', 'Esther', 'Daniel', 'Naomi',
]

function randomMemberName() {
  return MEMBER_NAMES[Math.floor(Math.random() * MEMBER_NAMES.length)]
}

export default function App() {
  const [view, setView] = useState('home') // 'home' | 'leader' | 'member'
  const [roomCode, setRoomCode] = useState('')
  const [slides, setSlides] = useState([])
  const memberIdRef = useRef(generateMemberId())
  const memberNameRef = useRef(randomMemberName())

  const {
    roomData,
    connected,
    createLeaderRoom,
    leaderBroadcast,
    leaderClose,
    joinMemberRoom,
    memberLeave,
    cleanup,
  } = useRealtimeRoom()

  // Check URL param for auto-join
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('join')
    if (code && /^\d{4}$/.test(code)) {
      // Pre-fill is handled inside HomeScreen
    }
  }, [])

  // ── LEADER ────────────────────────────────────────────────────────────────

  const handleStartLeader = useCallback(async () => {
    const code = generateRoomCode()
    setRoomCode(code)
    setSlides([])
    try {
      await createLeaderRoom(code, 'Leader')
      setView('leader')
      toast.success(`Room ${code} created! Share the code to invite members.`, { duration: 4000 })
    } catch (err) {
      toast.error('Failed to create room. Running in local mode.')
      await createLeaderRoom(code, 'Leader') // LocalChannel fallback always works
      setView('leader')
    }
  }, [createLeaderRoom])

  const handleAddSlide = useCallback((slide) => {
    setSlides((prev) => [...prev, slide])
    toast.success('Slide added', { duration: 1500 })
  }, [])

  const handleBroadcast = useCallback(async (slide, index, total) => {
    try {
      await leaderBroadcast(roomCode, slide, index, total)
      toast.success(`Pushed to ${Object.keys(roomData?.members || {}).length || 'all'} members`, { duration: 2000 })
    } catch (err) {
      toast.error('Broadcast failed — try again')
    }
  }, [leaderBroadcast, roomCode, roomData])

  const handleLeaderExit = useCallback(async () => {
    try {
      await leaderClose(roomCode)
    } catch {}
    setView('home')
    setSlides([])
    setRoomCode('')
    toast('Session ended', { icon: '🕯️' })
  }, [leaderClose, roomCode])

  // ── MEMBER ────────────────────────────────────────────────────────────────

  const handleJoin = useCallback(async (code) => {
    const memberId = memberIdRef.current
    const memberName = memberNameRef.current
    setRoomCode(code)
    try {
      await joinMemberRoom(code, memberId, memberName)
      setView('member')
      toast.success(`Joined room ${code}`, { duration: 2000 })
    } catch (err) {
      if (err.message === 'Room not found') {
        toast.error('Room not found. Check the code and try again.')
      } else {
        // LocalChannel fallback — works same-device
        await joinMemberRoom(code, memberId, memberName)
        setView('member')
        toast.success(`Joined room ${code}`, { duration: 2000 })
      }
    }
  }, [joinMemberRoom])

  const handleMemberLeave = useCallback(async () => {
    try {
      await memberLeave(roomCode, memberIdRef.current)
    } catch {}
    setView('home')
    setRoomCode('')
    toast('Left the room', { icon: '👋' })
  }, [memberLeave, roomCode])

  return (
    <>
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: '#1A1E35',
            color: '#F0EBE0',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '10px',
            fontSize: '13px',
          },
          success: {
            iconTheme: { primary: '#C9A84C', secondary: '#1A1200' },
          },
        }}
      />

      {view === 'home' && (
        <HomeScreen onLeader={handleStartLeader} onJoin={handleJoin} />
      )}

      {view === 'leader' && (
        <LeaderScreen
          roomCode={roomCode}
          roomData={roomData || {}}
          slides={slides}
          onSlideAdd={handleAddSlide}
          onBroadcast={handleBroadcast}
          onExit={handleLeaderExit}
        />
      )}

      {view === 'member' && (
        <MemberScreen
          roomCode={roomCode}
          roomData={roomData || {}}
          onLeave={handleMemberLeave}
        />
      )}
    </>
  )
}
