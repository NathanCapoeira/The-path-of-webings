import assert from 'node:assert/strict'
import test from 'node:test'
import { normalizeAvatarConfig } from './avatar.ts'

test('normaliza um avatar salvo da primeira versão do criador', () => {
  const avatar = normalizeAvatarConfig({
    gender: 'homem', skinTone: '#D99C72', hairStyle: 'trancado', hairColor: '#211816',
    eyeColor: '#3B281A', outfit: 'jaqueta', outfitColor: '#215A99', expression: 'serio',
  })
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
