'use client'

import { Clock, LogOut, Users } from 'lucide-react'
import { ACTIVITIES, DIFFICULTIES, MAIN_LABELS, PHASES, SUB_LABELS, DAY_END, DAY_START } from '@/lib/game/data'
import { computeSubs, formatClock, maxHealthForAge } from '@/lib/game/engine'
import type { ActivityId, MainKey, SubKey } from '@/lib/game/types'
import { useGame } from './game-provider'
import { MAIN_ICONS, SUB_ICONS } from './icons'
import { StatBar } from './stat-bar'
import { Avatar } from './avatar'

const MAIN_KEYS: MainKey[] = ['saude', 'disposicao', 'felicidade', 'dependencia']
const SUB_KEYS: SubKey[] = ['foco', 'sanidade', 'forca', 'inteligencia']

export function Hud({ previewActivityId = null }: { previewActivityId?: ActivityId | null }) {
  const { state, dispatch } = useGame()
  const subs = computeSubs(state.main, state.subBase)
  const phase = PHASES[state.phase]
  const dayProgress = Math.max(0, Math.min(100, ((state.minutes - DAY_START) / (DAY_END - DAY_START)) * 100))
  const previewActivity = ACTIVITIES.find((activity) => activity.id === previewActivityId)
  const previewEnd = previewActivity ? Math.min(DAY_END, state.minutes + previewActivity.minutes) : null
  const previewWidth = previewEnd === null ? 0 : ((previewEnd - state.minutes) / (DAY_END - DAY_START)) * 100
  const hue = 205 + dayProgress * 0.3
  const lightness = 78 - dayProgress * 0.53
  const darkClock = dayProgress > 52

  return (
    <header className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-4 shadow-sm md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="size-12 shrink-0 overflow-hidden rounded-2xl bg-secondary">
            <Avatar avatar={state.avatar} age={state.age} reaction={state.avatarReaction} />
          </div>
          <div className="flex min-w-0 flex-col">
          <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Sua jornada</span>
          <h1 className="font-display text-2xl font-bold leading-tight text-balance">{state.name}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-sm font-medium">
            <Users className="size-4" aria-hidden="true" />
            <span className="tabular-nums">{state.followers.toLocaleString('pt-BR')}</span>
            <span className="sr-only">seguidores</span>
          </div>
          <button type="button" aria-label="Sair da partida" title="Sair da partida" onClick={() => { if (window.confirm('Sair para o menu? Seu progresso já está salvo.')) dispatch({ type: 'EXIT_TO_MENU' }) }} className="flex size-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/40"><LogOut className="size-4" aria-hidden="true" /></button>
        </div>
      </div>

      <div className={`relative overflow-hidden rounded-2xl border border-white/20 px-4 py-3 shadow-inner transition-colors duration-700 ${darkClock ? 'text-white' : 'text-foreground'}`} style={{ background: `linear-gradient(135deg, hsl(${hue} 78% ${lightness}%), hsl(${hue + 18} 72% ${Math.max(16, lightness - 10)}%))` }} aria-label={`Relógio do jogo: ${formatClock(state.minutes)}`}>
        <div className="flex items-center justify-between gap-3">
          <span className="flex min-w-0 items-center gap-2 text-sm font-semibold"><Clock className="size-4 shrink-0" aria-hidden="true" /><span className="truncate">{phase.name} — {state.age} {state.age === 1 ? 'ano' : 'anos'}<span className="hidden sm:inline"> · {DIFFICULTIES[state.difficulty].label}</span></span></span>
          <span className="shrink-0 font-display text-xl font-black tabular-nums">{formatClock(state.minutes)}</span>
        </div>
        {previewActivity && previewEnd !== null ? <p className={`mt-1 text-xs font-medium ${darkClock ? 'text-white/80' : 'text-foreground/70'}`} aria-live="polite">Prévia: {previewActivity.name} · {formatClock(state.minutes)} → {formatClock(previewEnd)}</p> : null}
        <div className={`relative mt-2 h-2 overflow-hidden rounded-full ${darkClock ? 'bg-white/20' : 'bg-white/45'}`}>
          <div className="absolute inset-y-0 left-0 rounded-full bg-white/75 transition-all duration-500" style={{ width: `${dayProgress}%` }} />
          {previewActivity ? <div className="absolute inset-y-0 rounded-full border border-dashed border-white bg-primary/65" style={{ left: `${dayProgress}%`, width: `${previewWidth}%` }} aria-hidden="true" /> : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
        <section aria-label="Atributos principais" className="grid grid-cols-2 gap-x-4 gap-y-3">
          {MAIN_KEYS.map((key) => <StatBar key={key} label={MAIN_LABELS[key]} value={state.main[key]} max={key === 'saude' ? maxHealthForAge(state.age) : 100} icon={MAIN_ICONS[key]} inverted={key === 'dependencia'} />)}
        </section>
        <section
          aria-label="Sub atributos"
          className="grid grid-cols-2 gap-2 border-t border-border pt-3 min-[380px]:grid-cols-4 md:border-t-0 md:border-l md:pt-0 md:pl-4"
        >
          {SUB_KEYS.map((key) => { const Icon = SUB_ICONS[key]; return <div key={key} className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-secondary py-2"><Icon className="size-4 text-muted-foreground" aria-hidden="true" /><span className="font-display text-lg font-bold tabular-nums leading-none">{Math.round(subs[key])}</span><span className="text-[11px] text-muted-foreground">{SUB_LABELS[key]}</span></div> })}
        </section>
      </div>
    </header>
  )
}
