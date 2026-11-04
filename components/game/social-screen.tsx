'use client'

import { useEffect, useEffectEvent, useRef, useState, type ReactNode } from 'react'
import { ChevronUp, Clock, EyeOff, Heart, Info, MessageCircle, Share2, X } from 'lucide-react'
import { CATEGORIES, CATEGORY_ORDER, MAX_SOCIAL_MINUTES_PER_SECOND, REELS_PER_SPEEDUP } from '@/lib/game/data'
import { feedShare, formatClock, minutesPerSecond } from '@/lib/game/engine'
import { cn } from '@/lib/utils'
import { useGame } from './game-provider'
import { CATEGORY_ICONS, CATEGORY_STYLES } from './icons'
import { DiaryButton } from './diary-panel'
import { ReelMedia } from './reel-media'

function useSocialClock(active: boolean, tick: () => void) {
  const onTick = useEffectEvent(tick)
  useEffect(() => {
    if (!active) return
    const id = window.setInterval(() => onTick(), 1000)
    return () => window.clearInterval(id)
  }, [active])
}

export function SocialScreen({ diaryOpen, onOpenDiary }: { diaryOpen: boolean; onOpenDiary: () => void }) {
  const { state, dispatch } = useGame()
  const [algorithmOpen, setAlgorithmOpen] = useState(false)
  const reel = state.currentReel
  const rate = minutesPerSecond(state.reelsToday)
  const lastNavigation = useRef(0)
  const touchStartY = useRef<number | null>(null)

  useSocialClock(state.view === 'social' && !state.modal && !state.pendingEvent && !algorithmOpen && !diaryOpen, () => dispatch({ type: 'SOCIAL_TICK' }))

  const next = () => {
    if (algorithmOpen || diaryOpen) return
    const now = Date.now()
    if (now - lastNavigation.current < 500) return
    lastNavigation.current = now
    dispatch({ type: 'NEXT_REEL' })
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (diaryOpen) return
      if (event.key === 'Escape' && algorithmOpen) { event.preventDefault(); setAlgorithmOpen(false); return }
      if (event.key === 'ArrowDown' || event.key === 'j') { event.preventDefault(); next() }
      else if (event.key === 'l' && !algorithmOpen) dispatch({ type: 'LIKE_REEL' })
      else if (event.key === 'Escape') dispatch({ type: 'CLOSE_SOCIAL' })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const style = reel ? CATEGORY_STYLES[reel.category] : null
  const CatIcon = reel ? CATEGORY_ICONS[reel.category] : null

  return <section className="mx-auto flex min-h-[calc(100dvh-2rem)] w-full max-w-[460px] items-center justify-center sm:min-h-[calc(100dvh-3rem)]" aria-label="Feed de vídeos Webings">
    <div className="relative isolate h-[calc(100dvh-2rem)] min-h-[560px] max-h-[900px] w-full overflow-hidden bg-[#07152d] text-white shadow-2xl sm:h-[min(860px,calc(100dvh-3rem))] sm:rounded-[2rem] sm:border-4 sm:border-[#0c1f40]">
      <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="font-display text-xl font-black tracking-tight"><span className="text-[#65a8ff]">W</span>ebings</div>
        <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-black/45 px-2.5 py-1 text-xs font-semibold tabular-nums backdrop-blur" aria-live="polite"><Clock className="size-3.5" aria-hidden="true" />{formatClock(state.minutes)} · {rate}x</div>
        <div className="flex items-center gap-2"><DiaryButton onClick={onOpenDiary} inverted /><button type="button" onClick={() => dispatch({ type: 'CLOSE_SOCIAL' })} className="flex size-11 items-center justify-center rounded-full bg-black/40 backdrop-blur transition hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white" aria-label="Sair da Webings"><X className="size-6" aria-hidden="true" /></button></div>
      </header>

      <div className={cn('absolute inset-0 bg-gradient-to-br', style?.bg)} onWheel={(event) => { if (event.deltaY > 20) next() }} onTouchStart={(event) => { touchStartY.current = event.touches[0]?.clientY ?? null }} onTouchEnd={(event) => { const end = event.changedTouches[0]?.clientY; if (touchStartY.current !== null && end !== undefined && touchStartY.current - end > 55) next(); touchStartY.current = null }}>
        {reel && CatIcon ? <>
          <CatIcon className="pointer-events-none absolute left-1/2 top-1/2 size-[70vw] max-h-[420px] max-w-[420px] -translate-x-1/2 -translate-y-1/2 rotate-6 text-white/12" aria-hidden="true" />
          <ReelMedia reelId={reel.id} media={reel.media} topic={CATEGORIES[reel.category].label} />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/25" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />

          <button type="button" aria-expanded={algorithmOpen} onClick={() => setAlgorithmOpen(true)} className="absolute left-1/2 top-[4.5rem] z-20 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-black/45 px-3 py-1.5 text-xs font-semibold backdrop-blur transition hover:bg-black/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"><Info className="size-3.5" />Como seu feed está aprendendo</button>

          <nav className="absolute bottom-24 right-3 z-20 flex flex-col items-center gap-4" aria-label="Ações do vídeo">
            <VideoAction label="Curtir" detail={reel.likes} pressed={state.currentReelLiked} onClick={() => dispatch({ type: 'LIKE_REEL' })}><Heart className={cn('size-6', state.currentReelLiked && 'fill-rose-500 text-rose-500')} /></VideoAction>
            <VideoAction label="Comentários indisponíveis nesta versão" detail={String(Math.floor(reel.caption.length * 13.7))} disabled><MessageCircle className="size-6" /></VideoAction>
            <VideoAction label="Compartilhamento indisponível nesta versão" detail="Enviar" disabled><Share2 className="size-6" /></VideoAction>
            <VideoAction label="Próximo vídeo" onClick={next}><ChevronUp className="size-6" /></VideoAction>
          </nav>

          <div className="absolute bottom-5 left-4 right-20 z-20 flex flex-col gap-2 pb-[env(safe-area-inset-bottom)] drop-shadow-md">
            <p className="text-xs font-bold uppercase tracking-[.14em] text-white/90">Tema: {CATEGORIES[reel.category].label}</p>
            <div className="flex items-center gap-2"><span className={cn('flex size-9 items-center justify-center rounded-full border border-white/30', style?.chip)}><CatIcon className="size-4" aria-hidden="true" /></span><span className="text-sm font-bold">{reel.creator}</span></div>
            <p className="font-display text-lg font-bold leading-snug text-balance">{reel.caption}</p>
            <button type="button" onClick={() => dispatch({ type: 'NOT_INTERESTED' })} className="flex w-fit items-center gap-1.5 rounded-full bg-black/45 px-3 py-1.5 text-xs font-medium backdrop-blur transition hover:bg-black/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"><EyeOff className="size-3.5" aria-hidden="true" />Não tenho interesse</button>
          </div>

          {algorithmOpen ? <AlgorithmPanel onClose={() => setAlgorithmOpen(false)} /> : null}
        </> : null}
      </div>
    </div>
  </section>
}

function AlgorithmPanel({ onClose }: { onClose: () => void }) {
  const { state } = useGame()
  const shares = feedShare(state.feedWeights).sort((a, b) => b.share - a.share)
  const leader = shares[0]
  const leaderViews = state.reelsByCategory[leader.category]
  const leaderLikes = state.likesByCategory[leader.category]
  const leaderDismissals = state.notInterestedByCategory[leader.category]
  const rate = minutesPerSecond(state.reelsToday)
  const atMaximumSpeed = rate >= MAX_SOCIAL_MINUTES_PER_SECOND
  const toNextSpeedup = REELS_PER_SPEEDUP - (state.reelsToday % REELS_PER_SPEEDUP)
  const hasSignals = CATEGORY_ORDER.some((category) => state.reelsByCategory[category] + state.likesByCategory[category] + state.notInterestedByCategory[category] > 0)

  return <div className="absolute inset-0 z-40 flex items-end bg-[#020817]/70 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="algoritmo-title" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section className="flex max-h-[82%] w-full flex-col rounded-t-[2rem] border-t border-white/15 bg-[#07152d] shadow-2xl">
      <header className="flex items-center justify-between gap-3 border-b border-white/10 p-4"><div><p className="text-[11px] font-bold uppercase tracking-[.14em] text-[#8fc1ff]">Transparência do algoritmo</p><h2 id="algoritmo-title" className="font-display text-xl font-bold">Como seu feed está aprendendo</h2></div><button type="button" aria-label="Fechar informações do algoritmo" onClick={onClose} className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"><X className="size-5" /></button></header>
      <div className="overflow-y-auto p-4">
        <div className="rounded-2xl bg-white/8 p-3 text-sm text-white/80">{hasSignals ? <><strong className="text-white">{CATEGORIES[leader.category].label}</strong> lidera suas recomendações. Você concluiu {leaderViews} {leaderViews === 1 ? 'vídeo' : 'vídeos'}, curtiu {leaderLikes} e marcou {leaderDismissals} como sem interesse nessa categoria.</> : <>Seu feed ainda usa os pesos iniciais das categorias. Assistir, curtir ou marcar “Não tenho interesse” começa a personalização.</>}</div>
        <div className="mt-4 flex flex-col gap-3">{shares.map(({ category, share }) => {
          const percent = Math.round(share * 100)
          return <div key={category} className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center justify-between gap-2 text-sm"><span className="font-semibold">{CATEGORIES[category].label}</span><span className="tabular-nums text-white/70">{percent}% do peso</span></div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#65a8ff]" style={{ width: `${percent}%` }} /></div>
            <p className="mt-2 text-xs text-white/60">{state.reelsByCategory[category]} vistos · {state.likesByCategory[category]} curtidos · {state.notInterestedByCategory[category]} rejeitados</p>
          </div>
        })}</div>
        <p className="mt-4 rounded-2xl border border-[#65a8ff]/25 bg-[#65a8ff]/10 p-3 text-sm text-white/75">Assistir por mais tempo e curtir aumentam o peso do assunto. “Não tenho interesse” reduz diretamente esse peso. O painel apenas consulta esses dados e não altera suas recomendações.</p>
        <p className="mt-3 text-xs text-white/55">Velocidade atual: {rate} minuto(s) do jogo por segundo. {atMaximumSpeed ? 'A aceleração está no máximo.' : `Faltam ${toNextSpeedup} vídeos concluídos para acelerar.`}</p>
      </div>
    </section>
  </div>
}

function VideoAction({ label, detail, pressed, disabled, onClick, children }: { label: string; detail?: string; pressed?: boolean; disabled?: boolean; onClick?: () => void; children: ReactNode }) {
  return <button type="button" aria-label={label} aria-pressed={pressed} disabled={disabled} onClick={onClick} className="flex min-h-11 min-w-11 flex-col items-center gap-1 text-[11px] font-semibold disabled:opacity-55"><span className="flex size-11 items-center justify-center rounded-full bg-black/45 shadow-lg backdrop-blur transition hover:bg-black/65 focus-visible:ring-2 focus-visible:ring-white">{children}</span>{detail ? <span className="max-w-14 truncate">{detail}</span> : null}</button>
}
