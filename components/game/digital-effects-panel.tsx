'use client'

import { CheckCircle2, Clock3, Smartphone } from 'lucide-react'
import { MAIN_LABELS, SUB_LABELS } from '@/lib/game/data'
import { computeEffectiveSubs, effectiveMain } from '@/lib/game/engine'
import type { GainKey } from '@/lib/game/types'
import { activeDigitalEffects, digitalModifiers } from '@/lib/game/digital-effects'
import { useGame } from './game-provider'

const labels = { ...MAIN_LABELS, ...SUB_LABELS } as Record<GainKey, string>

export function DigitalEffectsPanel() {
  const { state } = useGame()
  const active = activeDigitalEffects(state.digitalEffects)
  const history = state.digitalEffects.filter((effect) => effect.status !== 'active').slice(-3).reverse()
  const modifiers = digitalModifiers(state.digitalEffects)
  const main = effectiveMain(state)
  const subs = computeEffectiveSubs(state)

  return <section className="rounded-3xl border border-border bg-card p-4 shadow-sm" aria-labelledby="efeitos-digitais-title">
    <div className="flex items-start gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Smartphone className="size-5" /></span><div><h2 id="efeitos-digitais-title" className="font-display font-bold">Efeitos das Redes Sociais</h2><p className="text-sm text-muted-foreground">Consequências rastreáveis das escolhas digitais. Não representam diagnósticos médicos.</p></div></div>
    {active.length === 0 ? <div className="mt-3 flex items-center gap-2 rounded-2xl bg-accent/10 p-3 text-sm"><CheckCircle2 className="size-4 text-accent" /><span>Nenhum efeito digital ativo.</span></div> : <div className="mt-3 grid gap-3 md:grid-cols-2">{active.map((effect) => {
      const effective = effect.targetAttribute in main ? main[effect.targetAttribute as keyof typeof main] : subs[effect.targetAttribute as keyof typeof subs]
      const base = effective - (modifiers[effect.targetAttribute] ?? 0)
      return <article key={effect.id} className="rounded-2xl border border-destructive/25 bg-destructive/5 p-3">
        <div className="flex items-start justify-between gap-2"><h3 className="font-semibold">{effect.label}</h3><span className="rounded-full bg-destructive/10 px-2 py-1 text-xs font-bold text-destructive">{labels[effect.targetAttribute]} {effect.modifierValue}</span></div>
        <p className="mt-1 text-sm text-muted-foreground">{effect.description}</p>
        <p className="mt-2 text-xs"><strong>Cálculo:</strong> sem efeito {Math.round(base)} {modifiers[effect.targetAttribute] ?? 0} = efetivo {Math.round(effective)}</p>
        <p className="mt-1 text-xs text-muted-foreground"><strong>Origem:</strong> {effect.sourceEventId.replace('feed:', 'vídeo ').replace('screen-time:', 'tempo de tela no vídeo ').replace('sleep-option:feed', 'feed antes de dormir')}</p>
        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><Clock3 className="size-3" />{effect.recoveryRule} · até {effect.remainingSleeps} {effect.remainingSleeps === 1 ? 'sono' : 'sonos'}</p>
      </article>
    })}</div>}
    {history.length > 0 ? <details className="mt-3 text-sm"><summary className="cursor-pointer font-medium text-muted-foreground">Histórico recente ({history.length})</summary><ul className="mt-2 flex flex-col gap-2">{history.map((effect) => <li key={effect.id} className="rounded-xl bg-secondary px-3 py-2"><span className="font-medium">{effect.label}</span> · {effect.endReason} aos {effect.endedAtAge} anos</li>)}</ul></details> : null}
  </section>
}
