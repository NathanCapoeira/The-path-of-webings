'use client'

import { createContext, useContext, useEffect, useReducer, useState, type Dispatch, type ReactNode } from 'react'
import { createInitialState, gameReducer, type GameAction } from '@/lib/game/engine'
import type { GameState } from '@/lib/game/types'
import { normalizeAvatarConfig } from '@/lib/game/avatar'
import { REELS } from '@/lib/game/data'

const SAVE_KEY = 'the-path-of-webings:game:v1'

function isRestorableState(value: Partial<GameState> | null): value is GameState {
  return !!value &&
    ['start', 'playing', 'paused', 'dead'].includes(value.status ?? '') &&
    typeof value.name === 'string' &&
    typeof value.age === 'number' &&
    typeof value.phase === 'number' &&
    typeof value.minutes === 'number' &&
    typeof value.main === 'object' &&
    typeof value.subBase === 'object'
}

function restoredState(): GameState {
  if (typeof window === 'undefined') return createInitialState()
  try {
    const candidate = JSON.parse(window.localStorage.getItem(SAVE_KEY) ?? 'null') as Partial<GameState> | null
    if (!isRestorableState(candidate)) return createInitialState()
    const avatar = normalizeAvatarConfig(candidate.avatar)
    const difficulty = ['normal', 'desafiador', 'intenso'].includes(candidate.difficulty ?? '') ? candidate.difficulty! : 'normal'
    const baseline = createInitialState(candidate.name, avatar, difficulty)
    return {
      ...baseline,
      ...candidate,
      avatar,
      avatarReaction: null,
      currentReel: candidate.currentReel ? REELS.find((reel) => reel.id === candidate.currentReel?.id) ?? null : null,
      difficulty,
      main: { ...baseline.main, ...candidate.main },
      subBase: { ...baseline.subBase, ...candidate.subBase },
      feedWeights: { ...baseline.feedWeights, ...candidate.feedWeights },
      reelsByCategory: { ...baseline.reelsByCategory, ...candidate.reelsByCategory },
      dailyReelsByCategory: { ...baseline.dailyReelsByCategory, ...candidate.dailyReelsByCategory },
      socialSecondsByCategory: { ...baseline.socialSecondsByCategory, ...candidate.socialSecondsByCategory },
      likesByCategory: { ...baseline.likesByCategory, ...candidate.likesByCategory },
      notInterestedByCategory: { ...baseline.notInterestedByCategory, ...candidate.notInterestedByCategory },
      activityCounts: { ...baseline.activityCounts, ...candidate.activityCounts },
      dailyActivityCounts: { ...baseline.dailyActivityCounts, ...candidate.dailyActivityCounts },
      dailyGainCounts: candidate.dailyGainCounts ?? {},
      lastActivityResult: candidate.lastActivityResult ?? null,
      lastReadLogId: candidate.lastReadLogId ?? 0,
      digitalEffects: candidate.digitalEffects ?? [],
      digitalEffectCounter: candidate.digitalEffectCounter ?? 0,
      metrics: {
        activeSeconds: candidate.metrics?.activeSeconds ?? 0,
        phaseSeconds: Array.from({ length: 8 }, (_, index) => candidate.metrics?.phaseSeconds?.[index] ?? 0),
        feedSeconds: candidate.metrics?.feedSeconds ?? 0,
        eventSeconds: candidate.metrics?.eventSeconds ?? 0,
        transitionSeconds: candidate.metrics?.transitionSeconds ?? 0,
        lifeActions: candidate.metrics?.lifeActions ?? 0,
        socialInteractions: candidate.metrics?.socialInteractions ?? 0,
        eventsPresented: candidate.metrics?.eventsPresented ?? 0,
        sleeps: candidate.metrics?.sleeps ?? 0,
      },
    } as GameState
  } catch {
    return createInitialState()
  }
}

interface GameContextValue {
  state: GameState
  dispatch: Dispatch<GameAction>
}

const GameContext = createContext<GameContextValue | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState)
  const [restored, setRestored] = useState(false)
  useEffect(() => {
    dispatch({ type: 'RESTORE_STATE', state: restoredState() })
    setRestored(true)
  }, [])
  useEffect(() => {
    if (!restored) return
    try {
      window.localStorage.setItem(SAVE_KEY, JSON.stringify(state))
    } catch {
      // The game remains playable if browser storage is unavailable.
    }
  }, [state, restored])
  useEffect(() => {
    if (!state.avatarReaction) return
    const timeout = window.setTimeout(() => dispatch({ type: 'CLEAR_AVATAR_REACTION' }), 900)
    return () => window.clearTimeout(timeout)
  }, [state.avatarReaction])
  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used inside GameProvider')
  return ctx
}
