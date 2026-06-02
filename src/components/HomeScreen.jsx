import React, { useState, useEffect } from 'react'

const SAMPLE_VERSES = [
  { type: 'verse', ref: 'John 3:16', content: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.' },
  { type: 'verse', ref: 'Psalm 23:1', content: 'The LORD is my shepherd; I shall not want.' },
  { type: 'verse', ref: 'Romans 8:28', content: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.' },
  { type: 'verse', ref: 'Philippians 4:13', content: 'I can do all this through him who gives me strength.' },
  { type: 'verse', ref: 'Jeremiah 29:11', content: '"For I know the plans I have for you," declares the LORD, "plans to prosper you and not to harm you, plans to give you hope and a future."' },
]

export function HomeScreen({ onLeader, onJoin }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [activeVerse, setActiveVerse] = useState(0)

  useEffect(() => {
    // Auto-fill join code from URL
    const params = new URLSearchParams(window.location.search)
    const joinCode = params.get('join')
    if (joinCode && /^\d{4}$/.test(joinCode)) {
      setCode(joinCode)
    }

    const interval = setInterval(() => {
      setActiveVerse((v) => (v + 1) % SAMPLE_VERSES.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  const handleJoin = () => {
    if (!/^\d{4}$/.test(code)) {
      setError('Please enter a valid 4-digit room code')
      return
    }
    setError('')
    onJoin(code)
  }

  const verse = SAMPLE_VERSES[activeVerse]

  return (
    <div className="min-h-screen bg-deep flex flex-col relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-radial from-gold/5 to-transparent rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle, #C9A84C 1px, transparent 1px)', backgroundSize: '48px 48px' }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 flex justify-center pt-10 pb-2">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold to-gold-dim flex items-center justify-center mx-auto mb-4 shadow-lg shadow-gold/20">
            <span className="text-2xl text-stone-900">✦</span>
          </div>
          <h1 className="font-serif text-4xl font-medium text-stone-100 tracking-tight">GatherWord</h1>
          <p className="text-sm text-stone-500 mt-1.5 tracking-wide">Real-time Bible study · No accounts needed</p>
        </div>
      </header>

      {/* Animated verse strip */}
      <div className="relative z-10 my-8 mx-auto max-w-lg px-6 text-center">
        <div key={activeVerse} className="animate-fade-in">
          <p className="font-serif italic text-lg text-stone-300 leading-relaxed mb-2">
            &ldquo;{verse.content}&rdquo;
          </p>
          <span className="text-sm text-gold/70 font-serif">— {verse.ref}</span>
        </div>
        <div className="flex justify-center gap-1.5 mt-4">
          {SAMPLE_VERSES.map((_, i) => (
            <div key={i} className={`w-1 h-1 rounded-full transition-all duration-500 ${i === activeVerse ? 'bg-gold w-3' : 'bg-stone-600'}`} />
          ))}
        </div>
      </div>

      {/* Action Cards */}
      <div className="relative z-10 flex gap-4 justify-center px-5 flex-wrap mt-2">
        {/* Leader Card */}
        <button
          onClick={onLeader}
          className="group flex-1 min-w-[200px] max-w-[260px] bg-surface border border-gold/20 rounded-2xl p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:border-gold/50 hover:bg-surface-2 hover:shadow-xl hover:shadow-gold/10"
        >
          <div className="text-3xl mb-4">🕯️</div>
          <h3 className="text-base font-semibold text-stone-100 mb-1.5">I'm the Leader</h3>
          <p className="text-sm text-stone-400 leading-relaxed">Create a session and push Bible verses & questions to your group in real-time</p>
          <div className="mt-4 text-xs font-semibold text-gold tracking-wide flex items-center gap-1.5">
            Create a room <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
          </div>
        </button>

        {/* Member Card */}
        <div className="group flex-1 min-w-[200px] max-w-[260px] bg-surface border border-blue-500/20 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/40 hover:bg-surface-2 hover:shadow-xl hover:shadow-blue-500/10">
          <div className="text-3xl mb-4">📖</div>
          <h3 className="text-base font-semibold text-stone-100 mb-1.5">I'm a Member</h3>
          <p className="text-sm text-stone-400 leading-relaxed mb-4">Enter the 4-digit code or scan a QR code to follow along</p>

          <div className="flex gap-2">
            <input
              className="flex-1 bg-deep border border-white/10 rounded-xl px-3 py-2.5 text-center text-xl font-bold text-gold tracking-[8px] outline-none focus:border-blue-400/50 transition-colors placeholder:text-stone-600 placeholder:tracking-normal placeholder:text-sm placeholder:font-normal"
              placeholder="Code"
              maxLength={4}
              value={code}
              onChange={(e) => { setCode(e.target.value.replace(/\D/g, '')); setError('') }}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
            />
            <button
              onClick={handleJoin}
              className="px-4 py-2.5 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-xl transition-colors text-sm"
            >
              Join
            </button>
          </div>
          {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 mt-auto pb-8 text-center">
        <p className="text-xs text-stone-600">No account · No download · No friction</p>
      </div>
    </div>
  )
}
