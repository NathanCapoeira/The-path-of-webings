import {
  ACTIVITIES,
  CATEGORIES,
  CATEGORY_ORDER,
  CHALLENGES,
  DAY_END,
  DAY_START,
  EVENTS,
  MAX_AGE,
  MAX_SOCIAL_MINUTES_PER_SECOND,
  PHASES,
  REELS,
  REELS_PER_SPEEDUP,
  SLEEP_FROM,
  SLEEP_OPTIONS,
  DEFAULT_AVATAR,
  DIMINISHING_RETURNS,
  challengeThreshold,
  phaseForAge,
} from './data'
import type {
  ActivityId,
  Category,
  Effects,
  GameState,
  LogTone,
  MainKey,
  MainStats,
  SubKey,
  SubStats,
  AvatarConfig,
  GainKey,
} from './types'

export const clamp = (v: number, min = 0, max = 100) => Math.min(max, Math.max(min, v))

export function maxHealthForAge(age: number) {
  return clamp(100 - Math.max(0, age - 50) * 1.8, 8, 100)
}

export function computeSubs(main: MainStats, base: SubStats): SubStats {
  const { saude, disposicao, felicidade, dependencia } = main
  return {
    foco: Math.max(0, base.foco + (disposicao - 50) * 0.3 - dependencia * 0.3),
    sanidade: Math.max(0, base.sanidade + (felicidade - 50) * 0.3 - dependencia * 0.3),
    forca: Math.max(0, base.forca + (saude - 50) * 0.25 + (disposicao - 50) * 0.15),
    inteligencia: Math.max(0, base.inteligencia - dependencia * 0.3),
  }
}

export function dependencyGainMultiplier(dependencia: number) {
  return clamp(1 - dependencia / 150, 0.33, 1)
}

export function minutesPerSecond(reelsToday: number) {
  return Math.min(MAX_SOCIAL_MINUTES_PER_SECOND, 2 ** Math.floor(reelsToday / REELS_PER_SPEEDUP))
}

export function formatClock(minutes: number) {
  const m = Math.min(minutes, DAY_END)
  const h = Math.floor(m / 60) % 24
  const mm = Math.floor(m % 60)
  return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}

export function isActivityAvailable(state: GameState, id: ActivityId) {
  const activity = ACTIVITIES.find((a) => a.id === id)
  return !!activity && state.phase >= activity.minPhase
}

export function activityLimitReached(state: GameState, id: ActivityId) {
  const activity = ACTIVITIES.find((item) => item.id === id)
  return !!activity?.dailyLimit && (state.dailyActivityCounts[id] ?? 0) >= activity.dailyLimit
}

export function gainMultiplierForOccurrence(occurrence: number) {
  return DIMINISHING_RETURNS[Math.min(Math.max(occurrence, 1), DIMINISHING_RETURNS.length) - 1]
}

export function activityRequirementChecks(state: GameState, id: ActivityId) {
  const activity = ACTIVITIES.find((a) => a.id === id)!
  const subs = computeSubs(state.main, state.subBase)
  const reqs = activity.requirements(state.phase)
  return (Object.entries(reqs) as [SubKey, number][]).map(([key, required]) => ({
    key,
    required,
    value: subs[key],
    ok: subs[key] >= required,
  }))
}

function addLog(state: GameState, text: string, tone: LogTone = 'neutral'): GameState {
  const entry = { id: state.logCounter + 1, age: state.age, time: state.minutes, text, tone }
  return { ...state, logCounter: entry.id, log: [entry, ...state.log].slice(0, 40) }
}

function clampState(state: GameState): GameState {
  const maxHp = maxHealthForAge(state.age)
  return {
    ...state,
    main: {
      saude: clamp(state.main.saude, 0, maxHp),
      disposicao: clamp(state.main.disposicao),
      felicidade: clamp(state.main.felicidade),
      dependencia: clamp(state.main.dependencia),
    },
    subBase: {
      foco: Math.max(0, state.subBase.foco),
      sanidade: Math.max(0, state.subBase.sanidade),
      forca: Math.max(0, state.subBase.forca),
      inteligencia: Math.max(0, state.subBase.inteligencia),
    },
    followers: Math.max(0, Math.round(state.followers)),
  }
}

