'use client'

import { useMemo, useState, type ReactNode } from 'react'
import { Dices, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DEFAULT_AVATAR, Avatar, AVATAR_OPTIONS } from './avatar'
import type { AvatarConfig, Expression, Gender, HairStyle, Outfit } from '@/lib/game/types'
import { EXPRESSIONS, HAIR_STYLES } from '@/lib/game/avatar'

type EditorTab = 'identidade' | 'rosto' | 'cabelo' | 'roupa'

const TABS: { id: EditorTab; label: string }[] = [
  { id: 'identidade', label: 'Identidade' },
  { id: 'rosto', label: 'Rosto e pele' },
  { id: 'cabelo', label: 'Cabelo' },
  { id: 'roupa', label: 'Roupa' },
]

const choose = <T,>(items: readonly T[]) => items[Math.floor(Math.random() * items.length)]

function randomAvatar(): AvatarConfig {
  return {
    gender: choose<Gender>(['mulher', 'homem']),
    skinTone: choose(AVATAR_OPTIONS.skinTone).value,
    hairStyle: choose<HairStyle>(HAIR_STYLES.map((style) => style.value)),
    hairColor: choose(AVATAR_OPTIONS.hairColor).value,
    eyeColor: choose(AVATAR_OPTIONS.eyeColor).value,
    outfit: choose<Outfit>(['camiseta', 'moletom', 'camisa', 'jaqueta']),
    outfitColor: choose(AVATAR_OPTIONS.outfitColor).value,
    expression: choose<Expression>(['sorriso', 'serio', 'calmo']),
  }
}

function Choice<T extends string>({ value, selected, onClick, children }: { value: T; selected: boolean; onClick: (value: T) => void; children: ReactNode }) {
  return <button type="button" aria-pressed={selected} onClick={() => onClick(value)} className={`min-h-11 rounded-2xl border px-3 py-2 text-sm font-semibold transition ${selected ? 'border-primary bg-primary text-primary-foreground shadow-sm' : 'border-border bg-card hover:border-primary/60'}`}>{children}</button>
}

function ColorChoices({ label, value, items, onChange }: { label: string; value: string; items: ReadonlyArray<{ readonly value: string; readonly label: string }>; onChange: (value: string) => void }) {
  return <fieldset className="flex flex-col gap-2"><legend className="text-sm font-semibold">{label}</legend><div className="flex flex-wrap gap-2">{items.map((item) => <button key={item.value} type="button" aria-label={item.label} aria-pressed={item.value === value} onClick={() => onChange(item.value)} className={`flex size-11 items-center justify-center rounded-full border-2 transition ${item.value === value ? 'border-foreground ring-2 ring-primary ring-offset-2' : 'border-transparent'}`}><span className="size-7 rounded-full border border-black/10" style={{ backgroundColor: item.value }} /></button>)}</div></fieldset>
}

