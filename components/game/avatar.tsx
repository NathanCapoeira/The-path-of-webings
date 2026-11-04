import { useId } from 'react'
import { cn } from '@/lib/utils'
import { AVATAR_OPTIONS, DEFAULT_AVATAR } from '@/lib/game/avatar'
import type { AvatarConfig, AvatarReaction, HairStyle } from '@/lib/game/types'

export { AVATAR_OPTIONS, DEFAULT_AVATAR }

const rearHair: Partial<Record<HairStyle, string>> = {
  longo: 'M38 67C38 28 122 28 122 67L119 166C111 174 103 170 101 160L104 82H56L59 160C57 171 48 174 40 166Z',
  trancado: 'M45 69C45 35 115 35 115 69L110 163M58 74L55 170M70 76L68 174M90 76L92 174M102 74L105 170',
  locs: 'M43 70C43 34 117 34 117 70M49 65L44 165M60 68L58 176M71 70L69 167M89 70L91 170M101 68L103 176M112 65L117 165',
  rabo: 'M43 68C43 34 117 34 117 68L109 91C122 99 126 126 117 157C110 179 94 169 101 151C110 128 108 105 98 92H55Z',
}
const frontHair: Record<HairStyle, string> = {
  raspado: 'M48 68C52 39 108 39 112 68C98 59 62 59 48 68Z',
  curto: 'M43 72C44 40 63 32 82 34C105 35 118 49 117 72L108 85C100 70 67 67 51 84Z',
  ondulado: 'M41 78C34 57 46 39 61 42C69 27 96 31 100 43C119 40 126 61 116 82L105 73C98 83 88 74 81 80C72 70 62 82 53 74Z',
  cacheado: 'M40 81C31 65 39 47 54 47C56 31 77 31 83 41C94 30 112 40 111 53C127 58 123 78 112 84L102 73L91 82L79 73L67 82L55 73Z',
  longo: 'M42 75C43 38 75 30 96 39C115 47 121 61 117 79L107 91C103 69 91 58 81 55C73 67 60 73 51 91Z',
  trancado: 'M43 77C44 41 75 31 96 40C113 47 120 62 116 79L106 87L97 76L87 84L76 74L64 86L53 77Z',
  afro: 'M37 82C22 61 36 40 51 40C56 21 78 24 84 34C99 20 118 34 116 49C134 57 126 81 113 85L102 76L91 84L78 75L65 85L52 76Z',
  locs: 'M43 77C43 41 75 31 97 40C114 48 120 64 116 80L106 88L98 76L88 85L78 74L66 86L54 77Z',
  coques: 'M44 76C39 49 53 37 66 43C74 31 91 31 99 43C115 37 124 52 116 78L105 87H55Z',
  rabo: 'M42 76C44 39 78 31 99 42C116 51 121 65 115 82L105 88C101 68 91 57 80 54C73 65 62 74 52 88Z',
}
const hairDetail: Partial<Record<HairStyle, string>> = {
  curto: 'M54 58C69 46 94 45 107 58M57 67C72 56 95 56 106 67',
  ondulado: 'M50 59C59 50 66 69 75 58C84 47 91 68 103 56',
  cacheado: 'M51 56C55 48 64 48 67 57M72 48C77 40 87 41 90 50M93 57C99 48 108 51 109 60',
  longo: 'M57 55C68 44 86 40 101 50M57 66C70 55 88 51 105 62',
  afro: 'M45 58C51 47 61 48 66 58M68 43C75 33 87 35 91 45M96 52C104 42 115 48 115 59',
  trancado: 'M57 55L67 72M71 46L78 72M87 44L88 72M101 51L98 72',
  locs: 'M54 51L61 76M68 43L72 75M83 40L83 73M98 45L94 76M109 55L104 78',
  coques: 'M57 57C68 47 91 46 104 58',
  rabo: 'M57 55C70 43 91 43 104 56',
}
const outfit: Record<AvatarConfig['outfit'], { base: string; detail: string }> = {
  camiseta: { base: 'M21 203c3-43 25-61 59-61s56 18 59 61z', detail: 'M64 144l16 17 16-17' },
  moletom: { base: 'M17 204c3-44 25-64 63-64s60 20 63 64z', detail: 'M58 143l22 24 22-24m-22 24v38' },
  camisa: { base: 'M22 203c4-42 25-61 58-61s54 19 58 61z', detail: 'M62 143l18 26 18-26m-18 26v37m-17-49 17 10 17-10' },
  jaqueta: { base: 'M18 204c4-43 25-63 62-63s58 20 62 63z', detail: 'M80 143v61m-27-51 27 19 27-19m-27 19-18 32m18-32 18 32' },
}
function ageGroup(age: number) { if (age < 4) return 'baby'; if (age < 10) return 'child'; if (age < 18) return 'teen'; if (age >= 60) return 'senior'; return 'adult' }