interface ApplyOptions {
  fromActivity?: boolean
}

export function applyEffects(state: GameState, effects: Effects, opts: ApplyOptions = {}): GameState {
  const mult = opts.fromActivity ? dependencyGainMultiplier(state.main.dependencia) : 1
  const main = { ...state.main }
  for (const [k, v] of Object.entries(effects.main ?? {}) as [MainKey, number][]) {
    const positiveGain = v > 0 && k !== 'dependencia'
    main[k] += positiveGain ? v * mult : v
  }
  const subBase = { ...state.subBase }
  for (const [k, v] of Object.entries(effects.sub ?? {}) as [SubKey, number][]) {
    subBase[k] += v > 0 ? v * mult : v
  }
  let next: GameState = {
    ...state,
    main,
    subBase,
    followers: state.followers + (effects.followers ?? 0),
  }
  next = clampState(next)
  if (effects.minutes) next = advanceTime(next, effects.minutes)
  return next
}

function advanceTime(state: GameState, minutes: number): GameState {
  minutes = Math.min(minutes, Math.max(0, DAY_END - state.minutes))
  const hours = minutes / 60
  const dep = state.main.dependencia
  const main = { ...state.main }
  main.disposicao -= (1.2 + dep * 0.025) * hours
  main.felicidade -= (0.4 + dep * 0.03) * hours
  if (main.disposicao <= 0) main.saude -= 4 * hours
  return clampState({ ...state, main, minutes: state.minutes + minutes })
}

function checkDeath(state: GameState): GameState {
  if (state.status !== 'playing') return state
  let cause: GameState['deathCause'] = null
  if (state.main.saude <= 0) cause = state.main.disposicao <= 0 ? 'exaustao' : 'saude'
  else if (state.main.felicidade <= 0) cause = 'felicidade'
  if (!cause) return state
  return {
    ...state,
    status: 'dead',
    deathCause: cause,
    modal: null,
    pendingEvent: null,
    history: [...state.history, snapshot(state)],
  }
}

function snapshot(state: GameState) {
  return {
    age: state.age,
    phase: state.phase,
    main: { ...state.main },
    followers: state.followers,
    screenMinutes: state.screenMinutesToday,
  }
}

function resolveChallenge(state: GameState): GameState {
  const scheduled = state.challenge
  if (!scheduled || state.minutes < scheduled.hour * 60) return state
  const challenge = CHALLENGES.find((c) => c.id === scheduled.id)!
  const subs = computeSubs(state.main, state.subBase)
  const checks = challenge.requires.map((key) => ({
    key,
    value: subs[key],
    required: scheduled.threshold,
  }))
  const passed = checks.every((c) => c.value >= c.required)
  const interruptedSocial = state.view === 'social'
  let next: GameState = {
    ...state,
    challenge: null,
    view: state.view === 'social' ? 'life' : state.view,
    challengesPassed: state.challengesPassed + (passed ? 1 : 0),
    challengesFailed: state.challengesFailed + (passed ? 0 : 1),
    modal: { kind: 'challenge', name: challenge.name, passed, checks, interruptedSocial },
  }
  const reward: Effects = passed
    ? {
        main: { felicidade: 12, disposicao: -4 },
        sub: Object.fromEntries(challenge.requires.map((k) => [k, 3])),
        followers: state.phase >= 3 ? 15 : 0,
      }
    : { main: { felicidade: -22, disposicao: -15, saude: -10 } }
  next = applyEffects(next, reward)
  return addLog(
    next,
    passed ? `Você passou em: ${challenge.name}!` : `Você falhou em: ${challenge.name}.`,
    passed ? 'good' : 'bad',
  )
}

function checkMidnight(state: GameState): GameState {
  if (state.status !== 'playing' || state.minutes < DAY_END) return state
  const next = { ...state, minutes: DAY_END, view: 'sleep' as const, forcedSleep: true }
  return addLog(next, 'Meia-noite! Você é obrigado a dormir.', 'bad')
}

