const assert = require('node:assert/strict')
const test = require('node:test')
const {
  ACCESSORIES, AVATAR_OPTIONS, BASE_CLOTHING, CLOTHING_ITEMS, EXPRESSIONS, FACE_SHAPES,
  HAIR_COLOR_MODES, HAIR_STYLES, OUTFITS, OUTERWEAR, normalizeAvatarConfig,
} = require('../../.test-build/avatar.js')

test('normaliza um avatar salvo da primeira versão do criador', () => {
  const avatar = normalizeAvatarConfig({ gender: 'homem', skinTone: '#D99C72', hairStyle: 'trancado', hairColor: '#211816', eyeColor: '#3B281A', outfit: 'jaqueta', outfitColor: '#215A99', expression: 'serio' })
  assert.equal(avatar.gender, 'homem')
  assert.equal(avatar.hairStyle, 'trancado')
  assert.equal(avatar.outfit, 'jaqueta')
  assert.equal(avatar.expression, 'serio')
  assert.equal(avatar.faceShape, 'oval')
  assert.equal(avatar.hairColorMode, 'solid')
  assert.equal(avatar.outerwear, 'none')
  assert.equal(avatar.headAccessory, 'none')
})

test('substitui configurações inválidas por opções seguras', () => {
  const avatar = normalizeAvatarConfig({ hairStyle: 'inexistente', skinTone: 'red' })
  assert.equal(avatar.hairStyle, 'cacheado')
  assert.equal(avatar.skinTone, '#E9B38E')
})

test('preserva todos os estilos e cores de cabelo disponíveis', () => {
  for (const style of HAIR_STYLES) {
    assert.equal(normalizeAvatarConfig({ hairStyle: style.value }).hairStyle, style.value)
  }
  for (const color of AVATAR_OPTIONS.hairColor) {
    assert.equal(normalizeAvatarConfig({ hairColor: color.value }).hairColor, color.value)
  }
})

test('mantém os identificadores de cabelo usados pelos saves anteriores', () => {
  const previousStyles = ['curto', 'cacheado', 'longo', 'trancado', 'afro', 'coques']
  assert.deepEqual(previousStyles.map((hairStyle) => normalizeAvatarConfig({ hairStyle }).hairStyle), previousStyles)
})

test('preserva todos os novos rostos, expressões e vestuários', () => {
  for (const faceShape of FACE_SHAPES) assert.equal(normalizeAvatarConfig({ faceShape: faceShape.value }).faceShape, faceShape.value)
  for (const expression of EXPRESSIONS) assert.equal(normalizeAvatarConfig({ expression: expression.value }).expression, expression.value)
  for (const outfit of OUTFITS) assert.equal(normalizeAvatarConfig({ outfit: outfit.value }).outfit, outfit.value)
})

test('mantém os identificadores de roupa e expressão dos saves anteriores', () => {
  for (const outfit of ['camiseta', 'moletom', 'camisa', 'jaqueta']) assert.equal(normalizeAvatarConfig({ outfit }).outfit, outfit)
  for (const expression of ['sorriso', 'serio', 'calmo']) assert.equal(normalizeAvatarConfig({ expression }).expression, expression)
})

test('entrega o arsenal completo com identificadores e construções únicas', () => {
  assert.equal(HAIR_STYLES.length, 68)
  assert.equal(AVATAR_OPTIONS.hairColor.length, 52)
  assert.equal(HAIR_COLOR_MODES.length, 8)
  assert.equal(BASE_CLOTHING.length, 60)
  assert.equal(OUTERWEAR.length, 40)
  assert.equal(CLOTHING_ITEMS.length, 100)
  assert.equal(Object.values(ACCESSORIES).flat().filter((item) => item.id !== 'none').length, 32)

  assert.equal(new Set(HAIR_STYLES.map((item) => item.id)).size, HAIR_STYLES.length)
  assert.equal(new Set(HAIR_STYLES.map((item) => [item.base, item.fringe, item.scaleX, item.scaleY, item.flip ?? false].join('|'))).size, HAIR_STYLES.length)
  assert.equal(new Set(CLOTHING_ITEMS.map((item) => item.id)).size, CLOTHING_ITEMS.length)
  assert.equal(new Set(CLOTHING_ITEMS.map((item) => [item.slot, item.artBase, item.detail].join('|'))).size, CLOTHING_ITEMS.length)
})

