const assert = require('node:assert/strict')
const test = require('node:test')
const { applyEffects, computeSubs, createInitialState, gainMultiplierForOccurrence, gameReducer } = require('../../.test-build/engine.js')
const { ACTIVITIES, DIFFICULTIES, SLEEP_FROM } = require('../../.test-build/data.js')

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
  const state = playable({ view: 'sleep', minutes: 19 * 60, main: { saude: 24, disposicao: 24, felicidade: 23, dependencia: 0 } })
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

test('aplica a curva aos ganhos reais até o novo limite do descanso', () => withoutRandomEvents(() => {
  let state = playable({ main: { saude: 24, disposicao: 24, felicidade: 23, dependencia: 0 }, subBase: { foco: 0, sanidade: 0, forca: 20, inteligencia: 20 } })
  const gains = []
  for (let i = 0; i < 6; i += 1) {
    state = gameReducer(state, { type: 'DO_ACTIVITY', id: 'descansar' })
    gains.push(Number(state.lastActivityResult.gains.foco.toFixed(2)))
  }
  assert.deepEqual(gains, [3, 3, 2.25, 1.8, 1.2, 0.75])
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

test('oitavo ganho diário do mesmo atributo zera sem remover penalidades', () => withoutRandomEvents(() => {
  let state = playable({ phase: 3, age: 11, main: { saude: 85, disposicao: 90, felicidade: 90, dependencia: 20 }, subBase: { foco: 100, sanidade: 100, forca: 100, inteligencia: 100 } })
  const actions = ['descansar', 'exercicio', 'descansar', 'estudar', 'descansar', 'criar', 'descansar', 'estudar']
  for (const id of actions) state = gameReducer(state, { type: 'DO_ACTIVITY', id })
  assert.ok(state.main.disposicao < 90)
  assert.equal(state.lastActivityResult.gains.foco, 0)
  assert.equal(state.dailyGainCounts.foco, 8)
}))

test('novos limites reduzem em cerca de 22% as repetições recompensadas', () => {
  const limits = Object.fromEntries(ACTIVITIES.map((activity) => [activity.id, activity.dailyLimit]))
  assert.deepEqual(limits, { exercicio: 3, estudar: 3, socializar: 3, criar: 3, descansar: 6 })
  const previousEffectiveTotal = 3 + 4 + 4 + 4 + 8
  const newTotal = Object.values(limits).reduce((sum, limit) => sum + limit, 0)
  assert.equal(previousEffectiveTotal, 23)
  assert.equal(newTotal, 18)
  assert.ok(newTotal / previousEffectiveTotal <= 0.8)
})

test('cada dificuldade inicia com os valores configurados abaixo de 25', () => {
  for (const difficulty of ['normal', 'desafiador', 'intenso']) {
    const state = createInitialState('Teste', undefined, difficulty)
    assert.equal(state.difficulty, difficulty)
    assert.deepEqual(state.main, DIFFICULTIES[difficulty].initialMain)
    assert.ok(Object.values(state.main).every((value) => value < 25))
  }
})

test('dificuldade aumenta o desgaste temporal sem alterar o avanço do relógio', () => {
  const common = { view: 'social', phase: 3, age: 11, minutes: 12 * 60, reelsToday: 24, main: { saude: 80, disposicao: 80, felicidade: 80, dependencia: 50 } }
  const normal = gameReducer(playable({ ...common, difficulty: 'normal' }), { type: 'SOCIAL_TICK' })
  const intense = gameReducer(playable({ ...common, difficulty: 'intenso' }), { type: 'SOCIAL_TICK' })
  assert.equal(normal.minutes, intense.minutes)
  assert.ok(intense.main.disposicao < normal.main.disposicao)
  assert.ok(intense.main.felicidade < normal.main.felicidade)
})

test('proteção infantil reduz o desgaste causado pela Dependência', () => {
  const common = { view: 'social', difficulty: 'intenso', minutes: 12 * 60, reelsToday: 24, main: { saude: 80, disposicao: 80, felicidade: 80, dependencia: 80 } }
  const baby = gameReducer(playable({ ...common, phase: 0, age: 1 }), { type: 'SOCIAL_TICK' })
  const older = gameReducer(playable({ ...common, phase: 3, age: 11 }), { type: 'SOCIAL_TICK' })
  assert.ok(baby.main.disposicao > older.main.disposicao)
  assert.ok(baby.main.felicidade > older.main.felicidade)
})

test('uso intenso do feed mantém progressão, mas pressiona mais os modos difíceis', () => {
  const original = Math.random
  Math.random = () => 0.5
  try {
    const results = {}
    for (const difficulty of ['normal', 'desafiador', 'intenso']) {
      let state = { ...createInitialState('Teste', undefined, difficulty), modal: null }
      state = gameReducer(state, { type: 'OPEN_SOCIAL' })
      for (let index = 0; index < 24; index += 1) {
        state = gameReducer(state, { type: 'SOCIAL_TICK' })
        state = gameReducer(state, { type: 'NEXT_REEL' })
      }
      assert.equal(state.status, 'playing')
      assert.equal(state.reelsToday, 24)
      results[difficulty] = state
    }
    assert.ok(results.intenso.main.disposicao < results.desafiador.main.disposicao)
    assert.ok(results.desafiador.main.disposicao < results.normal.main.disposicao)
  } finally { Math.random = original }
})

test('sono recupera estados baixos sem apagar completamente todos os riscos', () => withoutRandomEvents(() => {
  for (const difficulty of ['normal', 'desafiador', 'intenso']) {
    const state = playable({ difficulty, view: 'sleep', minutes: 19 * 60, main: { saude: 5, disposicao: 3, felicidade: 6, dependencia: 20 } })
    const next = gameReducer(state, { type: 'CONFIRM_SLEEP', optionId: 'cancao' })
    assert.equal(next.status, 'playing')
    assert.equal(next.age, 2)
    assert.ok(next.main.saude > state.main.saude)
    assert.ok(next.main.disposicao > state.main.disposicao)
    assert.ok(next.main.felicidade > state.main.felicidade)
    assert.equal(next.main.dependencia, 20)
  }
}))

test('deixar o celular fora recupera melhor que rolar o feed antes de dormir', () => withoutRandomEvents(() => {
  const state = playable({ phase: 2, age: 7, view: 'sleep', minutes: 19 * 60, main: { saude: 30, disposicao: 15, felicidade: 30, dependencia: 20 } })
  const offline = gameReducer(state, { type: 'CONFIRM_SLEEP', optionId: 'celular-fora' })
  const online = gameReducer(state, { type: 'CONFIRM_SLEEP', optionId: 'feed' })
  assert.ok(offline.main.disposicao > online.main.disposicao)
  assert.ok(offline.main.dependencia < online.main.dependencia)
}))

test('escolhas razoáveis sem feed sobrevivem aos três primeiros dias em todos os modos', () => withoutRandomEvents(() => {
  for (const difficulty of ['normal', 'desafiador', 'intenso']) {
    let state = { ...createInitialState('Teste', undefined, difficulty), modal: null }
    for (let day = 0; day < 3; day += 1) {
      for (const id of ['descansar', 'socializar', 'descansar', 'socializar', 'descansar', 'socializar', 'descansar', 'descansar', 'descansar']) {
        state = gameReducer(state, { type: 'DO_ACTIVITY', id })
      }
      assert.equal(state.status, 'playing')
      assert.ok(state.minutes >= SLEEP_FROM)
      state = gameReducer(state, { type: 'GO_TO_SLEEP' })
      state = gameReducer(state, { type: 'CONFIRM_SLEEP', optionId: 'cancao' })
      if (state.modal) state = gameReducer(state, { type: 'DISMISS_MODAL' })
    }
    assert.equal(state.age, 4)
    assert.equal(state.status, 'playing')
  }
}))

test('uma estratégia estável alcança a velhice e conclui a jornada em todos os modos', () => withoutRandomEvents(() => {
  for (const difficulty of ['normal', 'desafiador', 'intenso']) {
    let state = { ...createInitialState('Teste', undefined, difficulty), modal: null }
    let days = 0
    while (state.status === 'playing' && days < 60) {
      for (const id of ['descansar', 'socializar', 'descansar', 'socializar', 'descansar', 'socializar', 'descansar', 'descansar', 'descansar']) {
        state = gameReducer(state, { type: 'DO_ACTIVITY', id })
      }
      if (state.status !== 'playing') break
      if (state.minutes < SLEEP_FROM) state = gameReducer(state, { type: 'WAIT_UNTIL_SLEEP' })
      state = gameReducer(state, { type: 'GO_TO_SLEEP' })
      state = gameReducer(state, { type: 'CONFIRM_SLEEP', optionId: state.phase < 2 ? 'cancao' : 'celular-fora' })
      if (state.modal) state = gameReducer(state, { type: 'DISMISS_MODAL' })
      days += 1
    }
    assert.equal(state.status, 'dead')
    assert.ok(state.age >= 60)
  }
}))

test('descanso recupera em situação crítica, mas bloqueia a sétima repetição', () => withoutRandomEvents(() => {
  let state = playable({ main: { saude: 85, disposicao: 10, felicidade: 60, dependencia: 88 }, subBase: { foco: 0, sanidade: 0, forca: 20, inteligencia: 20 } })
  for (let index = 0; index < 6; index += 1) state = gameReducer(state, { type: 'DO_ACTIVITY', id: 'descansar' })
  const afterSix = state
  state = gameReducer(state, { type: 'DO_ACTIVITY', id: 'descansar' })
  assert.equal(afterSix.main.dependencia, 40)
  assert.deepEqual(state, afterSix)
}))

test('quando todas as ações acabam, aguardar avança sem conceder recompensa', () => withoutRandomEvents(() => {
  const counts = { exercicio: 0, estudar: 0, socializar: 3, criar: 0, descansar: 6 }
  const state = playable({ minutes: 18 * 60, dailyActivityCounts: counts, main: { saude: 85, disposicao: 50, felicidade: 50, dependencia: 0 } })
  const next = gameReducer(state, { type: 'WAIT_UNTIL_SLEEP' })
  assert.equal(next.minutes, SLEEP_FROM)
  assert.ok(next.main.disposicao < state.main.disposicao)
  assert.ok(next.main.felicidade < state.main.felicidade)
  assert.deepEqual(next.dailyActivityCounts, counts)
  assert.equal(next.log[0].text, 'Você aguardou até 19:00 sem receber recompensas.')
}))

test('um dia alternado sem feed chega ao horário de dormir e avança a idade', () => withoutRandomEvents(() => {
  let state = playable({ phase: 1, age: 4, subBase: { foco: 100, sanidade: 100, forca: 100, inteligencia: 100 } })
  for (const id of ['socializar', 'descansar', 'estudar', 'descansar', 'exercicio', 'socializar', 'descansar', 'estudar']) {
    state = gameReducer(state, { type: 'DO_ACTIVITY', id })
  }
  assert.ok(state.minutes >= SLEEP_FROM)
  state = gameReducer(state, { type: 'GO_TO_SLEEP' })
  state = gameReducer(state, { type: 'CONFIRM_SLEEP', optionId: null })
  assert.equal(state.age, 5)
  assert.equal(state.minutes, 7 * 60)
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

test('subatributos podem ultrapassar 100 enquanto atributos principais mantêm seus limites', () => {
  const state = playable({ main: { saude: 85, disposicao: 80, felicidade: 80, dependencia: 0 }, subBase: { foco: 90, sanidade: 90, forca: 90, inteligencia: 90 } })
  const next = applyEffects(state, { main: { felicidade: 50 }, sub: { inteligencia: 30 } })
  assert.equal(next.main.felicidade, 100)
  assert.equal(next.subBase.inteligencia, 120)
  assert.ok(computeSubs(next.main, next.subBase).inteligencia > 100)
})

test('abrir, curtir, ignorar e fechar o feed preserva suas mecânicas', () => {
  const original = Math.random
  Math.random = () => 0.5
  try {
    let state = gameReducer(playable(), { type: 'OPEN_SOCIAL' })
    assert.equal(state.view, 'social')
    assert.ok(state.currentReel)
    assert.equal(state.currentReel.media.length, 2)
    assert.ok(state.currentReel.media.every((source) => source.endsWith('.webp')))
    const category = state.currentReel.category
    const initialWeight = state.feedWeights[category]
    state = gameReducer(state, { type: 'LIKE_REEL' })
    assert.equal(state.currentReelLiked, true)
    assert.equal(state.likesByCategory[category], 1)
    assert.ok(state.feedWeights[category] > initialWeight)
    const likedWeight = state.feedWeights[category]
    assert.equal(gameReducer(state, { type: 'LIKE_REEL' }).feedWeights[category], likedWeight)
    state = gameReducer(state, { type: 'NOT_INTERESTED' })
    assert.ok(state.feedWeights[category] < likedWeight)
    assert.equal(state.notInterestedByCategory[category], 1)
    state = gameReducer(state, { type: 'CLOSE_SOCIAL' })
    assert.equal(state.view, 'life')
  } finally { Math.random = original }
})

test('Diário mantém registros não lidos até a consulta explícita', () => withoutRandomEvents(() => {
  let state = gameReducer(playable(), { type: 'DO_ACTIVITY', id: 'descansar' })
  assert.equal(state.logCounter, 1)
  assert.equal(state.lastReadLogId, 0)
  state = gameReducer(state, { type: 'MARK_LOG_READ' })
  assert.equal(state.lastReadLogId, 1)
  const unchanged = gameReducer(state, { type: 'MARK_LOG_READ' })
  assert.equal(unchanged, state)
}))
