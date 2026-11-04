'use client'

import { useEffect, useState } from 'react'
import { BookOpen, X } from 'lucide-react'
import { formatClock } from '@/lib/game/engine'
import { cn } from '@/lib/utils'
import { useGame } from './game-provider'

export function DiaryButton({ onClick, inverted = false }: { onClick: () => void; inverted?: boolean }) {
  const { state } = useGame()
  const unread = state.log.filter((entry) => entry.id > state.lastReadLogId).length
  return <button type="button" onClick={onClick} aria-label={`Abrir Diário${unread ? `, ${unread} ${unread === 1 ? 'entrada não lida' : 'entradas não lidas'}` : ''}`} title="Diário" className={cn('relative flex size-11 items-center justify-center rounded-full transition focus-visible:outline-none focus-visible:ring-4', inverted ? 'bg-black/40 text-white backdrop-blur hover:bg-black/60 focus-visible:ring-white/50' : 'border border-border bg-card text-muted-foreground hover:text-foreground focus-visible:ring-ring/40')}>
    <BookOpen className="size-5" aria-hidden="true" />
    {unread > 0 ? <span className="absolute -right-0.5 -top-0.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold leading-none text-white" aria-hidden="true">{Math.min(unread, 9)}{unread > 9 ? '+' : ''}</span> : null}
  </button>
}

export function DiaryPanel({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useGame()
  const [readBoundary] = useState(state.lastReadLogId)

  useEffect(() => { dispatch({ type: 'MARK_LOG_READ' }) }, [dispatch])
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous }
  }, [])
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return <div className="fixed inset-0 z-[80] flex items-end justify-center bg-[#07152d]/70 p-0 backdrop-blur-sm sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="diario-title" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section className="flex max-h-[82dvh] w-full max-w-xl flex-col rounded-t-[2rem] bg-card text-foreground shadow-2xl sm:rounded-[2rem]">
      <header className="flex items-center justify-between gap-3 border-b border-border p-5">
        <div><p className="text-xs font-bold uppercase tracking-[.16em] text-primary">Sua história</p><h2 id="diario-title" className="font-display text-2xl font-bold">Diário</h2></div>
        <button type="button" onClick={onClose} aria-label="Fechar Diário" className="flex size-11 items-center justify-center rounded-full bg-secondary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/40"><X className="size-5" /></button>
      </header>
      <div className="overflow-y-auto p-5">
        {state.log.length === 0 ? <p className="rounded-2xl bg-secondary p-4 text-sm text-muted-foreground">Sua história começa agora. Os acontecimentos serão registrados aqui.</p> : <ol className="flex flex-col gap-3">{[...state.log].reverse().map((entry) => {
          const unread = entry.id > readBoundary
          return <li key={entry.id} className={cn('relative rounded-2xl border p-4', unread ? 'border-primary/45 bg-primary/8' : 'border-border bg-background')}>
            {unread ? <span className="absolute right-3 top-3 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">Nova</span> : null}
            <p className="pr-12 text-xs font-semibold tabular-nums text-muted-foreground">{entry.age} {entry.age === 1 ? 'ano' : 'anos'} · {formatClock(entry.time)}</p>
            <p className="mt-1 text-sm leading-relaxed">{entry.text}</p>
          </li>
        })}</ol>}
      </div>
    </section>
  </div>
}
