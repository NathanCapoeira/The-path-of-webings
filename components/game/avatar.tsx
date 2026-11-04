import { cn } from '@/lib/utils'
import type { AvatarConfig } from '@/lib/game/types'
import { DEFAULT_AVATAR } from '@/lib/game/data'

const hairPaths: Record<AvatarConfig['hairStyle'], string> = {
  curto: 'M51 52c2-25 56-27 58 0l-5 16H55z',
  cacheado: 'M49 63c-9-22 3-39 16-34 6-15 28-14 34 0 14-5 25 12 16 34l-9-9H58z',
  longo: 'M50 56c5-29 54-31 60 0v59H94V68H65v47H50z',
  trancado: 'M50 59c2-28 56-31 60 0l-5 18H55zm5 13 7 45m10-48 3 52m12-52-3 52m13-49-8 45',
}

const outfitShapes: Record<AvatarConfig['outfit'], string> = {
  camiseta: 'M38 166c5-29 20-42 42-42s37 13 42 42v24H38z',
  moletom: 'M34 169c5-30 19-45 46-45s41 15 46 45v21H34zm30-43 16 23 16-23',
  camisa: 'M39 167c4-28 19-43 41-43s37 15 41 43v23H39zm31-43 10 27 10-27m-10 27v39',
  jaqueta: 'M36 168c4-29 20-44 44-44s40 15 44 44v22H36zm44-44v66m-22-58 22 18 22-18',
}

export const AVATAR_OPTIONS = {
  skinTone: [
    { value: '#F7D6BF', label: 'Claro' },
    { value: '#D99C72', label: 'Médio' },
    { value: '#A86543', label: 'Escuro' },
    { value: '#70412E', label: 'Profundo' },
  ],
  eyeColor: [
    { value: '#3B281A', label: 'Castanho' },
    { value: '#1D4D70', label: 'Azul' },
    { value: '#3C6E45', label: 'Verde' },
    { value: '#6C4A7E', label: 'Violeta' },
  ],
  hairColor: [
    { value: '#211816', label: 'Preto' },
    { value: '#5D3927', label: 'Castanho' },
    { value: '#B56B32', label: 'Ruivo' },
    { value: '#E6C05F', label: 'Loiro' },
  ],
  outfitColor: [
    { value: '#215A99', label: 'Azul' },
    { value: '#A43D58', label: 'Vinho' },
    { value: '#4F8B65', label: 'Verde' },
    { value: '#D17A36', label: 'Laranja' },
    { value: '#6A4E9A', label: 'Roxo' },
  ],
} as const

export { DEFAULT_AVATAR }

export function Avatar({ avatar, className, label }: { avatar: AvatarConfig; className?: string; label?: string }) {
  const mouth = avatar.expression === 'sorriso' ? 'M71 101q9 8 18 0' : avatar.expression === 'serio' ? 'M72 106h16' : 'M73 105q7-5 14 0'
  return (
    <svg viewBox="0 0 160 210" role="img" aria-label={label ?? 'Avatar do personagem'} className={cn('h-auto w-full', className)}>
      <path d={outfitShapes[avatar.outfit]} fill={avatar.outfitColor} />
      <path d="M66 130h28v18H66z" fill={avatar.skinTone} />
      <ellipse cx="80" cy="82" rx="33" ry="42" fill={avatar.skinTone} />
      <path d={hairPaths[avatar.hairStyle]} fill={avatar.hairColor} stroke={avatar.hairColor} strokeWidth="4" strokeLinecap="round" />
      <path d="M57 72c7-10 39-13 47 0" fill="none" stroke={avatar.hairColor} strokeWidth="5" strokeLinecap="round" />
      <ellipse cx="68" cy="87" rx="5" ry="6" fill="white" />
      <ellipse cx="92" cy="87" rx="5" ry="6" fill="white" />
      <circle cx="68" cy="88" r="3" fill={avatar.eyeColor} />
      <circle cx="92" cy="88" r="3" fill={avatar.eyeColor} />
      <path d={mouth} fill="none" stroke="#492D2B" strokeWidth="3" strokeLinecap="round" />
      <circle cx="58" cy="101" r="4" fill="#D97878" opacity=".35" />
      <circle cx="102" cy="101" r="4" fill="#D97878" opacity=".35" />
    </svg>
  )
}
