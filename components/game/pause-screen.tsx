'use client'

import { Play, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar } from './avatar'
import { useGame } from './game-provider'

export function PauseScreen() {
  const { state, dispatch } = useGame()
  return <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center gap-5 px-4 py-10">
    <section className="flex flex-col items-center gap-4 rounded-[2rem] border border-border bg-card p-6 text-center shadow-lg">
      <div className="size-28 overflow-hidden rounded-3xl bg-secondary"><Avatar avatar={state.avatar} age={state.age} animate={false} /></div>
      <div><span className="text-xs font-bold uppercase tracking-widest text-primary">Partida salva</span><h1 className="font-display text-3xl font-bold">Até logo, {state.name}</h1><p className="mt-1 text-sm text-muted-foreground">Sua vida aos {state.age} anos continua guardada neste navegador.</p></div>
      <Button size="lg" className="h-12 w-full rounded-2xl" onClick={() => dispatch({ type: 'CONTINUE_GAME' })}><Play className="size-4" /> Continuar</Button>
      <Button size="lg" variant="outline" className="h-12 w-full rounded-2xl" onClick={() => { if (window.confirm('Iniciar uma nova vida substituirá a partida salva. Deseja continuar?')) dispatch({ type: 'RESTART' }) }}><RotateCcw className="size-4" /> Iniciar nova vida</Button>
    </section>
  </main>
}
