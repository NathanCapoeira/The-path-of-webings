import { cn } from '@/lib/utils'
import { AVATAR_OPTIONS, DEFAULT_AVATAR } from '@/lib/game/avatar'
import type { AvatarConfig, AvatarReaction, HairStyle } from '@/lib/game/types'

export { AVATAR_OPTIONS, DEFAULT_AVATAR }

const rearHair: Partial<Record<HairStyle, string>> = {
  longo: 'M36 67c0-35 88-35 88 0v102h-19V82H55v87H36z',
  trancado: 'M43 70c0-28 74-28 74 0l-8 90h-12l-4-78-7 85H74l-6-85-4 78H52z',
}
const frontHair: Record<HairStyle, string> = {
  curto: 'M43 73c1-37 73-38 77 0l-9 17c-10-14-50-14-61 0z',
  cacheado: 'M40 80c-9-19 3-37 17-31 5-16 28-18 38-4 17-4 29 14 17 35l-11-8-11 8-13-8-12 8-12-8z',
  longo: 'M42 75c1-37 76-38 77 0l-8 18-10-15-47 4-5 12z',
  trancado: 'M42 77c2-35 75-36 77 0l-10 14-10-10-12 8-12-8-12 9-11-8z',
  afro: 'M39 80c-13-24 2-45 18-41 7-18 29-18 37-1 18-5 32 15 20 41l-12-9-12 9-13-8-14 8-12-9z',
  coques: 'M44 76c-6-28 6-37 18-30 10-10 27-10 37 0 14-8 24 3 18 30l-10 13H54z',
}
const outfit: Record<AvatarConfig['outfit'], { base: string; detail: string }> = {
  camiseta: { base: 'M21 203c3-43 25-61 59-61s56 18 59 61z', detail: 'M64 144l16 17 16-17' },
  moletom: { base: 'M17 204c3-44 25-64 63-64s60 20 63 64z', detail: 'M58 143l22 24 22-24m-22 24v38' },
  camisa: { base: 'M22 203c4-42 25-61 58-61s54 19 58 61z', detail: 'M62 143l18 26 18-26m-18 26v37m-17-49 17 10 17-10' },
  jaqueta: { base: 'M18 204c4-43 25-63 62-63s58 20 62 63z', detail: 'M80 143v61m-27-51 27 19 27-19m-27 19-18 32m18-32 18 32' },
}
function ageGroup(age: number) { if (age < 4) return 'baby'; if (age < 10) return 'child'; if (age < 18) return 'teen'; if (age >= 60) return 'senior'; return 'adult' }

export function Avatar({ avatar, age = 1, reaction = null, className, label, animate = true }: { avatar: AvatarConfig; age?: number; reaction?: AvatarReaction; className?: string; label?: string; animate?: boolean }) {
  const group = ageGroup(age), isBaby = group === 'baby', isSenior = group === 'senior'
  const faceY = isBaby ? 83 : 79, faceRx = isBaby ? 36 : 33, eyeY = faceY + 7
  const mouth = avatar.expression === 'sorriso' ? `M71 ${faceY + 24}q9 9 18 0` : avatar.expression === 'serio' ? `M71 ${faceY + 27}h18` : `M72 ${faceY + 26}q8-3 16 0`
  const layer = outfit[avatar.outfit], hair = isSenior ? '#B5B7BC' : avatar.hairColor
  const clipId = `face-${avatar.hairStyle}-${group}`
  return <svg viewBox="0 0 160 210" role="img" aria-label={label ?? 'Avatar do personagem'} className={cn('h-auto w-full overflow-visible', animate && 'tpw-avatar', reaction && `tpw-avatar--${reaction}`, className)}>
    <defs><clipPath id={clipId}><ellipse cx="80" cy={faceY} rx={faceRx} ry={isBaby ? 42 : 40} /></clipPath></defs>
    <g className="tpw-avatar__body">{rearHair[avatar.hairStyle] ? <path d={rearHair[avatar.hairStyle]} fill={hair} /> : null}<path d={layer.base} fill={avatar.outfitColor} stroke="#112448" strokeWidth="3" strokeLinejoin="round" /><path d="M66 129h28v22H66z" fill={avatar.skinTone} /><path d={layer.detail} fill="none" stroke="rgba(255,255,255,.42)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></g>
    <g className="tpw-avatar__head"><ellipse cx="80" cy={faceY} rx={faceRx} ry={isBaby ? 42 : 40} fill={avatar.skinTone} stroke="#543529" strokeWidth="2.5" /><g clipPath={`url(#${clipId})`} opacity=".18"><ellipse cx="54" cy={faceY + 11} rx="15" ry="30" fill="#6C372B" /><ellipse cx="106" cy={faceY + 11} rx="15" ry="30" fill="#6C372B" /></g><path d={frontHair[avatar.hairStyle]} fill={hair} stroke="#2B1B19" strokeWidth="2.5" strokeLinejoin="round" />{avatar.hairStyle === 'coques' ? <><circle cx="45" cy="52" r="16" fill={hair} stroke="#2B1B19" strokeWidth="2.5" /><circle cx="115" cy="52" r="16" fill={hair} stroke="#2B1B19" strokeWidth="2.5" /></> : null}
      <g className="tpw-avatar__eyes"><path d={`M57 ${eyeY}q11-9 22 0`} fill="white" stroke="#38221E" strokeWidth="2" /><path d={`M81 ${eyeY}q11-9 22 0`} fill="white" stroke="#38221E" strokeWidth="2" /><circle cx="69" cy={eyeY - 1} r="4" fill={avatar.eyeColor} /><circle cx="91" cy={eyeY - 1} r="4" fill={avatar.eyeColor} /><circle cx="69" cy={eyeY - 1} r="1.4" fill="#111" /><circle cx="91" cy={eyeY - 1} r="1.4" fill="#111" /></g><path d={mouth} fill="none" stroke="#512C2A" strokeWidth="3" strokeLinecap="round" />{avatar.expression === 'sorriso' ? <><circle cx="55" cy={faceY + 19} r="5" fill="#D75D6B" opacity=".28" /><circle cx="105" cy={faceY + 19} r="5" fill="#D75D6B" opacity=".28" /></> : null}{isSenior ? <g fill="none" stroke="#70453C" strokeWidth="1.2" opacity=".55"><path d={`M55 ${faceY + 18}h13M92 ${faceY + 18}h13`} /><path d={`M67 ${faceY + 34}q13 4 26 0`} /></g> : null}</g>
  </svg>
}
