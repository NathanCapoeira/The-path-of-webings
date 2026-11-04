const assert = require('node:assert/strict')
const test = require('node:test')
const { createInitialState, gameReducer } = require('../../.test-build/engine.js')

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
