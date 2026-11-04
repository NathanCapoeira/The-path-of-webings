import type { DigitalEffect, DigitalEffectKind, GameState, GainKey } from './types'

type EffectDefinition = Omit<DigitalEffect, 'id' | 'sourceEventId' | 'modifierValue' | 'stacks' | 'appliedAtAge' | 'appliedAtMinutes' | 'status'> & { modifierPerStack: number }

export const DIGITAL_EFFECTS: Record<DigitalEffectKind, EffectDefinition> = {
  fragmentacao: {
    kind: 'fragmentacao', sourceType: 'social_media', label: 'Atenção fragmentada',
    description: 'A sequência de conteúdos muito rápidos dificulta manter a atenção em uma tarefa.',
    targetAttribute: 'foco', modifierPerStack: -6, maxStacks: 2, remainingSleeps: 1,
    recoveryRule: 'Faça uma pausa sem telas ou durma.',
  },
  comparacao: {
    kind: 'comparacao', sourceType: 'social_media', label: 'Comparação digital',
    description: 'A exposição repetida a rotinas idealizadas pesa sobre o bem-estar do personagem.',
    targetAttribute: 'sanidade', modifierPerStack: -7, maxStacks: 1, remainingSleeps: 1,
    recoveryRule: 'Socialize fora da rede ou durma.',
  },
  sobrecarga: {
    kind: 'sobrecarga', sourceType: 'social_media', label: 'Sobrecarga de tela',
    description: 'Duas horas de tela no mesmo dia reduzem temporariamente a energia disponível.',
    targetAttribute: 'disposicao', modifierPerStack: -8, maxStacks: 1, remainingSleeps: 1,
    recoveryRule: 'Descanse ou complete uma noite de sono.',
  },
  'sono-digital': {
    kind: 'sono-digital', sourceType: 'social_media', label: 'Sono interrompido pelo feed',
    description: 'Rolar vídeos antes de dormir prejudica a concentração no dia seguinte.',
    targetAttribute: 'foco', modifierPerStack: -10, maxStacks: 1, remainingSleeps: 1,
    recoveryRule: 'Passe a próxima noite sem rolar o feed.',
  },
}

export function activeDigitalEffects(effects: DigitalEffect[]) {
  return effects.filter((effect) => effect.status === 'active')
}

export function digitalModifiers(effects: DigitalEffect[]) {
  const modifiers: Partial<Record<GainKey, number>> = {}
  for (const effect of activeDigitalEffects(effects)) {
    modifiers[effect.targetAttribute] = (modifiers[effect.targetAttribute] ?? 0) + effect.modifierValue
  }
  return modifiers
}

export function applyDigitalEffect(state: GameState, kind: DigitalEffectKind, sourceEventId: string) {
  const definition = DIGITAL_EFFECTS[kind]
  const { modifierPerStack, ...effectDefinition } = definition
  const existing = state.digitalEffects.find((effect) => effect.kind === kind && effect.status === 'active')
  if (existing) {
    const stacks = Math.min(existing.maxStacks, existing.stacks + 1)
    const change = stacks > existing.stacks ? 'stacked' as const : 'refreshed' as const
    return {
      change,
      state: {
        ...state,
        digitalEffects: state.digitalEffects.map((effect) => effect.id === existing.id ? {
          ...effect, stacks, modifierValue: modifierPerStack * stacks,
          remainingSleeps: definition.remainingSleeps, sourceEventId,
        } : effect),
      },
    }
  }

  const counter = state.digitalEffectCounter + 1
  const effect: DigitalEffect = {
    ...effectDefinition,
    id: `${kind}-${counter}`,
    sourceEventId,
    modifierValue: modifierPerStack,
    stacks: 1,
    appliedAtAge: state.age,
    appliedAtMinutes: state.minutes,
    status: 'active',
  }
  return {
    change: 'new' as const,
    state: { ...state, digitalEffectCounter: counter, digitalEffects: [...state.digitalEffects, effect].slice(-24) },
  }
}

export type RecoveryTrigger = 'rest' | 'socialize' | 'sleep-online' | 'sleep-offline'

export function recoverDigitalEffects(state: GameState, trigger: RecoveryTrigger) {
  const recovered: DigitalEffect[] = []
  const digitalEffects = state.digitalEffects.map((effect) => {
    if (effect.status !== 'active') return effect
    const directRecovery =
      (trigger === 'rest' && (effect.kind === 'fragmentacao' || effect.kind === 'sobrecarga')) ||
      (trigger === 'socialize' && effect.kind === 'comparacao')
    const sleepRecovery = trigger.startsWith('sleep') && (effect.kind !== 'sono-digital' || trigger === 'sleep-offline')
    if (!directRecovery && !sleepRecovery) return effect
    if (sleepRecovery && effect.remainingSleeps > 1) return { ...effect, remainingSleeps: effect.remainingSleeps - 1 }
    const ended = { ...effect, status: directRecovery ? 'recovered' as const : 'expired' as const, remainingSleeps: 0, endedAtAge: state.age, endReason: directRecovery ? 'Recuperação ativa' : 'Duração concluída' }
    recovered.push(ended)
    return ended
  })
  return { state: { ...state, digitalEffects }, recovered }
}
