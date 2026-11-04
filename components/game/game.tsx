'use client'

import { useState } from 'react'
import type { ActivityId } from '@/lib/game/types'
import { DeathScreen } from './death-screen'
import { GameDialogs } from './game-dialogs'
import { GameProvider, useGame } from './game-provider'
import { Hud } from './hud'
import { LifeScreen } from './life-screen'
import { SleepScreen } from './sleep-screen'
import { SocialScreen } from './social-screen'
import { StartScreen } from './start-screen'
import { PauseScreen } from './pause-screen'
import { DiaryPanel } from './diary-panel'

function GameView() {
  const { state } = useGame()
  const [selectedActivity, setSelectedActivity] = useState<ActivityId | null>(null)
  const [diaryOpen, setDiaryOpen] = useState(false)

  if (state.status === 'start') return <StartScreen />
  if (state.status === 'paused') return <PauseScreen />
  if (state.status === 'dead') return <DeathScreen />

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col gap-4 px-3 py-4 md:px-6 md:py-6">
      {state.view !== 'social' ? <Hud previewActivityId={state.view === 'life' ? selectedActivity : null} onOpenDiary={() => setDiaryOpen(true)} /> : null}
      {state.view === 'life' ? <LifeScreen selectedActivity={selectedActivity} onSelectActivity={setSelectedActivity} /> : null}
      {state.view === 'social' ? <SocialScreen diaryOpen={diaryOpen} onOpenDiary={() => setDiaryOpen(true)} /> : null}
      {state.view === 'sleep' ? <SleepScreen /> : null}
      <GameDialogs />
      {diaryOpen ? <DiaryPanel onClose={() => setDiaryOpen(false)} /> : null}
    </main>
  )
}

export function Game() {
  return (
    <GameProvider>
      <GameView />
    </GameProvider>
  )
}