function finalize(state: GameState): GameState {
  let next = checkDeath(state)
  if (next.status !== 'playing') return next
  next = resolveChallenge(next)
  next = checkDeath(next)
  if (next.status !== 'playing') return next
  return checkMidnight(next)
}

function pickEvent(state: GameState) {
  const pool = EVENTS.filter(
    (e) =>
      e.phases.includes(state.phase) &&
      !state.eventsSeen.includes(e.id) &&
      (e.minFollowers ?? 0) <= state.followers,
  )
  if (pool.length === 0) return null
  return pool[Math.floor(Math.random() * pool.length)]
}

function maybeTriggerEvent(state: GameState, chance: number): GameState {
  if (state.status !== 'playing' || state.pendingEvent || state.view === 'sleep') return state
  if (Math.random() > chance) return state
  const event = pickEvent(state)
  if (!event) return state
  return { ...state, pendingEvent: event, eventsSeen: [...state.eventsSeen, event.id] }
}

function scheduleChallenge(phase: number) {
  const pool = CHALLENGES.filter((c) => c.phases.includes(phase))
  if (pool.length === 0 || Math.random() > 0.75) return null
  const challenge = pool[Math.floor(Math.random() * pool.length)]
  return {
    id: challenge.id,
    hour: 13 + Math.floor(Math.random() * 7),
    threshold: challengeThreshold(phase),
  }
}

function pickReel(weights: Record<Category, number>, excludeId?: string) {
  const total = CATEGORY_ORDER.reduce((sum, c) => sum + weights[c], 0)
  let r = Math.random() * total
  let category: Category = CATEGORY_ORDER[0]
  for (const c of CATEGORY_ORDER) {
    r -= weights[c]
    if (r <= 0) {
      category = c
      break
    }
  }
  const pool = REELS.filter((reel) => reel.category === category && reel.id !== excludeId)
  return pool[Math.floor(Math.random() * pool.length)]
}

export function feedShare(weights: Record<Category, number>) {
  const total = CATEGORY_ORDER.reduce((sum, c) => sum + weights[c], 0)
  return CATEGORY_ORDER.map((c) => ({ category: c, share: weights[c] / total }))
}

const emptyCategoryCounts = () =>
  Object.fromEntries(CATEGORY_ORDER.map((c) => [c, 0])) as Record<Category, number>
const emptyActivityCounts = () =>
  ({ exercicio: 0, estudar: 0, socializar: 0, criar: 0, descansar: 0 })

export function createInitialState(name = '', avatar: AvatarConfig = DEFAULT_AVATAR): GameState {
  return {
    status: name ? 'playing' : 'start',
    view: 'life',
    name,
    avatar,
    avatarReaction: null,
    age: 1,
    phase: 0,
    minutes: DAY_START,
    main: { saude: 85, disposicao: 80, felicidade: 70, dependencia: 0 },
    subBase: { foco: 20, sanidade: 20, forca: 20, inteligencia: 20 },
    followers: 0,
    feedWeights: Object.fromEntries(
      CATEGORY_ORDER.map((c) => [c, CATEGORIES[c].baseWeight]),
    ) as Record<Category, number>,
    currentReel: null,
    currentReelSeconds: 0,
    currentReelLiked: false,
    lastReelEffects: null,
    reelsToday: 0,
    screenMinutesToday: 0,
    totalScreenMinutes: 0,
    reelsByCategory: emptyCategoryCounts(),
    challenge: null,
    challengesPassed: 0,
    challengesFailed: 0,
    activityCounts: emptyActivityCounts(),
    dailyActivityCounts: emptyActivityCounts(),
    dailyGainCounts: {},
    lastActivityResult: null,
    pendingEvent: null,
    eventsSeen: [],
    modal: name ? { kind: 'phase', phase: 0 } : null,
    forcedSleep: false,
    log: [],
    logCounter: 0,
    history: [],
    deathCause: null,
  }
}

