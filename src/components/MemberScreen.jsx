import React, { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { SlideRenderer } from './SlideRenderer'
import { useWakeLock } from '../hooks/useWakeLock'

export function MemberScreen({ roomCode, roomData, onLeave }) {
  const { requestWakeLock, releaseWakeLock } = useWakeLock()
  const [prevSlide, setPrevSlide] = useState(null)
  const currentSlide = roomData?.currentSlide || null
  const slideKey = currentSlide?.broadcastAt || currentSlide?.id || 'empty'

  useEffect(() => {
    requestWakeLock()
    return () => { releaseWakeLock() }
  }, [requestWakeLock, releaseWakeLock])

  const members = Object.keys(roomData?.members || {})

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: '#07090F' }}
    >
      {/* Ambient glow — very subtle, warm */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 45%, rgba(201,168,76,0.028) 0%, transparent 70%)',
        }}
      />

      {/* Top bar — ultra minimal */}
      <div className="relative z-20 flex items-center justify-between px-5 pt-4 pb-2">
        <div
          className="text-xs text-stone-700 border border-stone-800 rounded-md px-2.5 py-1"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          Room {roomCode}
        </div>

        {currentSlide && (
          <div className="text-xs text-stone-700">
            {(currentSlide.index ?? 0) + 1} / {currentSlide.total ?? '?'}
          </div>
        )}

        <button
          onClick={onLeave}
          className="text-xs text-stone-700 hover:text-stone-400 border border-stone-800 hover:border-stone-600 rounded-md px-2.5 py-1 transition-colors"
        >
          Leave
        </button>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex items-center justify-center px-8 relative z-10">
        <AnimatePresence mode="wait">
          {currentSlide ? (
            <motion.div
              key={slideKey}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-2xl w-full text-center"
            >
              <SlideRenderer slide={currentSlide} mode="member" />
            </motion.div>
          ) : (
            <motion.div
              key="waiting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              {/* Waiting state */}
              <div
                className="text-stone-800 text-5xl mb-6 select-none"
                style={{ animation: 'gentlePulse 4s ease-in-out infinite' }}
              >
                ✦
              </div>
              <p className="text-stone-600 text-sm tracking-wide">
                Waiting for the leader to begin…
              </p>
              {members.length > 0 && (
                <p className="text-stone-700 text-xs mt-2">
                  {members.length} {members.length === 1 ? 'person' : 'people'} in the room
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom safe area */}
      <div className="h-8 flex-shrink-0" />

      <style>{`
        @keyframes gentlePulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.04); }
        }
      `}</style>
    </div>
  )
}
