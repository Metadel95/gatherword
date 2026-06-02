import React from 'react'

const TYPE_LABELS = {
  verse: 'Scripture',
  question: 'Discussion',
  title: 'Title',
}
const TYPE_COLORS = {
  verse: 'text-gold border-gold/30 bg-gold/5',
  question: 'text-blue-400 border-blue-400/30 bg-blue-400/5',
  title: 'text-purple-400 border-purple-400/30 bg-purple-400/5',
}

export function SlideCard({ slide, isActive, isLive, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`
        relative p-3 rounded-xl border cursor-pointer transition-all duration-200 mb-1.5
        ${isActive
          ? 'border-gold/60 bg-gold/8 shadow-sm shadow-gold/10'
          : isLive
            ? 'border-emerald-500/40 bg-emerald-500/5'
            : 'border-white/6 bg-surface-2 hover:bg-surface-3 hover:border-white/12'
        }
      `}
    >
      {isLive && (
        <span className="absolute top-2 right-2 text-[9px] font-bold tracking-wide bg-emerald-500 text-white rounded px-1.5 py-0.5 uppercase">
          Live
        </span>
      )}
      <div className={`text-[10px] font-semibold tracking-widest uppercase mb-1.5 ${TYPE_COLORS[slide.type]?.split(' ')[0] || 'text-stone-400'}`}>
        {TYPE_LABELS[slide.type] || slide.type}
        {slide.ref ? ` · ${slide.ref}` : ''}
      </div>
      <div className="font-serif text-[13px] text-stone-300 leading-relaxed line-clamp-3">
        {slide.content}
      </div>
    </div>
  )
}