export type GameAction =
  | { type: 'START'; name: string; avatar: AvatarConfig }
  | { type: 'RESTART' }
  | { type: 'DO_ACTIVITY'; id: ActivityId }
  | { type: 'OPEN_SOCIAL' }
  | { type: 'CLOSE_SOCIAL' }
  | { type: 'SOCIAL_TICK' }
  | { type: 'NEXT_REEL' }
  | { type: 'LIKE_REEL' }
  | { type: 'NOT_INTERESTED' }
  | { type: 'EVENT_CHOICE'; index: number }
  | { type: 'DISMISS_MODAL' }
  | { type: 'GO_TO_SLEEP' }
  | { type: 'CANCEL_SLEEP' }
  | { type: 'CONFIRM_SLEEP'; optionId: string | null }
  | { type: 'CLEAR_AVATAR_REACTION' }
  | { type: 'EXIT_TO_MENU' }
  | { type: 'CONTINUE_GAME' }

function doActivity(state: GameState, id: ActivityId): GameState {
  if (!isActivityAvailable(state, id)) return state
  if (activityLimitReached(state, id)) return state
  if (!activityRequirementChecks(state, id).every((c) => c.ok)) return state
  const activity = ACTIVITIES.find((a) => a.id === id)!
  const dailyGainCounts = { ...state.dailyGainCounts }
  const scaledMain = { ...activity.effects.main }
  const scaledSub = { ...activity.effects.sub }
  let reduced = false
  for (const [key, value] of [...Object.entries(scaledMain), ...Object.entries(scaledSub)] as [GainKey, number][]) {
    if (value <= 0) continue
    const occurrence = (dailyGainCounts[key] ?? 0) + 1
    const multiplier = gainMultiplierForOccurrence(occurrence)
    if (multiplier < 1) reduced = true
    if (key in scaledMain) scaledMain[key as MainKey] = value * multiplier
    else scaledSub[key as SubKey] = value * multiplier
    dailyGainCounts[key] = occurrence
  }
  let next: GameState = {
    ...state,
    activityCounts: { ...state.activityCounts, [id]: state.activityCounts[id] + 1 },
    dailyActivityCounts: { ...state.dailyActivityCounts, [id]: state.dailyActivityCounts[id] + 1 },
    dailyGainCounts,
  }
  const beforeMain = { ...next.main }
  const beforeSub = { ...next.subBase }
  next = applyEffects(next, { ...activity.effects, main: scaledMain, sub: scaledSub, minutes: activity.minutes }, { fromActivity: true })
  const gains = {} as Partial<Record<GainKey, number>>
  for (const key of Object.keys(scaledMain) as MainKey[]) if ((activity.effects.main?.[key] ?? 0) > 0) gains[key] = next.main[key] - beforeMain[key]
  for (const key of Object.keys(scaledSub) as SubKey[]) if ((activity.effects.sub?.[key] ?? 0) > 0) gains[key] = next.subBase[key] - beforeSub[key]
  next = { ...next, lastActivityResult: { id, gains, reduced } }
  if (id === 'socializar' || id === 'criar') next = { ...next, avatarReaction: 'celebrate' }
  if (id === 'descansar') next = { ...next, avatarReaction: 'rest' }

  if (id === 'criar') {
    const subs = computeSubs(state.main, state.subBase)
    const quality = subs.foco * 0.8 + subs.inteligencia * 0.4
    const viral = Math.random() < 0.08
    let gained = Math.round(quality * (0.5 + Math.random()) * (1 + state.followers / 2000))
    if (viral) gained *= 10
    next = { ...next, followers: next.followers + gained }
    next = addLog(
      next,
      viral
        ? `Seu vídeo VIRALIZOU! +${gained} seguidores.`
        : `Você postou um conteúdo e ganhou ${gained} seguidores.`,
      'good',
    )
  } else {
    next = addLog(next, `Você fez: ${activity.name}.`, 'neutral')
  }

  next = finalize(next)
  return maybeTriggerEvent(next, 0.28)
}

