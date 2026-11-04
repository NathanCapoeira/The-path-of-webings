const assert = require('node:assert/strict')
const test = require('node:test')
const { AVATAR_OPTIONS, HAIR_STYLES, normalizeAvatarConfig } = require('../../.test-build/avatar.js')

test('normaliza um avatar salvo da primeira versão do criador', () => {
  const avatar = normalizeAvatarConfig({ gender: 'homem', skinTone: '#D99C72', hairStyle: 'trancado', hairColor: '#211816', eyeColor: '#3B281A', outfit: 'jaqueta', outfitColor: '#215A99', expression: 'serio' })
  assert.equal(avatar.gender, 'homem')
  assert.equal(avatar.hairStyle, 'trancado')
  assert.equal(avatar.outfit, 'jaqueta')
  assert.equal(avatar.expression, 'serio')
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
