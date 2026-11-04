'use client'

import { createContext, useContext, useEffect, useReducer, type Dispatch, type ReactNode } from 'react'
import { createInitialState, gameReducer, type GameAction } from '@/lib/game/engine'
import type { GameState } from '@/lib/game/types'
import { normalizeAvatarConfig } from '@/lib/game/avatar'

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
    return {
      ...candidate,
      avatar: normalizeAvatarConfig(candidate.avatar),
      avatarReaction: null,
      difficulty: ['normal', 'desafiador', 'intenso'].includes(candidate.difficulty ?? '') ? candidate.difficulty : 'normal',
      dailyActivityCounts: candidate.dailyActivityCounts ?? { exercicio: 0, estudar: 0, socializar: 0, criar: 0, descansar: 0 },
      dailyGainCounts: candidate.dailyGainCounts ?? {},
      lastActivityResult: candidate.lastActivityResult ?? null,
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
  const [state, dispatch] = useReducer(gameReducer, undefined, restoredState)
  useEffect(() => {
    try {
      window.localStorage.setItem(SAVE_KEY, JSON.stringify(state))
    } catch {
      // The game remains playable if browser storage is unavailable.
    }
  }, [state])
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
