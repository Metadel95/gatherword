import React from 'react'
import { QRCodeSVG } from 'qrcode.react'

export function QRModal({ roomCode, onClose }) {
  if (!roomCode) return null
  const joinUrl = `${window.location.origin}${window.location.pathname}?join=${roomCode}`

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-gold/20 rounded-2xl p-8 text-center max-w-sm w-[90%] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-serif text-2xl mb-1 text-stone-100">Invite Members</h3>
        <p className="text-sm text-stone-400 mb-6">
          Have them scan this QR code or enter the room code
        </p>

        {/* QR Code */}
        <div className="bg-white rounded-xl p-4 w-48 h-48 mx-auto mb-5 flex items-center justify-center">
          <QRCodeSVG
            value={joinUrl}
            size={160}
            level="M"
            fgColor="#0D0F1A"
            bgColor="#ffffff"
            imageSettings={{
              src: '/icon.svg',
              height: 24,
              width: 24,
              excavate: true,
            }}
          />
        </div>

        {/* Room Code */}
        <div className="text-5xl font-bold tracking-[12px] text-gold mb-2 font-sans">
          {roomCode}
        </div>
        <p className="text-xs text-stone-500 mb-6">
          Go to <span className="text-stone-300">{window.location.hostname}</span> and enter this code
        </p>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-gold text-stone-900 font-semibold hover:bg-yellow-400 transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  )
}
