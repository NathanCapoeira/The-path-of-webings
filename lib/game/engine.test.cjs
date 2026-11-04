const assert = require('node:assert/strict')
const test = require('node:test')
const { createInitialState, gainMultiplierForOccurrence, gameReducer } = require('../../.test-build/engine.js')

const playable = (overrides = {}) => ({ ...createInitialState('Teste'), modal: null, ...overrides })
const withoutRandomEvents = (run) => { const original = Math.random; Math.random = () => 1; try { return run() } finally { Math.random = original } }

test('cada atividade aplica sua duração uma única vez', () => withoutRandomEvents(() => {
  let state = playable()
  state = gameReducer(state, { type: 'DO_ACTIVITY', id: 'socializar' })
  assert.equal(state.minutes, 9 * 60)
  assert.equal(state.log[0].time, 9 * 60)
  state = gameReducer(state, { type: 'DO_ACTIVITY', id: 'descansar' })
  assert.equal(state.minutes, 10 * 60)
  assert.equal(state.log.length, 2)
}))

test('descansar é um caminho de recuperação com dependência alta', () => withoutRandomEvents(() => {
  let state = playable({ main: { saude: 85, disposicao: 20, felicidade: 70, dependencia: 88 }, subBase: { foco: 0, sanidade: 3, forca: 20, inteligencia: 0 } })
  for (let i = 0; i < 6; i += 1) state = gameReducer(state, { type: 'DO_ACTIVITY', id: 'descansar' })
  assert.equal(state.main.dependencia, 40)
  assert.ok(state.subBase.foco > 0)
  assert.ok(state.subBase.sanidade > 3)
  assert.equal(state.minutes, 13 * 60)
}))

test('o feed só contabiliza o minuto restante até meia-noite', () => {
  const state = playable({ view: 'social', minutes: 23 * 60 + 59, reelsToday: 28, screenMinutesToday: 50, totalScreenMinutes: 100 })
  const next = gameReducer(state, { type: 'SOCIAL_TICK' })
  assert.equal(next.minutes, 24 * 60)
  assert.equal(next.screenMinutesToday, 51)
  assert.equal(next.totalScreenMinutes, 101)
  assert.equal(next.view, 'sleep')
  assert.equal(next.forcedSleep, true)
})

test('uma atividade às 23:59 inicia apenas um sono forçado', () => withoutRandomEvents(() => {
  const state = playable({ minutes: 23 * 60 + 59 })
  const next = gameReducer(state, { type: 'DO_ACTIVITY', id: 'descansar' })
  assert.equal(next.minutes, 24 * 60)
  assert.equal(next.view, 'sleep')
  assert.equal(next.forcedSleep, true)
  assert.equal(next.log.filter((entry) => entry.text.includes('Meia-noite')).length, 1)
  assert.deepEqual(gameReducer(next, { type: 'DO_ACTIVITY', id: 'descansar' }), next)
}))

test('sono aplica no máximo uma ação pré-sono', () => withoutRandomEvents(() => {
  const state = playable({ view: 'sleep', minutes: 19 * 60 })
  const next = gameReducer(state, { type: 'CONFIRM_SLEEP', optionId: 'tablet' })
  assert.equal(next.main.dependencia, 5)
  assert.equal(next.minutes, 7 * 60)
  assert.equal(next.view, 'life')
  assert.equal(next.lastReelEffects, null)
}))

test('uma ação fica bloqueada enquanto um diálogo está pendente', () => {
  const state = playable({ modal: { kind: 'info', title: 'Pausa', text: 'Feche primeiro.' } })
  assert.deepEqual(gameReducer(state, { type: 'DO_ACTIVITY', id: 'descansar' }), state)
})

test('usa a curva configurada de rendimentos decrescentes', () => {
  assert.deepEqual(Array.from({ length: 8 }, (_, index) => gainMultiplierForOccurrence(index + 1)), [1, 1, 0.75, 0.6, 0.4, 0.25, 0.1, 0])
})

test('aplica a curva aos ganhos reais de cada repetição', () => withoutRandomEvents(() => {
  let state = playable({ subBase: { foco: 0, sanidade: 0, forca: 20, inteligencia: 20 } })
  const gains = []
  for (let i = 0; i < 8; i += 1) {
    state = gameReducer(state, { type: 'DO_ACTIVITY', id: 'descansar' })
    gains.push(Number(state.lastActivityResult.gains.foco.toFixed(2)))
  }
  assert.deepEqual(gains, [3, 3, 2.25, 1.8, 1.2, 0.75, 0.3, 0])
}))

test('conta ganhos por atributo mesmo entre atividades diferentes', () => withoutRandomEvents(() => {
  let state = playable({ phase: 1, age: 4, subBase: { foco: 30, sanidade: 30, forca: 30, inteligencia: 30 } })
  state = gameReducer(state, { type: 'DO_ACTIVITY', id: 'descansar' })
  state = gameReducer(state, { type: 'DO_ACTIVITY', id: 'exercicio' })
  state = gameReducer(state, { type: 'DO_ACTIVITY', id: 'descansar' })
  assert.equal(state.dailyGainCounts.foco, 3)
  assert.equal(state.lastActivityResult.reduced, true)
  assert.equal(state.lastActivityResult.gains.foco, 2.25)
}))

test('oitava repetição zera ganhos positivos mas preserva penalidades', () => withoutRandomEvents(() => {
  let state = playable({ main: { saude: 85, disposicao: 50, felicidade: 50, dependencia: 64 }, subBase: { foco: 0, sanidade: 0, forca: 20, inteligencia: 20 } })
  for (let i = 0; i < 8; i += 1) state = gameReducer(state, { type: 'DO_ACTIVITY', id: 'descansar' })
  assert.equal(state.main.dependencia, 0)
  assert.equal(state.lastActivityResult.gains.foco, 0)
  assert.equal(state.dailyGainCounts.foco, 8)
}))

test('dormir reinicia contadores diários sem apagar o histórico total', () => withoutRandomEvents(() => {
  let state = playable({ minutes: 19 * 60 })
  state = gameReducer(state, { type: 'DO_ACTIVITY', id: 'descansar' })
  const total = state.activityCounts.descansar
  state = gameReducer({ ...state, view: 'sleep' }, { type: 'CONFIRM_SLEEP', optionId: null })
  assert.equal(state.dailyActivityCounts.descansar, 0)
  assert.deepEqual(state.dailyGainCounts, {})
  assert.equal(state.activityCounts.descansar, total)
}))

test('limite diário impede nova execução sem alterar o estado', () => withoutRandomEvents(() => {
  const state = playable({ phase: 1, age: 4, dailyActivityCounts: { exercicio: 3, estudar: 0, socializar: 0, criar: 0, descansar: 0 } })
  assert.deepEqual(gameReducer(state, { type: 'DO_ACTIVITY', id: 'exercicio' }), state)
}))

test('sair preserva a partida e continuar retoma o mesmo estado', () => {
  const state = playable({ age: 12, followers: 321 })
  const paused = gameReducer(state, { type: 'EXIT_TO_MENU' })
  assert.equal(paused.status, 'paused')
  const resumed = gameReducer(paused, { type: 'CONTINUE_GAME' })
  assert.equal(resumed.status, 'playing')
  assert.equal(resumed.age, 12)
  assert.equal(resumed.followers, 321)
})