test('mantém metadados gráficos válidos para todas as peças do catálogo', () => {
  const anchors = new Set(['head', 'eyes', 'ears', 'neck', 'torso'])
  const layers = new Set(['hair-front', 'clothing-base', 'clothing-outer', 'accessory', 'headwear'])
  for (const item of [...HAIR_STYLES, ...CLOTHING_ITEMS, ...Object.values(ACCESSORIES).flat()]) {
    assert.ok(anchors.has(item.anchor), `âncora inválida em ${item.id}`)
    assert.ok(layers.has(item.layer), `camada inválida em ${item.id}`)
    assert.ok(item.bounds.width > 0 && item.bounds.height > 0, `limites inválidos em ${item.id}`)
  }
  for (const item of HAIR_STYLES) {
    assert.ok(['raspado', 'curto', 'medio', 'longo'].includes(item.length))
    assert.ok(['classico', 'moderno', 'alternativo', 'preso', 'solto'].includes(item.style))
    assert.ok(Number.isFinite(item.scaleX) && Number.isFinite(item.scaleY), `escala inválida em ${item.id}`)
    assert.ok(Number.isFinite(item.offsetX) && Number.isFinite(item.offsetY), `deslocamento inválido em ${item.id}`)
  }
  for (const item of CLOTHING_ITEMS) {
    assert.equal(item.layer, item.slot === 'base' ? 'clothing-base' : 'clothing-outer')
  }
  for (const [slot, items] of Object.entries(ACCESSORIES)) {
    assert.equal(items.filter((item) => item.id === 'none').length, 1, `slot ${slot} precisa de uma opção vazia`)
    assert.ok(items.every((item) => item.slot === slot))
  }
})

test('preserva a personalização avançada ao normalizar e restaurar um save', () => {
  const avatar = normalizeAvatarConfig({
    hairStyle: 'mohawk', hairColor: '#12ab34', hairSecondaryColor: '#A76AD1', hairColorMode: 'split',
    outfit: 'jaqueta-painel', outerwear: 'denim-contraste', outfitColor: '#abcdef', outfitSecondaryColor: '#C52983', outfitPattern: 'checker',
    headAccessory: 'bone', faceAccessory: 'oculos-sol', earAccessory: 'argolas', neckAccessory: 'corrente',
  })
  assert.deepEqual(avatar, {
    gender: 'mulher', faceShape: 'oval', skinTone: '#E9B38E', hairStyle: 'mohawk', hairColor: '#12AB34', hairSecondaryColor: '#A76AD1', hairColorMode: 'split',
    eyeColor: '#43271D', outfit: 'jaqueta-painel', outerwear: 'denim-contraste', outfitColor: '#ABCDEF', outfitSecondaryColor: '#C52983', outfitPattern: 'checker',
    headAccessory: 'bone', faceAccessory: 'oculos-sol', earAccessory: 'argolas', neckAccessory: 'corrente', expression: 'sorriso',
  })
})

test('descarta camadas e acessórios inválidos sem corromper o avatar', () => {
  const avatar = normalizeAvatarConfig({
    outerwear: 'nao-existe', hairColorMode: 'invalido', outfitPattern: 'invalido',
    headAccessory: 'nao-existe', faceAccessory: 'nao-existe', earAccessory: 'nao-existe', neckAccessory: 'nao-existe',
  })
  assert.equal(avatar.outerwear, 'none')
  assert.equal(avatar.hairColorMode, 'solid')
  assert.equal(avatar.outfitPattern, 'none')
  assert.deepEqual([avatar.headAccessory, avatar.faceAccessory, avatar.earAccessory, avatar.neckAccessory], ['none', 'none', 'none', 'none'])
})
