import React from 'react'

export function SlideRenderer({ slide, mode = 'preview' }) {
  if (!slide) return null

  const isMember = mode === 'member'

  if (slide.type === 'verse') {
    return (
      <div className="text-center animate-fade-in">
        <span className={`
          inline-block text-[11px] font-semibold tracking-[2px] uppercase
          text-gold/60 bg-gold/8 border border-gold/20 rounded px-2.5 py-1
          ${isMember ? 'mb-8' : 'mb-6'}
        `}>
          Scripture
        </span>

        <blockquote className={`
          font-serif italic leading-relaxed text-stone-100
          ${isMember ? 'text-[clamp(22px,4vw,34px)] mb-7' : 'text-[24px] mb-5'}
        `}>
          &ldquo;{slide.content}&rdquo;
        </blockquote>

        {slide.ref && (
          <cite className={`
            font-serif not-italic text-gold font-medium block
            ${isMember ? 'text-xl' : 'text-base'}
          `}>
            — {slide.ref}
          </cite>
        )}
      </div>
    )
  }

  if (slide.type === 'question') {
    return (
      <div className="text-center animate-fade-in">
        <span className={`
          inline-block text-[11px] font-semibold tracking-[2px] uppercase
          text-blue-400/70 bg-blue-400/8 border border-blue-400/20 rounded px-2.5 py-1
          ${isMember ? 'mb-8' : 'mb-6'}
        `}>
          Discussion
        </span>

        <div className={`mx-auto mb-${isMember ? '8' : '6'} w-10 h-px bg-stone-600`} />

        <p className={`
          font-serif leading-relaxed text-stone-100
          ${isMember ? 'text-[clamp(20px,3.5vw,30px)]' : 'text-[22px]'}
        `}>
          {slide.content}
        </p>
      </div>
    )
  }

  // title / announcement
  return (
    <div className="text-center animate-fade-in">
      <p className={`
        font-serif font-medium leading-tight text-stone-100
        ${isMember ? 'text-[clamp(28px,5vw,48px)]' : 'text-[28px]'}
      `}>
        {slide.content}
      </p>
    </div>
  )
}