export function Avatar({ avatar, age = 1, reaction = null, className, label, animate = true }: { avatar: AvatarConfig; age?: number; reaction?: AvatarReaction; className?: string; label?: string; animate?: boolean }) {
  const instanceId = useId().replace(/:/g, '')
  const group = ageGroup(age), isBaby = group === 'baby', isSenior = group === 'senior'
  const faceY = isBaby ? 83 : 79, faceRx = isBaby ? 36 : 33, eyeY = faceY + 7
  const mouth = avatar.expression === 'sorriso' ? `M71 ${faceY + 24}q9 9 18 0` : avatar.expression === 'serio' ? `M71 ${faceY + 27}h18` : `M72 ${faceY + 26}q8-3 16 0`
  const layer = outfit[avatar.outfit], hair = isSenior ? '#B5B7BC' : avatar.hairColor
  const clipId = `face-${instanceId}-${avatar.hairStyle}-${group}`
  const rear = rearHair[avatar.hairStyle]
  const strandBack = avatar.hairStyle === 'trancado' || avatar.hairStyle === 'locs'
  return <svg viewBox="0 0 160 210" role="img" aria-label={label ?? 'Avatar do personagem'} className={cn('h-auto w-full overflow-visible', animate && 'tpw-avatar', reaction && `tpw-avatar--${reaction}`, className)}>
    <defs><clipPath id={clipId}><ellipse cx="80" cy={faceY} rx={faceRx} ry={isBaby ? 42 : 40} /></clipPath></defs>
    <g className="tpw-avatar__body">{rear ? <path d={rear} fill={strandBack ? 'none' : hair} stroke={strandBack ? hair : '#2B1B19'} strokeWidth={strandBack ? 7 : 2.5} strokeLinecap="round" strokeLinejoin="round" /> : null}<path d={layer.base} fill={avatar.outfitColor} stroke="#112448" strokeWidth="3" strokeLinejoin="round" /><path d="M66 129h28v22H66z" fill={avatar.skinTone} /><path d={layer.detail} fill="none" stroke="rgba(255,255,255,.42)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></g>
    <g className="tpw-avatar__head"><ellipse cx="80" cy={faceY} rx={faceRx} ry={isBaby ? 42 : 40} fill={avatar.skinTone} stroke="#543529" strokeWidth="2.5" /><g clipPath={`url(#${clipId})`} opacity=".18"><ellipse cx="54" cy={faceY + 11} rx="15" ry="30" fill="#6C372B" /><ellipse cx="106" cy={faceY + 11} rx="15" ry="30" fill="#6C372B" /></g><path d={frontHair[avatar.hairStyle]} fill={hair} stroke="#2B1B19" strokeWidth="2.5" strokeLinejoin="round" />{avatar.hairStyle === 'coques' ? <><circle cx="45" cy="52" r="16" fill={hair} stroke="#2B1B19" strokeWidth="2.5" /><circle cx="115" cy="52" r="16" fill={hair} stroke="#2B1B19" strokeWidth="2.5" /><path d="M37 48C42 41 50 40 56 47M106 47C112 40 120 41 124 48" fill="none" stroke="#fff" strokeOpacity=".18" strokeWidth="2.2" strokeLinecap="round" /></> : null}{hairDetail[avatar.hairStyle] ? <path d={hairDetail[avatar.hairStyle]} fill="none" stroke="#fff" strokeOpacity=".2" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /> : null}
      <g className="tpw-avatar__eyes"><path d={`M57 ${eyeY}q11-9 22 0`} fill="white" stroke="#38221E" strokeWidth="2" /><path d={`M81 ${eyeY}q11-9 22 0`} fill="white" stroke="#38221E" strokeWidth="2" /><circle cx="69" cy={eyeY - 1} r="4" fill={avatar.eyeColor} /><circle cx="91" cy={eyeY - 1} r="4" fill={avatar.eyeColor} /><circle cx="69" cy={eyeY - 1} r="1.4" fill="#111" /><circle cx="91" cy={eyeY - 1} r="1.4" fill="#111" /></g><path d={mouth} fill="none" stroke="#512C2A" strokeWidth="3" strokeLinecap="round" />{avatar.expression === 'sorriso' ? <><circle cx="55" cy={faceY + 19} r="5" fill="#D75D6B" opacity=".28" /><circle cx="105" cy={faceY + 19} r="5" fill="#D75D6B" opacity=".28" /></> : null}{isSenior ? <g fill="none" stroke="#70453C" strokeWidth="1.2" opacity=".55"><path d={`M55 ${faceY + 18}h13M92 ${faceY + 18}h13`} /><path d={`M67 ${faceY + 34}q13 4 26 0`} /></g> : null}</g>
  </svg>
}