function applyReel(state: GameState): GameState {
  const reel = state.currentReel
  if (!reel) return state
  const info = CATEGORIES[reel.category]
  const tolerance = dependencyGainMultiplier(state.main.dependencia)
  const mainEffects = Object.fromEntries(
    Object.entries(info.effects.main).map(([k, v]) => [
      k,
      k === 'felicidade' && (v as number) > 0 ? (v as number) * tolerance : v,
    ]),
  ) as Partial<MainStats>
  const effects: Effects = { main: mainEffects, sub: info.effects.sub }
  const weightBoost = 0.15 + Math.min(3, state.currentReelSeconds) * 0.12
  const next = applyEffects(state, effects)
  return {
    ...next,
    lastReelEffects: effects,
    reelsToday: state.reelsToday + 1,
    reelsByCategory: {
      ...state.reelsByCategory,
      [reel.category]: state.reelsByCategory[reel.category] + 1,
    },
    feedWeights: {
      ...state.feedWeights,
      [reel.category]: Math.min(8, state.feedWeights[reel.category] + weightBoost),
    },
  }
}

function loadNextReel(state: GameState): GameState {
  return {
    ...state,
    currentReel: pickReel(state.feedWeights, state.currentReel?.id),
    currentReelSeconds: 0,
    currentReelLiked: false,
  }
}

