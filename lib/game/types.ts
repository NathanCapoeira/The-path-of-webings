export type MainKey = 'saude' | 'disposicao' | 'felicidade' | 'dependencia'
export type SubKey = 'foco' | 'sanidade' | 'forca' | 'inteligencia'
export type Difficulty = 'normal' | 'desafiador' | 'intenso'

export type MainStats = Record<MainKey, number>
export type SubStats = Record<SubKey, number>
export type GainKey = MainKey | SubKey

export type DigitalEffectKind = 'fragmentacao' | 'comparacao' | 'sobrecarga' | 'sono-digital'
export type DigitalEffectStatus = 'active' | 'recovered' | 'expired'

export interface DigitalEffect {
  id: string
  kind: DigitalEffectKind
  sourceEventId: string
  sourceType: 'social_media'
  label: string
  description: string
  targetAttribute: GainKey
  modifierValue: number
  stacks: number
  maxStacks: number
  appliedAtAge: number
  appliedAtMinutes: number
  remainingSleeps: number
  recoveryRule: string
  status: DigitalEffectStatus
  endedAtAge?: number
  endReason?: string
}

export interface RunMetrics {
  activeSeconds: number
  phaseSeconds: number[]
  lifeActions: number
  socialInteractions: number
  eventsPresented: number
  sleeps: number
}

export interface Effects {
  main?: Partial<MainStats>
  sub?: Partial<SubStats>
  followers?: number
  minutes?: number
}

export type Category =
  | 'meme'
  | 'brainrot'
  | 'educativo'
  | 'amigos'
  | 'lifestyle'
  | 'fitness'
  | 'noticias'

export interface Phase {
  id: number
  name: string
  ageLabel: string
  minAge: number
  yearsPerSleep: number
  description: string
}

export type ActivityId = 'exercicio' | 'estudar' | 'socializar' | 'criar' | 'descansar'

export interface Activity {
  id: ActivityId
  name: string
  description: string
  minutes: number
  minPhase: number
  requirements: (phase: number) => Partial<SubStats>
  effects: Effects
  dailyLimit?: number
}

export interface ActivityResult {
  id: ActivityId
  gains: Partial<Record<GainKey, number>>
  reduced: boolean
}

export type ChallengeId = 'prova' | 'apresentacao' | 'entrevista' | 'campeonato'

export interface Challenge {
  id: ChallengeId
  name: string
  description: string
  phases: number[]
  requires: SubKey[]
}

export interface ScheduledChallenge {
  id: ChallengeId
  hour: number
  threshold: number
}

export interface Reel {
  id: string
  category: Category
  creator: string
  caption: string
  likes: string
  media: string[]
}

export interface EventChoice {
  label: string
  effects: Effects
  log: string
}

export interface GameEvent {
  id: string
  title: string
  text: string
  phases: number[]
  minFollowers?: number
  choices: EventChoice[]
}

export interface SleepOption {
  id: string
  name: string
  description: string
  phases: number[]
  conflictsWith?: string[]
  effects: Effects
  disposicaoGainModifier?: number
}

export type LogTone = 'good' | 'bad' | 'neutral'

export interface LogEntry {
  id: number
  age: number
  time: number
  text: string
  tone: LogTone
}

export interface YearSnapshot {
  age: number
  phase: number
  main: MainStats
  followers: number
  screenMinutes: number
}

export type DeathCause = 'saude' | 'exaustao' | 'felicidade' | 'velhice'

export type Gender = 'mulher' | 'homem'
export type FaceShape = 'oval' | 'redondo' | 'angular'
export type HairStyle = string
export type Outfit = string
export type HairColorMode = 'solid' | 'highlights' | 'tips' | 'ombre' | 'roots' | 'split' | 'fringe' | 'streaks'
export type OutfitPattern = 'none' | 'stripes' | 'checker' | 'dots' | 'graphic'
export type Expression = 'sorriso' | 'serio' | 'calmo' | 'triste' | 'preocupado' | 'cansado' | 'surpreso' | 'irritado'
export type AvatarReaction = 'celebrate' | 'rest' | null

export interface AvatarConfig {
  gender: Gender
  faceShape: FaceShape
  skinTone: string
  hairStyle: HairStyle
  hairColor: string
  hairSecondaryColor: string
  hairColorMode: HairColorMode
  eyeColor: string
  outfit: Outfit
  outerwear: string
  outfitColor: string
  outfitSecondaryColor: string
  outfitPattern: OutfitPattern
  headAccessory: string
  faceAccessory: string
  earAccessory: string
  neckAccessory: string
  expression: Expression
}

export type Modal =
  | {
      kind: 'challenge'
      name: string
      passed: boolean
      checks: { key: SubKey; value: number; required: number }[]
      interruptedSocial: boolean
    }
  | { kind: 'phase'; phase: number }
  | { kind: 'info'; title: string; text: string }

export interface GameState {
  status: 'start' | 'playing' | 'paused' | 'dead'
  view: 'life' | 'social' | 'sleep'
  name: string
  avatar: AvatarConfig
  avatarReaction: AvatarReaction
  difficulty: Difficulty
  age: number
  phase: number
  minutes: number
  main: MainStats
  subBase: SubStats
  followers: number
  feedWeights: Record<Category, number>
  currentReel: Reel | null
  currentReelSeconds: number
  currentReelLiked: boolean
  lastReelEffects: Effects | null
  reelsToday: number
  screenMinutesToday: number
  totalScreenMinutes: number
  reelsByCategory: Record<Category, number>
  dailyReelsByCategory: Record<Category, number>
  socialSecondsByCategory: Record<Category, number>
  likesByCategory: Record<Category, number>
  notInterestedByCategory: Record<Category, number>
  challenge: ScheduledChallenge | null
  challengesPassed: number
  challengesFailed: number
  activityCounts: Record<ActivityId, number>
  dailyActivityCounts: Record<ActivityId, number>
  dailyGainCounts: Partial<Record<GainKey, number>>
  lastActivityResult: ActivityResult | null
  pendingEvent: GameEvent | null
  eventsSeen: string[]
  modal: Modal | null
  forcedSleep: boolean
  log: LogEntry[]
  logCounter: number
  lastReadLogId: number
  digitalEffects: DigitalEffect[]
  digitalEffectCounter: number
  metrics: RunMetrics
  history: YearSnapshot[]
  deathCause: DeathCause | null
}
