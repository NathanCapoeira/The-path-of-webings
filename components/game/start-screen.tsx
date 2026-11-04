'use client'

import { useState } from 'react'
import { Clock, Link2, Moon, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PHASES } from '@/lib/game/data'
import { useGame } from './game-provider'
import { CharacterCreator } from './character-creator'
import type { AvatarConfig } from '@/lib/game/types'

const RULES = [
  {
    icon: Smartphone,
    title: 'A rede é o centro',
    text: 'Vídeos dão felicidade rápida, mas cada categoria muda seus atributos. E o feed aprende com você.',
  },
  {
    icon: Clock,
    title: 'Cada ano é um dia',
    text: 'Das 07:00 à meia-noite. Dentro da rede, o tempo dobra de velocidade a cada 4 vídeos.',
  },
  {
    icon: Link2,
    title: 'Cuidado com a Dependência',
    text: 'Ela drena Disposição e Felicidade e reduz o ganho de tudo o que você faz.',
  },
  {
    icon: Moon,
    title: 'Dormir é avançar',
    text: 'Dormir passa o ano e recupera atributos. Suas escolhas antes de dormir contam.',
  },
]

export function StartScreen() {
  const { dispatch } = useGame()
  const [creating, setCreating] = useState(false)

  if (creating) {
    return <CharacterCreator onBack={() => setCreating(false)} onStart={(name: string, avatar: AvatarConfig) => dispatch({ type: 'START', name, avatar })} />
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col justify-center gap-10 px-4 py-10">
      <section className="flex flex-col gap-6">
        <span className="w-fit rounded-full bg-foreground px-3 py-1 text-xs font-bold uppercase tracking-widest text-background">
          MVP · Simulador de vida digital
        </span>
        <h1 className="font-display text-5xl font-bold leading-[0.95] text-balance md:text-7xl">
          The Path Of <span className="text-primary">Webings</span>
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground text-pretty">
          Viva no corpo de alguém que cresce totalmente conectado. Do primeiro tablet à terceira idade,
          tente chegar o mais longe possível equilibrando saúde, felicidade, vida social e sua relação com as redes.
        </p>
      </section>

      <section aria-label="Como jogar" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {RULES.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex flex-col gap-2 rounded-3xl border border-border bg-card p-4">
            <Icon className="size-6 text-primary" aria-hidden="true" />
            <h2 className="font-display font-bold">{title}</h2>
            <p className="text-sm text-muted-foreground text-pretty">{text}</p>
          </div>
        ))}
      </section>

      <section aria-label="Fases da vida">
        <ol className="flex flex-wrap gap-2">
          {PHASES.map((p) => (
            <li key={p.id} className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-sm">
              <span className="font-display font-bold text-primary">{p.id + 1}</span>
              {p.name}
              <span className="text-xs text-muted-foreground">{p.ageLabel}</span>
            </li>
          ))}
        </ol>
      </section>

      <div className="flex justify-center pb-[max(0px,env(safe-area-inset-bottom))]">
        <Button size="lg" className="h-12 w-full max-w-xs rounded-2xl px-6 text-base sm:w-auto sm:min-w-56" onClick={() => setCreating(true)}>
          Iniciar vida
        </Button>
      </div>
    </main>
  )
}