function sleep(state: GameState, optionId: string | null): GameState {
  const option = SLEEP_OPTIONS.find((o) => o.id === optionId && o.phases.includes(state.phase))
  const sleepMinutes = state.forcedSleep ? 6 * 60 : clamp(DAY_END + DAY_START - state.minutes, 360, 720)
  const sleepHours = sleepMinutes / 60
  const dispModifier = option?.disposicaoGainModifier ?? 0

  let next: GameState = applyEffects(state, {
    main: {
      saude: 6 + sleepHours * 0.8,
      disposicao: sleepHours * 7 + dispModifier - (state.forcedSleep ? 8 : 0),
      felicidade: 10 - (state.forcedSleep ? 3 : 0),
    },
  })
  if (option) next = applyEffects(next, option.effects)

  const history = [...next.history, snapshot(next)]
  const prevPhase = state.phase
  const yearsPassed = PHASES[prevPhase].yearsPerSleep
  const age = Math.min(MAX_AGE, state.age + yearsPassed)
  const phase = phaseForAge(age)

  const growth = age <= 18 ? 2 : age < 60 ? 0.5 : 0
  const subBase = { ...next.subBase }
  for (const key of Object.keys(subBase) as SubKey[]) subBase[key] += growth * yearsPassed
  if (age >= 60) subBase.forca -= 2 * yearsPassed

  const main = { ...next.main }
  if (age >= 40) main.saude -= (2 + Math.max(0, age - 60) * 0.35) * yearsPassed

  next = clampState({
    ...next,
    age,
    phase,
    main,
    subBase,
    history,
    minutes: DAY_START,
    view: 'life',
    forcedSleep: false,
    reelsToday: 0,
    screenMinutesToday: 0,
    currentReel: null,
    lastReelEffects: null,
    dailyActivityCounts: emptyActivityCounts(),
    dailyGainCounts: {},
    lastActivityResult: null,
    challenge: scheduleChallenge(phase),
    modal: phase !== prevPhase ? { kind: 'phase', phase } : null,
    eventsSeen: phase !== prevPhase ? [] : next.eventsSeen,
  })

  next = addLog(
    next,
    `Você dormiu ${sleepHours.toFixed(0)}h. ${yearsPassed > 1 ? `${yearsPassed} anos se passaram` : '1 ano se passou'}. Agora você tem ${age} anos.`,
    state.forcedSleep ? 'bad' : 'good',
  )

  if (age >= MAX_AGE) {
    return {
      ...next,
      status: 'dead',
      deathCause: 'velhice',
      modal: null,
      pendingEvent: null,
      history: [...next.history, snapshot(next)],
    }
  }

  next = checkDeath(next)
  return maybeTriggerEvent(next, 0.4)
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START':
      return createInitialState(action.name.trim() || 'Webinho', action.avatar)
    case 'RESTART':
      return createInitialState()
    case 'DO_ACTIVITY':
      if (state.status !== 'playing' || state.view !== 'life' || state.modal || state.pendingEvent) return state
      return doActivity(state, action.id)
    case 'OPEN_SOCIAL': {
      if (state.status !== 'playing' || state.view !== 'life' || state.modal || state.pendingEvent) return state
      const next = { ...state, view: 'social' as const }
      return next.currentReel ? next : loadNextReel(next)
    }
    case 'CLOSE_SOCIAL':
      if (state.view !== 'social') return state
      return addLog(
        { ...state, view: 'life' },
        `Você fechou o app. Tempo de tela hoje: ${Math.round(state.screenMinutesToday)} min.`,
        state.screenMinutesToday > 180 ? 'bad' : 'neutral',
      )
    case 'SOCIAL_TICK': {
      if (state.status !== 'playing' || state.view !== 'social' || state.modal || state.pendingEvent)
        return state
      const rate = Math.min(minutesPerSecond(state.reelsToday), Math.max(0, DAY_END - state.minutes))
      let next = advanceTime(state, rate)
      next = {
        ...next,
        currentReelSeconds: state.currentReelSeconds + 1,
        screenMinutesToday: state.screenMinutesToday + rate,
        totalScreenMinutes: state.totalScreenMinutes + rate,
      }
      return finalize(next)
    }
    case 'NEXT_REEL': {
      if (state.status !== 'playing' || state.view !== 'social' || state.modal || state.pendingEvent) return state
      const next = loadNextReel(applyReel(state))
      return finalize(next)
    }
    case 'LIKE_REEL': {
      if (state.status !== 'playing' || state.view !== 'social' || state.modal || state.pendingEvent || !state.currentReel || state.currentReelLiked) return state
      const category = state.currentReel.category
      const next = applyEffects(state, { main: { felicidade: 0.5, dependencia: 0.5 } })
      return {
        ...next,
        currentReelLiked: true,
        feedWeights: {
          ...next.feedWeights,
          [category]: Math.min(8, next.feedWeights[category] + 0.8),
        },
      }
    }
    case 'NOT_INTERESTED': {
      if (state.status !== 'playing' || state.view !== 'social' || state.modal || state.pendingEvent || !state.currentReel) return state
      const category = state.currentReel.category
      const next: GameState = {
        ...state,
        reelsToday: state.reelsToday + 1,
        lastReelEffects: null,
        feedWeights: {
          ...state.feedWeights,
          [category]: Math.max(0.15, state.feedWeights[category] * 0.4),
        },
      }
      return loadNextReel(next)
    }
    case 'EVENT_CHOICE': {
      const event = state.pendingEvent
      if (!event) return state
      const choice = event.choices[action.index]
      let next: GameState = { ...state, pendingEvent: null }
      next = applyEffects(next, choice.effects)
      next = addLog(next, choice.log, 'neutral')
      return finalize(next)
    }
    case 'DISMISS_MODAL':
      return { ...state, modal: null }
    case 'GO_TO_SLEEP':
      if (state.status !== 'playing' || state.view !== 'life' || state.modal || state.pendingEvent || state.minutes < SLEEP_FROM) return state
      return { ...state, view: 'sleep' }
    case 'CANCEL_SLEEP':
      if (state.forcedSleep) return state
      return { ...state, view: 'life' }
    case 'CONFIRM_SLEEP':
      if (state.status !== 'playing' || state.view !== 'sleep') return state
      return sleep(state, action.optionId)
    case 'CLEAR_AVATAR_REACTION':
      return { ...state, avatarReaction: null }
    case 'EXIT_TO_MENU':
      if (state.status !== 'playing') return state
      return { ...state, status: 'paused', view: 'life', modal: null, pendingEvent: null }
    case 'CONTINUE_GAME':
      if (state.status !== 'paused') return state
      return { ...state, status: 'playing' }
    default:
      return state
  }
}