export function CharacterCreator({ onStart, onBack }: { onStart: (name: string, avatar: AvatarConfig) => void; onBack: () => void }) {
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState<AvatarConfig>(DEFAULT_AVATAR)
  const [tab, setTab] = useState<EditorTab>('identidade')
  const [visited, setVisited] = useState<Set<EditorTab>>(() => new Set(['identidade']))
  const trimmedName = name.trim()
  const summary = useMemo(() => `${avatar.gender === 'mulher' ? 'Uma personagem' : 'Um personagem'} de cabelo ${avatar.hairStyle}, olhar ${AVATAR_OPTIONS.eyeColor.find((item) => item.value === avatar.eyeColor)?.label.toLowerCase()}.`, [avatar])
  const update = <K extends keyof AvatarConfig>(key: K, value: AvatarConfig[K]) => setAvatar((current) => ({ ...current, [key]: value }))
  const visit = (next: EditorTab) => { setTab(next); setVisited((current) => new Set(current).add(next)) }
  const ready = trimmedName.length >= 2 && TABS.every((item) => visited.has(item.id))

  return <main className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col gap-5 px-4 py-6 md:justify-center md:py-10">
    <header className="flex items-center justify-between gap-4"><div><span className="text-xs font-bold uppercase tracking-[.18em] text-primary">Sua nova vida</span><h1 className="font-display text-3xl font-bold md:text-5xl">Crie quem vai viver essa história</h1></div><Button variant="ghost" onClick={onBack}>Voltar</Button></header>
    <div className="grid gap-5 lg:grid-cols-[minmax(280px,.8fr)_minmax(0,1.2fr)]">
      <section className="relative flex min-h-80 flex-col items-center justify-end overflow-hidden rounded-[2rem] bg-gradient-to-b from-[#16325c] to-[#081a35] p-5 text-white shadow-xl">
        <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(ellipse_at_top,_#3c79bb_0%,transparent_65%)] opacity-70" />
        <Avatar avatar={avatar} className="relative z-10 max-h-72 max-w-56" label="Prévia do personagem" />
        <div className="relative z-10 mt-1 text-center"><p className="font-display text-xl font-bold">{trimmedName || 'Seu personagem'}</p><p className="max-w-xs text-sm text-white/70">{summary}</p></div>
      </section>
      <section className="flex flex-col gap-5 rounded-[2rem] border border-border bg-card p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-2"><div className="flex items-center justify-between text-xs text-muted-foreground"><span>Explore as categorias</span><span>{visited.size}/{TABS.length}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${visited.size / TABS.length * 100}%` }} /></div><div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Categorias de personalização">{TABS.map((item) => <button key={item.id} role="tab" aria-selected={tab === item.id} onClick={() => visit(item.id)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${tab === item.id ? 'bg-foreground text-background' : visited.has(item.id) ? 'bg-accent/20 text-foreground' : 'bg-secondary text-secondary-foreground'}`}>{visited.has(item.id) ? '✓ ' : ''}{item.label}</button>)}</div></div>
        {tab === 'identidade' ? <div className="flex flex-col gap-5"><label className="flex flex-col gap-2 text-sm font-semibold">Nome <input value={name} onChange={(event) => setName(event.target.value)} maxLength={20} autoComplete="off" placeholder="Como a pessoa se chama?" className="h-12 rounded-2xl border border-input bg-background px-4 text-base font-normal outline-none focus-visible:ring-4 focus-visible:ring-ring/40" /></label><fieldset className="flex flex-col gap-2"><legend className="text-sm font-semibold">Identidade</legend><div className="grid grid-cols-2 gap-2">{(['mulher', 'homem'] as Gender[]).map((value) => <Choice key={value} value={value} selected={avatar.gender === value} onClick={(next) => update('gender', next)}>{value === 'mulher' ? 'Mulher' : 'Homem'}</Choice>)}</div></fieldset></div> : null}
        {tab === 'rosto' ? <div className="flex flex-col gap-5"><ColorChoices label="Tom de pele" value={avatar.skinTone} items={AVATAR_OPTIONS.skinTone} onChange={(value) => update('skinTone', value)} /><ColorChoices label="Cor dos olhos" value={avatar.eyeColor} items={AVATAR_OPTIONS.eyeColor} onChange={(value) => update('eyeColor', value)} /><fieldset className="flex flex-col gap-2"><legend className="text-sm font-semibold">Expressão</legend><div className="grid grid-cols-3 gap-2">{EXPRESSIONS.map(({ value, label }) => <Choice key={value} value={value} selected={avatar.expression === value} onClick={(next) => update('expression', next)}>{label}</Choice>)}</div></fieldset></div> : null}
        {tab === 'cabelo' ? <div className="flex flex-col gap-5"><fieldset className="flex flex-col gap-2"><legend className="text-sm font-semibold">Estilo</legend><div className="grid grid-cols-2 gap-2">{HAIR_STYLES.map(({ value, label }) => <Choice key={value} value={value} selected={avatar.hairStyle === value} onClick={(next) => update('hairStyle', next)}>{label}</Choice>)}</div></fieldset><ColorChoices label="Cor do cabelo" value={avatar.hairColor} items={AVATAR_OPTIONS.hairColor} onChange={(value) => update('hairColor', value)} /></div> : null}
        {tab === 'roupa' ? <div className="flex flex-col gap-5"><fieldset className="flex flex-col gap-2"><legend className="text-sm font-semibold">Peça</legend><div className="grid grid-cols-2 gap-2">{([['camiseta', 'Camiseta'], ['moletom', 'Moletom'], ['camisa', 'Camisa'], ['jaqueta', 'Jaqueta']] as [Outfit, string][]).map(([value, label]) => <Choice key={value} value={value} selected={avatar.outfit === value} onClick={(next) => update('outfit', next)}>{label}</Choice>)}</div></fieldset><ColorChoices label="Cor da roupa" value={avatar.outfitColor} items={AVATAR_OPTIONS.outfitColor} onChange={(value) => update('outfitColor', value)} /></div> : null}
        <div className="mt-auto flex flex-col-reverse gap-2 border-t border-border pt-4 pb-[max(0px,env(safe-area-inset-bottom))] sm:flex-row sm:justify-between"><Button variant="outline" className="h-11 rounded-2xl" onClick={() => setAvatar(randomAvatar())}><Dices className="size-4" /> Randomizar</Button><Button className="h-12 rounded-2xl" disabled={!ready} onClick={() => onStart(trimmedName, avatar)}><Sparkles className="size-4" /> Nascer</Button></div>
        {trimmedName.length > 0 && trimmedName.length < 2 ? <p className="-mt-3 text-sm text-destructive">Use ao menos 2 caracteres no nome.</p> : null}
        {trimmedName.length >= 2 && !ready ? <p className="-mt-3 text-sm text-muted-foreground">Visite todas as categorias para liberar o nascimento.</p> : null}
      </section>
    </div>
  </main>
}
