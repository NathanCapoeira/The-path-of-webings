'use client'

import { useEffect, useEffectEvent, useRef, useState, type ReactNode } from 'react'
import { ChevronUp, Clock, EyeOff, Heart, Info, MessageCircle, Share2, X } from 'lucide-react'
import { CATEGORIES, MAX_SOCIAL_MINUTES_PER_SECOND, REELS_PER_SPEEDUP } from '@/lib/game/data'
import { feedShare, formatClock, minutesPerSecond } from '@/lib/game/engine'
import { cn } from '@/lib/utils'
import { useGame } from './game-provider'
import { CATEGORY_ICONS, CATEGORY_STYLES } from './icons'

function useSocialClock(active: boolean, tick: () => void) {
  const onTick = useEffectEvent(tick)
  useEffect(() => {
    if (!active) return
    const id = window.setInterval(() => onTick(), 1000)
    return () => window.clearInterval(id)
  }, [active])
}

export function SocialScreen() {
  const { state, dispatch } = useGame()
  const [algorithmOpen, setAlgorithmOpen] = useState(false)
  const reel = state.currentReel
  const rate = minutesPerSecond(state.reelsToday)
  const atMaximumSpeed = rate >= MAX_SOCIAL_MINUTES_PER_SECOND
  const toNextSpeedup = REELS_PER_SPEEDUP - (state.reelsToday % REELS_PER_SPEEDUP)
  const lastNavigation = useRef(0)
  const touchStartY = useRef<number | null>(null)

  useSocialClock(state.view === 'social' && !state.modal && !state.pendingEvent, () => dispatch({ type: 'SOCIAL_TICK' }))

  const next = () => {
    const now = Date.now()
    if (now - lastNavigation.current < 500) return
    lastNavigation.current = now
    dispatch({ type: 'NEXT_REEL' })
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowDown' || event.key === 'j') { event.preventDefault(); next() }
      else if (event.key === 'l') dispatch({ type: 'LIKE_REEL' })
      else if (event.key === 'Escape') dispatch({ type: 'CLOSE_SOCIAL' })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const style = reel ? CATEGORY_STYLES[reel.category] : null
  const CatIcon = reel ? CATEGORY_ICONS[reel.category] : null
  const leadingCategory = feedShare(state.feedWeights).sort((a, b) => b.share - a.share)[0]

  return <section className="mx-auto flex min-h-[calc(100dvh-2rem)] w-full max-w-[460px] items-center justify-center sm:min-h-[calc(100dvh-3rem)]" aria-label="Feed de vídeos Webings">
    <div className="relative isolate h-[calc(100dvh-2rem)] min-h-[560px] max-h-[900px] w-full overflow-hidden bg-[#07152d] text-white shadow-2xl sm:h-[min(860px,calc(100dvh-3rem))] sm:rounded-[2rem] sm:border-4 sm:border-[#0c1f40]">
      <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="font-display text-xl font-black tracking-tight"><span className="text-[#65a8ff]">W</span>ebings</div>
        <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-black/35 px-2.5 py-1 text-xs font-semibold tabular-nums backdrop-blur" aria-live="polite"><Clock className="size-3.5" aria-hidden="true" />{formatClock(state.minutes)} · {rate}x</div>
        <button type="button" onClick={() => dispatch({ type: 'CLOSE_SOCIAL' })} className="flex size-11 items-center justify-center rounded-full bg-black/40 backdrop-blur transition hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white" aria-label="Sair da Webings"><X className="size-6" aria-hidden="true" /></button>
      </header>

      <div className={cn('absolute inset-0 bg-gradient-to-br', style?.bg)} onWheel={(event) => { if (event.deltaY > 20) next() }} onTouchStart={(event) => { touchStartY.current = event.touches[0]?.clientY ?? null }} onTouchEnd={(event) => { const end = event.changedTouches[0]?.clientY; if (touchStartY.current !== null && end !== undefined && touchStartY.current - end > 55) next(); touchStartY.current = null }}>
        {reel && CatIcon ? <>
          <CatIcon className="pointer-events-none absolute left-1/2 top-1/2 size-[70vw] max-h-[420px] max-w-[420px] -translate-x-1/2 -translate-y-1/2 rotate-6 text-white/12" aria-hidden="true" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

          <nav className="absolute bottom-24 right-3 z-20 flex flex-col items-center gap-4" aria-label="Ações do vídeo">
            <VideoAction label="Curtir" detail={reel.likes} pressed={state.currentReelLiked} onClick={() => dispatch({ type: 'LIKE_REEL' })}><Heart className={cn('size-6', state.currentReelLiked && 'fill-rose-500 text-rose-500')} /></VideoAction>
            <VideoAction label="Comentários indisponíveis nesta versão" detail={String(Math.floor(reel.caption.length * 13.7))} disabled><MessageCircle className="size-6" /></VideoAction>
            <VideoAction label="Compartilhamento indisponível nesta versão" detail="Enviar" disabled><Share2 className="size-6" /></VideoAction>
            <VideoAction label="Informações do algoritmo" pressed={algorithmOpen} onClick={() => setAlgorithmOpen((open) => !open)}><Info className="size-6" /></VideoAction>
            <VideoAction label="Próximo vídeo" onClick={next}><ChevronUp className="size-6" /></VideoAction>
          </nav>

          <div className="absolute bottom-5 left-4 right-20 z-20 flex flex-col gap-3 pb-[env(safe-area-inset-bottom)]">
            <p className="font-display text-lg font-bold leading-snug text-balance">{reel.caption}</p>
            <div className="flex items-center gap-2"><span className={cn('flex size-9 items-center justify-center rounded-full border border-white/30', style?.chip)}><CatIcon className="size-4" aria-hidden="true" /></span><div className="flex flex-col"><span className="text-sm font-bold">{reel.creator}</span><span className="text-xs text-white/70">{CATEGORIES[reel.category].label}</span></div></div>
            <button type="button" onClick={() => dispatch({ type: 'NOT_INTERESTED' })} className="flex w-fit items-center gap-1.5 rounded-full bg-black/35 px-3 py-1.5 text-xs font-medium backdrop-blur transition hover:bg-black/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"><EyeOff className="size-3.5" aria-hidden="true" />Não tenho interesse</button>
          </div>

          {algorithmOpen ? <div className="absolute left-4 right-16 top-20 z-30 rounded-2xl border border-white/15 bg-[#07152d]/95 p-4 shadow-xl backdrop-blur" role="status"><div className="flex items-center justify-between gap-2"><span className="font-display font-bold">Como seu feed está aprendendo</span><button type="button" aria-label="Fechar informações" onClick={() => setAlgorithmOpen(false)}><X className="size-4" /></button></div><p className="mt-2 text-sm text-white/75">A categoria mais recomendada é {CATEGORIES[leadingCategory.category].label}. {atMaximumSpeed ? 'Você atingiu a velocidade máxima.' : `Faltam ${toNextSpeedup} vídeos para o tempo acelerar.`}</p></div> : null}
        </> : null}
      </div>
    </div>
  </section>
}

function VideoAction({ label, detail, pressed, disabled, onClick, children }: { label: string; detail?: string; pressed?: boolean; disabled?: boolean; onClick?: () => void; children: ReactNode }) {
  return <button type="button" aria-label={label} aria-pressed={pressed} disabled={disabled} onClick={onClick} className="flex min-h-11 min-w-11 flex-col items-center gap-1 text-[11px] font-semibold disabled:opacity-55"><span className="flex size-11 items-center justify-center rounded-full bg-black/40 shadow-lg backdrop-blur transition hover:bg-black/60 focus-visible:ring-2 focus-visible:ring-white">{children}</span>{detail ? <span className="max-w-14 truncate">{detail}</span> : null}</button>
}
