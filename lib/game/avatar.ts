import type { AvatarConfig, Expression, FaceShape, HairColorMode, OutfitPattern } from './types'
import { ACCESSORIES, BASE_CLOTHING, HAIR_COLORS, HAIR_COLOR_MODES, HAIR_STYLES, OUTERWEAR } from './avatar-catalog'

export { ACCESSORIES, BASE_CLOTHING, CLOTHING_ITEMS, HAIR_COLORS, HAIR_COLOR_MODES, HAIR_STYLES, OUTFIT_PATTERNS, OUTERWEAR } from './avatar-catalog'
export const OUTFITS = BASE_CLOTHING

export const AVATAR_OPTIONS = {
  skinTone: [
    { value: '#F8D7C1', label: 'Porcelana' }, { value: '#F1C6A8', label: 'Pêssego' }, { value: '#E9B38E', label: 'Dourado' }, { value: '#C9825A', label: 'Canela' },
    { value: '#AE6849', label: 'Âmbar' }, { value: '#9B573B', label: 'Cacau' }, { value: '#6E392B', label: 'Ébano' }, { value: '#4C291F', label: 'Ônix' },
  ],
  eyeColor: [
    { value: '#43271D', label: 'Castanho' }, { value: '#295B88', label: 'Azul' }, { value: '#36724B', label: 'Verde' }, { value: '#8B642F', label: 'Mel' }, { value: '#70518B', label: 'Violeta' },
  ],
  hairColor: HAIR_COLORS,
  outfitColor: [
    ['#2463A4','Azul'],['#9E3E5D','Vinho'],['#417D62','Verde'],['#CF7534','Laranja'],['#68509A','Roxo'],['#252A35','Grafite'],['#D7D2C8','Creme'],['#B7C6D8','Azul claro'],
    ['#111827','Preto'],['#FFFFFF','Branco'],['#B91C1C','Vermelho'],['#F59E0B','Amarelo'],['#0F766E','Petróleo'],['#7C3AED','Violeta'],['#DB2777','Rosa'],['#78716C','Taupe'],
  ].map(([value,label]) => ({ value, label })),
} as const

export const FACE_SHAPES: { value: FaceShape; label: string }[] = [
  { value: 'oval', label: 'Oval' }, { value: 'redondo', label: 'Redondo' }, { value: 'angular', label: 'Angular' },
]

export const EXPRESSIONS: { value: Expression; label: string }[] = [
  { value: 'sorriso', label: 'Alegre' }, { value: 'calmo', label: 'Neutra' }, { value: 'serio', label: 'Séria' }, { value: 'triste', label: 'Triste' },
  { value: 'preocupado', label: 'Preocupada' }, { value: 'cansado', label: 'Cansada' }, { value: 'surpreso', label: 'Surpresa' }, { value: 'irritado', label: 'Irritada' },
]

export const DEFAULT_AVATAR: AvatarConfig = {
  gender: 'mulher', faceShape: 'oval', skinTone: '#E9B38E', hairStyle: 'cacheado', hairColor: '#201816', hairSecondaryColor: '#B96232', hairColorMode: 'solid',
  eyeColor: '#43271D', outfit: 'camiseta', outerwear: 'none', outfitColor: '#2463A4', outfitSecondaryColor: '#D7D2C8', outfitPattern: 'none',
  headAccessory: 'none', faceAccessory: 'none', earAccessory: 'none', neckAccessory: 'none', expression: 'sorriso',
}

const values = <T extends { value: string }>(items: readonly T[]) => new Set(items.map((item) => item.value))
const ids = <T extends { id: string }>(items: readonly T[]) => new Set(items.map((item) => item.id))
const skins = values(AVATAR_OPTIONS.skinTone), eyes = values(AVATAR_OPTIONS.eyeColor)
const styles = ids(HAIR_STYLES), expressions = values(EXPRESSIONS), faceShapes = values(FACE_SHAPES)
const baseItems = ids(BASE_CLOTHING), outerItems = ids(OUTERWEAR)
const hairModes = values(HAIR_COLOR_MODES)
const accessoryIds = Object.fromEntries(Object.entries(ACCESSORIES).map(([slot, items]) => [slot, ids(items)])) as Record<keyof typeof ACCESSORIES, Set<string>>
const patterns = new Set(['none', 'stripes', 'checker', 'dots', 'graphic'])
const validColor = (value: unknown, fallback: string) => typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value) ? value.toUpperCase() : fallback

/** Migrates every previous avatar schema while preserving all legacy IDs. */
export function normalizeAvatarConfig(value: unknown): AvatarConfig {
  const raw = value && typeof value === 'object' ? value as Partial<AvatarConfig> : {}
  return {
    gender: raw.gender === 'homem' ? 'homem' : 'mulher',
    faceShape: typeof raw.faceShape === 'string' && faceShapes.has(raw.faceShape) ? raw.faceShape as FaceShape : DEFAULT_AVATAR.faceShape,
    skinTone: typeof raw.skinTone === 'string' && skins.has(raw.skinTone) ? raw.skinTone : DEFAULT_AVATAR.skinTone,
    hairStyle: typeof raw.hairStyle === 'string' && styles.has(raw.hairStyle) ? raw.hairStyle : DEFAULT_AVATAR.hairStyle,
    hairColor: validColor(raw.hairColor, DEFAULT_AVATAR.hairColor),
    hairSecondaryColor: validColor(raw.hairSecondaryColor, DEFAULT_AVATAR.hairSecondaryColor),
    hairColorMode: typeof raw.hairColorMode === 'string' && hairModes.has(raw.hairColorMode) ? raw.hairColorMode as HairColorMode : DEFAULT_AVATAR.hairColorMode,
    eyeColor: typeof raw.eyeColor === 'string' && eyes.has(raw.eyeColor) ? raw.eyeColor : DEFAULT_AVATAR.eyeColor,
    outfit: typeof raw.outfit === 'string' && baseItems.has(raw.outfit) ? raw.outfit : DEFAULT_AVATAR.outfit,
    outerwear: typeof raw.outerwear === 'string' && (raw.outerwear === 'none' || outerItems.has(raw.outerwear)) ? raw.outerwear : DEFAULT_AVATAR.outerwear,
    outfitColor: validColor(raw.outfitColor, DEFAULT_AVATAR.outfitColor),
    outfitSecondaryColor: validColor(raw.outfitSecondaryColor, DEFAULT_AVATAR.outfitSecondaryColor),
    outfitPattern: typeof raw.outfitPattern === 'string' && patterns.has(raw.outfitPattern) ? raw.outfitPattern as OutfitPattern : DEFAULT_AVATAR.outfitPattern,
    headAccessory: typeof raw.headAccessory === 'string' && accessoryIds.head.has(raw.headAccessory) ? raw.headAccessory : 'none',
    faceAccessory: typeof raw.faceAccessory === 'string' && accessoryIds.face.has(raw.faceAccessory) ? raw.faceAccessory : 'none',
    earAccessory: typeof raw.earAccessory === 'string' && accessoryIds.ears.has(raw.earAccessory) ? raw.earAccessory : 'none',
    neckAccessory: typeof raw.neckAccessory === 'string' && accessoryIds.neck.has(raw.neckAccessory) ? raw.neckAccessory : 'none',
    expression: typeof raw.expression === 'string' && expressions.has(raw.expression) ? raw.expression as Expression : DEFAULT_AVATAR.expression,
  }
}
