import type { AvatarConfig, Expression, HairStyle } from './types'

export const AVATAR_OPTIONS = {
  skinTone: [
    { value: '#F8D7C1', label: 'Porcelana' },
    { value: '#E9B38E', label: 'Dourado' },
    { value: '#C9825A', label: 'Canela' },
    { value: '#9B573B', label: 'Cacau' },
    { value: '#6E392B', label: 'Ébano' },
    { value: '#4C291F', label: 'Ônix' },
  ],
  eyeColor: [
    { value: '#43271D', label: 'Castanho' },
    { value: '#295B88', label: 'Azul' },
    { value: '#36724B', label: 'Verde' },
    { value: '#70518B', label: 'Violeta' },
  ],
  hairColor: [
    { value: '#201816', label: 'Preto' },
    { value: '#3B251D', label: 'Castanho escuro' },
    { value: '#5A3928', label: 'Castanho médio' },
    { value: '#8A5A3B', label: 'Castanho claro' },
    { value: '#B96232', label: 'Cobre' },
    { value: '#DEC06B', label: 'Dourado' },
    { value: '#B5B7BC', label: 'Grisalho' },
    { value: '#E6E2D8', label: 'Branco' },
  ],
  outfitColor: [
    { value: '#2463A4', label: 'Azul' },
    { value: '#9E3E5D', label: 'Vinho' },
    { value: '#417D62', label: 'Verde' },
    { value: '#CF7534', label: 'Laranja' },
    { value: '#68509A', label: 'Roxo' },
  ],
} as const

export const HAIR_STYLES: { value: HairStyle; label: string; group: 'curto' | 'medio' | 'longo' | 'crespo' }[] = [
  { value: 'raspado', label: 'Raspado', group: 'curto' },
  { value: 'curto', label: 'Curto clássico', group: 'curto' },
  { value: 'ondulado', label: 'Ondulado médio', group: 'medio' },
  { value: 'cacheado', label: 'Cacheado médio', group: 'medio' },
  { value: 'longo', label: 'Longo em camadas', group: 'longo' },
  { value: 'rabo', label: 'Rabo de cavalo', group: 'longo' },
  { value: 'afro', label: 'Black power', group: 'crespo' },
  { value: 'trancado', label: 'Tranças', group: 'crespo' },
  { value: 'locs', label: 'Locs', group: 'crespo' },
  { value: 'coques', label: 'Coques', group: 'crespo' },
]

export const EXPRESSIONS: { value: Expression; label: string }[] = [
  { value: 'sorriso', label: 'Alegre' }, { value: 'calmo', label: 'Neutra' }, { value: 'serio', label: 'Séria' },
]

export const DEFAULT_AVATAR: AvatarConfig = {
  gender: 'mulher', skinTone: '#E9B38E', hairStyle: 'cacheado', hairColor: '#201816',
  eyeColor: '#43271D', outfit: 'camiseta', outfitColor: '#2463A4', expression: 'sorriso',
}

const values = <T extends { value: string }>(items: readonly T[]) => new Set(items.map((item) => item.value))
const skins = values(AVATAR_OPTIONS.skinTone)
const eyes = values(AVATAR_OPTIONS.eyeColor)
const hairColors = values(AVATAR_OPTIONS.hairColor)
const outfits = values(AVATAR_OPTIONS.outfitColor)
const styles = values(HAIR_STYLES)
const expressions = values(EXPRESSIONS)

/** Converts saves from the first creator version to the current safe avatar schema. */
export function normalizeAvatarConfig(value: unknown): AvatarConfig {
  const raw = value && typeof value === 'object' ? value as Partial<AvatarConfig> : {}
  return {
    gender: raw.gender === 'homem' ? 'homem' : 'mulher',
    skinTone: typeof raw.skinTone === 'string' && skins.has(raw.skinTone) ? raw.skinTone : DEFAULT_AVATAR.skinTone,
    hairStyle: typeof raw.hairStyle === 'string' && styles.has(raw.hairStyle) ? raw.hairStyle as HairStyle : DEFAULT_AVATAR.hairStyle,
    hairColor: typeof raw.hairColor === 'string' && hairColors.has(raw.hairColor) ? raw.hairColor : DEFAULT_AVATAR.hairColor,
    eyeColor: typeof raw.eyeColor === 'string' && eyes.has(raw.eyeColor) ? raw.eyeColor : DEFAULT_AVATAR.eyeColor,
    outfit: ['camiseta', 'moletom', 'camisa', 'jaqueta'].includes(raw.outfit ?? '') ? raw.outfit as AvatarConfig['outfit'] : DEFAULT_AVATAR.outfit,
    outfitColor: typeof raw.outfitColor === 'string' && outfits.has(raw.outfitColor) ? raw.outfitColor : DEFAULT_AVATAR.outfitColor,
    expression: typeof raw.expression === 'string' && expressions.has(raw.expression) ? raw.expression as Expression : DEFAULT_AVATAR.expression,
  }
}
