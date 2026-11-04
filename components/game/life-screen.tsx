'use client'

import { useRef } from 'react'
import { AlertTriangle, Check, Lock, Moon, Smartphone, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ACTIVITIES, CHALLENGES, MAIN_LABELS, PHASES, SLEEP_FROM, SUB_LABELS } from '@/lib/game/data'
import {
  activityLimitReached,
  activityRequirementChecks,
  canPerformAnyActivity,
  computeEffectiveSubs,
  effectiveMain,
  dependencyGainMultiplier,
  formatClock,
  isActivityAvailable,
} from '@/lib/game/engine'
import { cn } from '@/lib/utils'
import { useGame } from './game-provider'
import { ACTIVITY_ICONS } from './icons'
import type { Activity, ActivityId, GainKey } from '@/lib/game/types'

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}h${m ? String(m).padStart(2, '0') : ''}` : `${m}min`
}

function ActivityPin({ activity, selected, available, executable, onSelect }: { activity: Activity; selected: boolean; available: boolean; executable: boolean; onSelect: (id: ActivityId) => void }) {
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const clearHold = () => { if (holdTimer.current) clearTimeout(holdTimer.current); holdTimer.current = null }
  const Icon = ACTIVITY_ICONS[activity.id]
  return <button type="button" aria-label={`Ver detalhes: ${activity.name}`} aria-pressed={selected} data-available={executable} onClick={() => onSelect(activity.id)} onPointerDown={() => { clearHold(); holdTimer.current = setTimeout(() => onSelect(activity.id), 450) }} onPointerUp={clearHold} onPointerCancel={clearHold} onPointerLeave={clearHold} className={cn('relative flex min-h-20 min-w-14 flex-col items-center justify-center gap-1 rounded-2xl border px-2 py-2 text-center transition active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/50', selected ? 'border-primary bg-primary text-primary-foreground shadow-md' : executable ? 'border-border bg-card hover:-translate-y-0.5 hover:border-primary hover:shadow-sm' : 'border-border bg-muted text-muted-foreground opacity-70')}>
    <span className={cn('flex size-11 items-center justify-center rounded-xl', selected ? 'bg-primary-foreground/15' : executable ? 'bg-accent text-accent-foreground' : 'bg-background')}><Icon className="size-5" aria-hidden="true" /></span>
    <span className="max-w-24 text-[11px] font-bold leading-tight">{activity.name}</span>
    {!available ? <Lock className="absolute right-1.5 top-1.5 size-3.5" aria-hidden="true" /> : null}
  </button>
}

function ActivityDetails({ activity, onClose, onConfirm }: { activity: Activity; onClose: () => void; onConfirm: () => void }) {
  const { state } = useGame()
  const available = isActivityAvailable(state, activity.id)
  const limitReached = activityLimitReached(state, activity.id)
  const checks = available ? activityRequirementChecks(state, activity.id) : []
  const executable = available && !limitReached && checks.every((check) => check.ok)
  const Icon = ACTIVITY_ICONS[activity.id]
  const effects = [...Object.entries(activity.effects.main ?? {}), ...Object.entries(activity.effects.sub ?? {})] as [GainKey, number][]
  const unavailableReason = !available ? `Libera em ${PHASES[activity.minPhase].name}.` : limitReached ? `Limite diário atingido (${activity.dailyLimit}x).` : checks.some((check) => !check.ok) ? 'Os requisitos destacados ainda não foram alcançados.' : null

  return <div className="relative rounded-3xl border border-primary/35 bg-card p-4 shadow-xl" role="region" aria-label={`Detalhes de ${activity.name}`}>
    <div className="flex items-start gap-3"><span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground"><Icon className="size-5" aria-hidden="true" /></span><div className="min-w-0 flex-1"><h3 className="font-display text-lg font-bold">{activity.name}</h3><p className="text-sm text-muted-foreground">{activity.description}</p></div><button type="button" aria-label="Fechar detalhes" onClick={onClose} className="flex size-11 shrink-0 items-center justify-center rounded-full hover:bg-secondary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/40"><X className="size-4" aria-hidden="true" /></button></div>
    <div className="mt-3 flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-secondary px-2.5 py-1 font-medium">Tempo: {formatDuration(activity.minutes)}</span><span className="rounded-full bg-secondary px-2.5 py-1 font-medium">Hoje: {state.dailyActivityCounts[activity.id]}/{activity.dailyLimit ?? '∞'}</span>{effects.map(([key, value]) => <span key={key} className={cn('rounded-full px-2.5 py-1 font-medium', value >= 0 ? 'bg-accent/15' : 'bg-destructive/10 text-destructive')}>{value > 0 ? '+' : ''}{value} {MAIN_LABELS[key as keyof typeof MAIN_LABELS] ?? SUB_LABELS[key as keyof typeof SUB_LABELS]}</span>)}</div>
    <div className="mt-3 flex flex-wrap gap-1.5">{checks.length === 0 ? <span className="text-xs text-muted-foreground">Sem requisitos de atributo.</span> : checks.map((check) => <span key={check.key} className={cn('flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium', check.ok ? 'bg-accent/15' : 'bg-destructive/10 text-destructive')}>{check.ok ? <Check className="size-3" /> : <X className="size-3" />}{SUB_LABELS[check.key]} {Math.round(check.value)}/{check.required}</span>)}</div>
    {unavailableReason ? <p className="mt-3 text-sm font-medium text-destructive" role="status">{unavailableReason}</p> : null}
    <Button className="mt-4 h-11 w-full rounded-2xl" disabled={!executable} onClick={onConfirm}>Confirmar atividade · {formatDuration(activity.minutes)}</Button>
  </div>
}

export function LifeScreen({ selectedActivity, onSelectActivity }: { selectedActivity: ActivityId | null; onSelectActivity: (id: ActivityId | null) => void }) {
  const { state, dispatch } = useGame()
  const subs = computeEffectiveSubs(state)
  const mult = dependencyGainMultiplier(effectiveMain(state).dependencia)
  const canSleep = state.minutes >= SLEEP_FROM
  const canDoActivity = canPerformAnyActivity(state)
  const scheduled = state.challenge ? CHALLENGES.find((c) => c.id === state.challenge!.id) : null
  const selected = ACTIVITIES.find((activity) => activity.id === selectedActivity) ?? null

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-4">
        {state.lastActivityResult ? <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm" role="status"><span className="font-semibold">Resultado:</span>{Object.entries(state.lastActivityResult.gains).map(([key, value]) => <span key={key} className="rounded-full bg-card px-2 py-1 font-medium">+{Number(value.toFixed(1))} {MAIN_LABELS[key as keyof typeof MAIN_LABELS] ?? SUB_LABELS[key as keyof typeof SUB_LABELS]}</span>)}{state.lastActivityResult.reduced ? <span className="text-muted-foreground">Rendimento reduzido por repetição.</span> : null}</div> : null}
        {scheduled && state.challenge ? (
          <div
            className="flex flex-wrap items-center gap-3 rounded-3xl border-2 border-dashed border-primary bg-primary/10 p-4"
            role="status"
          >
            <AlertTriangle className="size-6 shrink-0 text-primary" aria-hidden="true" />
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="font-display font-bold">
                Desafio obrigatório às {formatClock(state.challenge.hour * 60)}: {scheduled.name}
              </span>
              <span className="text-sm text-muted-foreground">
                Precisa de{' '}
                {scheduled.requires
                  .map((k) => `${SUB_LABELS[k]} ${state.challenge!.threshold} (você: ${Math.round(subs[k])})`)
                  .join(' e ')}
                . Se falhar, perde muitos atributos.
              </span>
            </div>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => { onSelectActivity(null); dispatch({ type: 'OPEN_SOCIAL' }) }}
          className="group relative flex items-center gap-4 overflow-hidden rounded-3xl bg-foreground p-5 text-left text-background transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/50"
        >
          <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 via-primary to-amber-400">
            <Smartphone className="size-7 text-white" aria-hidden="true" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="font-display text-xl font-bold">Abrir a Webings</span>
            <span className="text-sm text-background/70 text-pretty">
              {state.phase === 0
                ? 'O tablet dos seus pais está ali, dando sopa...'
                : 'Felicidade fácil. Mas o tempo passa cada vez mais rápido lá dentro.'}
            </span>
          </div>
          <span className="hidden rounded-full bg-background/10 px-3 py-1 text-xs font-medium sm:block">
            Hoje: {Math.round(state.screenMinutesToday)} min de tela
          </span>
        </button>

        <section aria-labelledby="atividades-title" className="flex flex-col gap-3">
          <div className="flex items-end justify-between gap-2">
            <h2 id="atividades-title" className="font-display text-lg font-bold">
              Atividades da vida real
            </h2>
            {mult < 1 ? (
              <span className="text-xs font-medium text-destructive">
                Dependência reduz seus ganhos em {Math.round((1 - mult) * 100)}%
              </span>
            ) : null}
          </div>
          <div className="grid grid-cols-3 gap-2 min-[430px]:grid-cols-5">
            {ACTIVITIES.map((activity) => {
              const available = isActivityAvailable(state, activity.id)
              const limitReached = activityLimitReached(state, activity.id)
              const checks = available ? activityRequirementChecks(state, activity.id) : []
              const ok = available && !limitReached && checks.every((c) => c.ok)
              return <ActivityPin key={activity.id} activity={activity} selected={selectedActivity === activity.id} available={available} executable={ok} onSelect={onSelectActivity} />
            })}
          </div>
          {selected ? <ActivityDetails activity={selected} onClose={() => onSelectActivity(null)} onConfirm={() => { dispatch({ type: 'DO_ACTIVITY', id: selected.id }); onSelectActivity(null) }} /> : null}
        </section>
      </div>

      <aside className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 rounded-3xl border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <Moon className="size-5 text-chart-4" aria-hidden="true" />
            <h2 className="font-display font-bold">Dormir</h2>
          </div>
          <p className="text-sm text-muted-foreground text-pretty">
            Dormir passa {PHASES[state.phase].yearsPerSleep === 1 ? '1 ano' : `${PHASES[state.phase].yearsPerSleep} anos`} e
            recupera seus atributos. Quanto mais cedo, mais você descansa. À meia-noite você dorme à força.
          </p>
          <Button
            size="lg"
            className="h-11 rounded-2xl text-base"
            disabled={!canSleep}
            onClick={() => { onSelectActivity(null); dispatch({ type: 'GO_TO_SLEEP' }) }}
          >
            {canSleep ? 'Ir para a cama' : `Disponível a partir das ${formatClock(SLEEP_FROM)}`}
          </Button>
          {!canSleep && !canDoActivity ? <Button variant="outline" className="h-11 rounded-2xl" onClick={() => { onSelectActivity(null); dispatch({ type: 'WAIT_UNTIL_SLEEP' }) }}>Aguardar até {formatClock(SLEEP_FROM)}</Button> : null}
        </div>

      </aside>
    </div>
  )
}
