import React, { useState, useCallback, useRef } from 'react'
import { SlideCard } from './SlideCard'
import { SlideRenderer } from './SlideRenderer'
import { QRModal } from './QRModal'
import { QRCodeSVG } from 'qrcode.react'

const QUICK_SLIDES = [
  { type: 'verse', ref: 'John 3:16', content: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.' },
  { type: 'verse', ref: 'Psalm 23:1', content: 'The LORD is my shepherd; I shall not want.' },
  { type: 'verse', ref: 'Romans 8:28', content: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.' },
  { type: 'question', ref: '', content: 'How has God been a shepherd in your life this week?' },
  { type: 'question', ref: '', content: 'Where do you see God\'s love at work in your community?' },
  { type: 'title', ref: '', content: 'Welcome to Small Group' },
]

const MEMBER_COLORS = [
  'bg-blue-500/20 text-blue-300',
  'bg-emerald-500/20 text-emerald-300',
  'bg-purple-500/20 text-purple-300',
  'bg-amber-500/20 text-amber-300',
  'bg-rose-500/20 text-rose-300',
  'bg-teal-500/20 text-teal-300',
]

export function LeaderScreen({ roomCode, roomData, slides, onSlideAdd, onBroadcast, onExit }) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [liveIdx, setLiveIdx] = useState(-1)
  const [qrOpen, setQrOpen] = useState(false)
  const [addType, setAddType] = useState('verse')
  const [addRef, setAddRef] = useState('')
  const [addContent, setAddContent] = useState('')
  const [activeTab, setActiveTab] = useState('library') // 'library' | 'add'

  const members = Object.entries(roomData?.members || {})
  const currentSlide = slides[currentIdx]

  const handleAdd = useCallback(() => {
    if (!addContent.trim()) return
    const slide = { id: Date.now(), type: addType, content: addContent.trim(), ref: addRef.trim() }
    onSlideAdd(slide)
    setAddContent('')
    setAddRef('')
    setCurrentIdx(slides.length)
    setActiveTab('library')
  }, [addType, addRef, addContent, onSlideAdd, slides.length])

  const handleQuickAdd = (slide) => {
    const s = { ...slide, id: Date.now() }
    onSlideAdd(s)
    setCurrentIdx(slides.length)
  }

  const handleBroadcast = () => {
    if (!currentSlide) return
    onBroadcast(currentSlide, currentIdx, slides.length)
    setLiveIdx(currentIdx)
  }

  const navigate = (dir) => {
    const newIdx = currentIdx + dir
    if (newIdx < 0 || newIdx >= slides.length) return
    setCurrentIdx(newIdx)
  }

  const joinUrl = `${window.location.origin}${window.location.pathname}?join=${roomCode}`
  const isCurrentLive = currentIdx === liveIdx

  return (
    <div className="h-screen bg-deep flex flex-col overflow-hidden">
      {/* Top Header */}
      <header className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-surface border-b border-white/5">
        <div className="flex items-center gap-3">
          <span className="font-serif text-lg text-stone-100 hidden sm:block">GatherWord</span>

          {/* Room Code Badge */}
          <button
            onClick={() => setQrOpen(true)}
            className="flex items-center gap-2 bg-gold/10 border border-gold/25 rounded-lg px-3 py-1.5 hover:bg-gold/18 transition-colors"
          >
            <span className="text-xs text-gold/60 hidden sm:block">Room</span>
            <span className="text-sm font-bold text-gold tracking-widest">{roomCode}</span>
            <span className="text-gold/50 text-xs">📱</span>
          </button>

          {/* Live indicator */}
          <div className="flex items-center gap-1.5 text-sm text-stone-400">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{members.length} member{members.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setQrOpen(true)}
            className="text-xs border border-white/10 text-stone-400 hover:text-stone-200 hover:border-white/20 rounded-lg px-3 py-1.5 transition-colors"
          >
            Invite Members
          </button>
          <button
            onClick={onExit}
            className="text-xs border border-white/10 text-stone-400 hover:text-stone-200 hover:border-white/20 rounded-lg px-3 py-1.5 transition-colors"
          >
            ← End Session
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ── LEFT PANEL: Slide Library ────────────────────────────── */}
        <div className="w-64 xl:w-72 flex-shrink-0 bg-surface border-r border-white/5 flex flex-col overflow-hidden hidden md:flex">
          {/* Library / Add tabs */}
          <div className="flex border-b border-white/5">
            {['library', 'add'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 text-xs font-semibold tracking-widest uppercase transition-colors ${
                  activeTab === tab
                    ? 'text-gold border-b-2 border-gold'
                    : 'text-stone-500 hover:text-stone-300'
                }`}
              >
                {tab === 'library' ? `Slides (${slides.length})` : 'Add Slide'}
              </button>
            ))}
          </div>

          {activeTab === 'library' ? (
            <div className="flex-1 overflow-y-auto p-2">
              {slides.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <div className="text-3xl mb-3 opacity-30">📋</div>
                  <p className="text-xs text-stone-500 leading-relaxed">No slides yet. Add some from the &ldquo;Add Slide&rdquo; tab or use quick-add below.</p>
                </div>
              ) : (
                slides.map((slide, i) => (
                  <SlideCard
                    key={slide.id}
                    slide={slide}
                    isActive={i === currentIdx}
                    isLive={i === liveIdx}
                    onClick={() => setCurrentIdx(i)}
                  />
                ))
              )}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              <div>
                <label className="block text-[10px] text-stone-500 font-semibold tracking-widest uppercase mb-1.5">Type</label>
                <select
                  className="w-full bg-surface-2 border border-white/8 rounded-lg px-3 py-2 text-sm text-stone-200 outline-none focus:border-gold/40"
                  value={addType}
                  onChange={(e) => setAddType(e.target.value)}
                >
                  <option value="verse">Bible Verse</option>
                  <option value="question">Discussion Question</option>
                  <option value="title">Title / Announcement</option>
                </select>
              </div>

              {addType === 'verse' && (
                <div>
                  <label className="block text-[10px] text-stone-500 font-semibold tracking-widest uppercase mb-1.5">Reference</label>
                  <input
                    className="w-full bg-surface-2 border border-white/8 rounded-lg px-3 py-2 text-sm text-stone-200 outline-none focus:border-gold/40 placeholder:text-stone-600"
                    placeholder="e.g. John 3:16"
                    value={addRef}
                    onChange={(e) => setAddRef(e.target.value)}
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] text-stone-500 font-semibold tracking-widest uppercase mb-1.5">
                  {addType === 'verse' ? 'Verse Text' : addType === 'question' ? 'Question' : 'Title'}
                </label>
                <textarea
                  className="w-full bg-surface-2 border border-white/8 rounded-lg px-3 py-2 text-sm text-stone-200 outline-none focus:border-gold/40 resize-none h-24 leading-relaxed placeholder:text-stone-600"
                  placeholder={addType === 'verse' ? 'Paste verse here...' : addType === 'question' ? 'Type your question...' : 'Enter title...'}
                  value={addContent}
                  onChange={(e) => setAddContent(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && e.metaKey) handleAdd() }}
                />
              </div>

              <button
                onClick={handleAdd}
                disabled={!addContent.trim()}
                className="w-full py-2.5 rounded-lg bg-gold text-stone-900 text-sm font-semibold hover:bg-yellow-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                + Add Slide
              </button>

              {/* Quick Add */}
              <div className="border-t border-white/6 pt-3">
                <p className="text-[10px] text-stone-600 font-semibold tracking-widest uppercase mb-2">Quick Add</p>
                <div className="space-y-1.5">
                  {QUICK_SLIDES.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuickAdd(s)}
                      className="w-full text-left px-2.5 py-2 rounded-lg border border-white/5 bg-surface-2 hover:bg-surface-3 hover:border-white/10 transition-all text-xs"
                    >
                      <span className={`text-[9px] font-bold uppercase tracking-widest mr-1.5 ${s.type === 'verse' ? 'text-gold/50' : s.type === 'question' ? 'text-blue-400/60' : 'text-purple-400/60'}`}>
                        {s.type === 'verse' ? s.ref : s.type.charAt(0).toUpperCase() + s.type.slice(1)}
                      </span>
                      <span className="text-stone-400 line-clamp-1">{s.content.slice(0, 50)}…</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── CENTER: Preview Stage ────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden p-4 gap-3">
          <div className="flex-1 relative bg-surface-2 border border-white/5 rounded-2xl flex items-center justify-center overflow-hidden">
            {/* Preview watermark */}
            <span className="absolute top-3 left-4 text-[10px] font-bold tracking-widest uppercase text-stone-600">Preview</span>

            {/* Slide counter */}
            {slides.length > 0 && (
              <span className="absolute top-3 right-4 text-xs text-stone-600">
                {currentIdx + 1} / {slides.length}
              </span>
            )}

            {/* Subtle glow */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-radial from-gold/3 to-transparent" />

            <div className="max-w-xl w-full px-8 relative z-10">
              {currentSlide ? (
                <SlideRenderer slide={currentSlide} mode="preview" />
              ) : (
                <div className="text-center opacity-40">
                  <div className="text-5xl mb-4">✦</div>
                  <p className="text-stone-400 text-sm">Select or add a slide to preview</p>
                </div>
              )}
            </div>
          </div>

          {/* Broadcast Controls */}
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => navigate(-1)}
              disabled={currentIdx <= 0 || slides.length === 0}
              className="px-5 py-3.5 rounded-xl bg-surface-2 border border-white/8 text-stone-300 text-lg hover:bg-surface-3 hover:border-white/15 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ◀
            </button>

            <button
              onClick={handleBroadcast}
              disabled={!currentSlide}
              className={`flex-1 py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed ${
                isCurrentLive
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-400'
                  : 'bg-gold text-stone-900 shadow-lg shadow-gold/20 hover:bg-yellow-400 hover:shadow-gold/35'
              }`}
            >
              {isCurrentLive ? (
                <>✓ <span>Currently Live on Members&apos; Screens</span></>
              ) : (
                <>📡 <span>Push to Members&apos; Screens</span></>
              )}
            </button>

            <button
              onClick={() => navigate(1)}
              disabled={currentIdx >= slides.length - 1 || slides.length === 0}
              className="px-5 py-3.5 rounded-xl bg-surface-2 border border-white/8 text-stone-300 text-lg hover:bg-surface-3 hover:border-white/15 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ▶
            </button>
          </div>
        </div>

        {/* ── RIGHT PANEL: Room Info + Members ─────────────────────── */}
        <div className="w-52 xl:w-60 flex-shrink-0 bg-surface border-l border-white/5 flex flex-col overflow-hidden hidden lg:flex">
          {/* Mini QR */}
          <div className="p-4 border-b border-white/5 text-center">
            <p className="text-[10px] text-stone-600 font-semibold tracking-widest uppercase mb-3">Share to Join</p>
            <div className="bg-white rounded-xl p-2.5 w-32 h-32 mx-auto flex items-center justify-center cursor-pointer hover:scale-105 transition-transform" onClick={() => setQrOpen(true)}>
              <QRCodeSVG value={joinUrl} size={104} level="M" fgColor="#0D0F1A" bgColor="#ffffff" />
            </div>
            <div className="text-3xl font-bold tracking-[8px] text-gold mt-3">{roomCode}</div>
            <p className="text-[10px] text-stone-600 mt-1">Tap QR to enlarge</p>
          </div>

          {/* Members */}
          <div className="p-4 flex-1 overflow-y-auto">
            <p className="text-[10px] text-stone-600 font-semibold tracking-widest uppercase mb-3">
              Members Online ({members.length})
            </p>
            {members.length === 0 ? (
              <p className="text-xs text-stone-600 leading-relaxed">Nobody has joined yet. Share the QR code above.</p>
            ) : (
              <div className="space-y-1.5">
                {members.map(([id, member], i) => {
                  const initials = member.name?.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() || '??'
                  const colorClass = MEMBER_COLORS[i % MEMBER_COLORS.length]
                  return (
                    <div key={id} className="flex items-center gap-2 text-sm">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${colorClass}`}>
                        {initials}
                      </div>
                      <span className="text-stone-300 truncate text-xs">{member.name}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Session stats */}
          {liveIdx >= 0 && (
            <div className="p-4 border-t border-white/5">
              <p className="text-[10px] text-stone-600 font-semibold tracking-widest uppercase mb-2">Now Live</p>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2.5">
                <p className="text-xs text-emerald-400 font-medium">
                  Slide {liveIdx + 1} of {slides.length}
                </p>
                <p className="text-[11px] text-stone-400 mt-0.5 line-clamp-2 font-serif">
                  {slides[liveIdx]?.content?.slice(0, 60)}…
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* QR Modal */}
      {qrOpen && <QRModal roomCode={roomCode} onClose={() => setQrOpen(false)} />}
    </div>
  )
}
