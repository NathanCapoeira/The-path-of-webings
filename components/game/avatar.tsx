import { useId } from 'react'
import { cn } from '@/lib/utils'
import { AVATAR_OPTIONS, DEFAULT_AVATAR } from '@/lib/game/avatar'
import type { AvatarConfig, AvatarReaction, Expression, FaceShape, HairStyle, Outfit } from '@/lib/game/types'

export { AVATAR_OPTIONS, DEFAULT_AVATAR }

type OutfitArt = { silhouette: string; overlay?: string; seams: string; accent?: string }

const rearHair: Partial<Record<HairStyle, string>> = {
  ondulado: 'M40 70C35 46 48 34 64 36C76 25 101 31 108 43C124 51 123 69 116 87L112 134C105 148 95 139 98 125L101 78H55L59 127C61 142 49 148 42 134Z',
  cacheado: 'M37 78C27 58 39 39 54 41C57 25 78 24 85 36C98 25 117 37 115 52C132 61 125 83 114 88L111 127C103 140 94 132 98 116L100 79H58L61 116C65 131 55 140 46 128L43 91Z',
  longo: 'M38 68C38 29 121 27 122 68L119 170C111 179 101 171 101 159L104 81H56L59 159C59 173 47 179 39 169Z',
  trancado: 'M45 68C45 34 115 34 115 69M50 72L45 164M61 74L58 176M72 76L69 168M89 76L92 171M101 74L105 176M111 72L116 164',
  locs: 'M43 69C43 33 117 33 117 70M48 66L43 165M59 68L57 178M70 70L68 169M90 70L92 172M101 68L104 178M112 66L118 165',
  rabo: 'M43 68C43 34 117 34 117 68L108 91C123 98 128 126 117 159C109 182 92 170 101 150C110 126 107 103 97 91H55Z',
}

const frontHair: Record<HairStyle, string> = {
  raspado: 'M47 70C49 45 62 35 81 35C101 35 113 48 114 70C99 61 62 61 47 70Z',
  curto: 'M43 73C42 50 53 35 72 35C91 29 112 42 117 59L114 79L106 87C101 72 91 67 81 66C72 73 62 75 51 87Z',
  ondulado: 'M41 79C34 58 45 39 61 42C69 27 96 30 101 43C119 39 127 60 117 83L106 75C99 84 89 74 81 81C72 70 63 84 53 75Z',
  cacheado: 'M39 81C29 65 38 46 53 47C54 30 76 29 83 41C94 29 113 39 112 53C129 57 124 79 112 86L102 74L91 83L79 73L67 83L55 73Z',
  longo: 'M41 76C42 39 74 29 97 39C115 47 122 61 118 80L107 93C103 70 92 58 81 55C73 67 60 75 50 93Z',
  trancado: 'M42 78C43 41 74 30 97 40C114 48 121 63 117 80L106 89L98 76L88 86L77 74L64 87L52 78Z',
  afro: 'M36 82C21 61 35 39 50 40C54 20 78 22 84 34C99 19 119 33 117 49C135 56 128 81 114 87L102 76L91 85L78 74L64 86L51 76Z',
  locs: 'M42 78C42 41 74 30 98 40C115 48 121 64 117 81L106 89L98 76L88 86L78 74L65 87L53 78Z',
  coques: 'M43 77C38 50 52 36 66 43C73 30 91 30 99 43C116 36 125 52 117 79L105 88H54Z',
  rabo: 'M41 77C43 39 77 30 99 42C117 51 122 66 116 83L105 90C102 68 91 56 80 54C73 66 61 76 51 90Z',
}

const hairMid: Partial<Record<HairStyle, string>> = {
  raspado: 'M54 58C67 49 94 48 107 59',
  curto: 'M52 59C67 43 95 43 108 59M55 69C71 56 95 56 107 68',
  ondulado: 'M48 58C57 47 66 69 75 57C84 46 93 68 105 54M49 70C58 61 67 77 76 68C86 58 96 77 108 66',
  cacheado: 'M48 57C52 46 64 47 67 58M70 47C76 37 88 40 91 51M94 57C100 47 111 51 111 62M56 69C62 61 70 65 72 73M84 64C90 55 99 61 100 70',
  longo: 'M55 55C68 42 88 39 103 51M55 68C69 54 90 51 107 64M63 79C74 70 91 68 101 77',
  afro: 'M43 58C49 46 62 47 66 59M67 42C74 31 88 34 92 46M96 51C105 40 117 47 117 60M48 71C56 61 67 64 70 75M82 59C89 49 101 53 104 65',
  trancado: 'M55 54L66 73M69 45L77 73M86 42L88 73M101 49L98 74M52 73L61 83M106 70L100 83',
  locs: 'M52 51L60 77M67 42L72 76M83 39L83 75M99 44L94 77M110 54L104 80',
  coques: 'M55 57C69 45 93 45 106 59',
  rabo: 'M55 55C70 41 93 43 106 57M61 69C74 57 94 57 105 69',
}

const outfits: Record<Outfit, OutfitArt> = {
  camiseta: { silhouette: 'M25 207L29 170C31 153 48 144 65 141L80 158L95 141C113 144 129 153 132 170L136 207Z', seams: 'M65 142Q80 158 95 142M39 166L34 205M121 166L126 205', accent: 'M48 183H112' },
  oversized: { silhouette: 'M12 207L17 168C19 151 43 142 63 140L80 155L97 140C118 142 141 151 143 168L148 207Z', seams: 'M62 141Q80 157 98 141M22 177H138M49 149L38 204M111 149L122 204', accent: 'M57 186H103' },
  moletom: { silhouette: 'M17 207L20 169C22 151 44 140 63 139L80 156L97 139C117 140 138 151 141 169L144 207Z', overlay: 'M57 143Q80 128 103 143L96 168L80 158L64 168ZM55 184Q80 174 105 184L103 207H57Z', seams: 'M62 143L80 160L98 143M80 160V181M55 184Q80 176 105 184', accent: 'M75 193H85' },
  camisa: { silhouette: 'M23 207L27 169C29 151 48 144 64 141L80 158L96 141C113 144 132 151 134 169L138 207Z', overlay: 'M63 141L80 158L69 171L57 147ZM97 141L80 158L91 171L103 147Z', seams: 'M80 159V207M39 169L35 205M121 169L125 205', accent: 'M77 174H83M77 187H83M77 200H83' },
  jaqueta: { silhouette: 'M17 207L20 168C23 150 43 142 63 139L80 157L97 139C118 142 138 150 141 168L144 207Z', overlay: 'M22 168L52 148L80 160L108 148L138 168L130 207H30ZM52 148L69 177L80 160L91 177L108 148', seams: 'M80 160V207M31 180H58M102 180H131M42 153L53 207M118 153L107 207', accent: 'M34 186H55M105 186H126' },
  bomber: { silhouette: 'M15 207L18 169C20 151 42 140 64 140L80 154L96 140C119 140 140 151 142 169L145 207Z', overlay: 'M18 169Q31 154 47 149L54 207H24ZM142 169Q129 154 113 149L106 207H136Z', seams: 'M64 141Q80 154 96 141M80 154V207M20 197H140', accent: 'M70 205H90' },
  esportivo: { silhouette: 'M22 207L25 169C27 151 47 143 64 141L80 155L96 141C114 143 133 151 136 169L139 207Z', overlay: 'M25 169L52 148L64 141L80 155L96 141L108 148L136 169L128 181L105 161L98 207H62L55 161L32 181Z', seams: 'M64 142Q80 156 96 142M62 207L55 161M98 207L105 161', accent: 'M73 180L80 174L87 180L80 186Z' },
  social: { silhouette: 'M22 207L25 169C28 151 47 143 64 140L80 157L96 140C114 143 133 151 136 169L139 207Z', overlay: 'M64 140L80 157L68 180L49 148ZM96 140L80 157L92 180L111 148ZM68 180L80 207L92 180', seams: 'M80 158V207M34 170L30 205M126 170L130 205', accent: 'M101 184H119M77 179H83M77 193H83' },
}

function ageGroup(age: number) { if (age < 4) return 'baby'; if (age < 10) return 'child'; if (age < 18) return 'teen'; if (age >= 60) return 'senior'; return 'adult' }

function facePath(shape: FaceShape, y: number, baby: boolean) {
  const top = y - (baby ? 43 : 41), bottom = y + (baby ? 44 : 43)
  if (shape === 'redondo') return `M80 ${top}C105 ${top} 119 ${top + 18} 118 ${y + 5}C117 ${bottom - 10} 101 ${bottom} 80 ${bottom}C59 ${bottom} 43 ${bottom - 10} 42 ${y + 5}C41 ${top + 18} 55 ${top} 80 ${top}Z`
  if (shape === 'angular') return `M80 ${top}C103 ${top} 116 ${top + 15} 116 ${y + 3}L111 ${bottom - 13}L96 ${bottom - 2}L80 ${bottom + 2}L64 ${bottom - 2}L49 ${bottom - 13}L44 ${y + 3}C44 ${top + 15} 57 ${top} 80 ${top}Z`
  return `M80 ${top}C103 ${top} 115 ${top + 15} 115 ${y + 4}C115 ${bottom - 10} 100 ${bottom} 80 ${bottom + 2}C60 ${bottom} 45 ${bottom - 10} 45 ${y + 4}C45 ${top + 15} 57 ${top} 80 ${top}Z`
}

function expressionArt(expression: Expression, eyeY: number) {
  const browY = eyeY - 10, mouthY = eyeY + 23
  const brows: Record<Expression, [string, string]> = {
    sorriso: [`M57 ${browY + 1}Q67 ${browY - 4} 76 ${browY}`, `M84 ${browY}Q93 ${browY - 4} 103 ${browY + 1}`],
    calmo: [`M57 ${browY}Q67 ${browY - 2} 76 ${browY}`, `M84 ${browY}Q93 ${browY - 2} 103 ${browY}`],
    serio: [`M57 ${browY + 1}L76 ${browY - 1}`, `M84 ${browY - 1}L103 ${browY + 1}`],
    triste: [`M57 ${browY - 2}Q67 ${browY + 2} 76 ${browY + 3}`, `M84 ${browY + 3}Q93 ${browY + 2} 103 ${browY - 2}`],
    preocupado: [`M57 ${browY + 1}Q67 ${browY - 5} 76 ${browY + 2}`, `M84 ${browY + 2}Q93 ${browY - 5} 103 ${browY + 1}`],
    cansado: [`M57 ${browY + 2}L76 ${browY + 3}`, `M84 ${browY + 3}L103 ${browY + 2}`],
    surpreso: [`M57 ${browY - 3}Q67 ${browY - 8} 76 ${browY - 3}`, `M84 ${browY - 3}Q93 ${browY - 8} 103 ${browY - 3}`],
    irritado: [`M57 ${browY - 3}L76 ${browY + 2}`, `M84 ${browY + 2}L103 ${browY - 3}`],
  }
  const mouths: Record<Expression, string> = {
    sorriso: `M69 ${mouthY - 2}Q80 ${mouthY + 10} 91 ${mouthY - 2}Q80 ${mouthY + 4} 69 ${mouthY - 2}Z`,
    calmo: `M72 ${mouthY}Q80 ${mouthY + 3} 88 ${mouthY}`,
    serio: `M71 ${mouthY + 1}Q80 ${mouthY} 89 ${mouthY + 1}`,
    triste: `M70 ${mouthY + 5}Q80 ${mouthY - 5} 90 ${mouthY + 5}`,
    preocupado: `M69 ${mouthY + 2}Q74 ${mouthY - 2} 79 ${mouthY + 2}Q84 ${mouthY + 6} 91 ${mouthY + 1}`,
    cansado: `M72 ${mouthY + 3}Q80 ${mouthY + 1} 88 ${mouthY + 3}`,
    surpreso: `M80 ${mouthY - 3}C87 ${mouthY - 3} 88 ${mouthY + 9} 80 ${mouthY + 10}C72 ${mouthY + 9} 73 ${mouthY - 3} 80 ${mouthY - 3}Z`,
    irritado: `M70 ${mouthY + 4}Q80 ${mouthY - 3} 90 ${mouthY + 3}`,
  }
  return { brows, mouth: mouths[expression], eyeHeight: expression === 'cansado' ? 2.2 : expression === 'irritado' ? 3.7 : expression === 'surpreso' ? 6.2 : 4.8 }
}

export function Avatar({ avatar, age = 1, reaction = null, className, label, animate = true }: { avatar: AvatarConfig; age?: number; reaction?: AvatarReaction; className?: string; label?: string; animate?: boolean }) {
  const instanceId = useId().replace(/:/g, '')
  const group = ageGroup(age), isBaby = group === 'baby', isSenior = group === 'senior'
  const faceY = isBaby ? 83 : 79, eyeY = faceY + 5, hairOffset = faceY - 79
  const expression = reaction === 'celebrate' ? 'sorriso' : reaction === 'rest' ? 'cansado' : avatar.expression
  const face = facePath(avatar.faceShape, faceY, isBaby)
  const art = expressionArt(expression, eyeY)
  const clothing = outfits[avatar.outfit]
  const hair = isSenior ? '#B5B7BC' : avatar.hairColor
  const rear = rearHair[avatar.hairStyle]
  const strandBack = avatar.hairStyle === 'trancado' || avatar.hairStyle === 'locs'
  const faceClip = `face-${instanceId}`, skinGradient = `skin-${instanceId}`, hairGradient = `hair-${instanceId}`, outfitGradient = `outfit-${instanceId}`
  const tired = expression === 'cansado'

  return <svg viewBox="0 0 160 210" role="img" aria-label={label ?? 'Avatar do personagem'} className={cn('h-auto w-full overflow-visible', animate && 'tpw-avatar', reaction && `tpw-avatar--${reaction}`, className)}>
    <defs>
      <clipPath id={faceClip}><path d={face} /></clipPath>
      <linearGradient id={skinGradient} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".16" /><stop offset=".28" stopColor={avatar.skinTone} /><stop offset="1" stopColor={avatar.skinTone} /></linearGradient>
      <linearGradient id={hairGradient} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".16" /><stop offset=".2" stopColor={hair} /><stop offset=".72" stopColor={hair} /><stop offset="1" stopColor="#08070a" stopOpacity=".42" /></linearGradient>
      <linearGradient id={outfitGradient} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".18" /><stop offset=".22" stopColor={avatar.outfitColor} /><stop offset=".75" stopColor={avatar.outfitColor} /><stop offset="1" stopColor="#07152d" stopOpacity=".38" /></linearGradient>
    </defs>

    {rear ? <g className="tpw-avatar__hair-back"><g transform={`translate(0 ${hairOffset})`}>{strandBack ? <><path d={rear} fill="none" stroke="#171016" strokeOpacity=".65" strokeWidth="10" strokeLinecap="round" /><path d={rear} fill="none" stroke={`url(#${hairGradient})`} strokeWidth="7" strokeLinecap="round" /></> : <path d={rear} fill={`url(#${hairGradient})`} stroke="#2b1b24" strokeWidth="2.5" strokeLinejoin="round" />}</g></g> : null}

    <g className="tpw-avatar__body">
      <path d="M66 122C68 137 67 145 62 151H98C93 145 92 137 94 122Z" fill={`url(#${skinGradient})`} stroke="#543529" strokeWidth="2" />
      <path d={clothing.silhouette} fill={`url(#${outfitGradient})`} stroke="#112448" strokeWidth="2.5" strokeLinejoin="round" />
      {clothing.overlay ? <path d={clothing.overlay} fill="#07152d" fillOpacity={avatar.outfit === 'jaqueta' || avatar.outfit === 'social' ? '.2' : '.12'} stroke="#fff" strokeOpacity=".16" strokeWidth="1.2" strokeLinejoin="round" /> : null}
      <path d={clothing.seams} fill="none" stroke="#fff" strokeOpacity=".42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {clothing.accent ? <path d={clothing.accent} fill="none" stroke="#fff" strokeOpacity=".62" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /> : null}
      <path d="M30 202Q80 194 130 202" fill="none" stroke="#07152d" strokeOpacity=".2" strokeWidth="3" />
    </g>

    <g className="tpw-avatar__head">
      <ellipse cx="45" cy={faceY + 5} rx="7" ry="11" fill={avatar.skinTone} stroke="#543529" strokeWidth="2" /><ellipse cx="115" cy={faceY + 5} rx="7" ry="11" fill={avatar.skinTone} stroke="#543529" strokeWidth="2" />
      <path d={face} fill={`url(#${skinGradient})`} stroke="#543529" strokeWidth="2.4" strokeLinejoin="round" />
      <g clipPath={`url(#${faceClip})`}><ellipse cx="105" cy={faceY + 14} rx="23" ry="38" fill="#542b2b" opacity=".11" /><ellipse cx="62" cy={faceY - 16} rx="23" ry="18" fill="#fff" opacity=".08" /></g>

      <g className="tpw-avatar__brows" fill="none" stroke="#3c2823" strokeWidth="3" strokeLinecap="round"><path d={art.brows[expression][0]} /><path d={art.brows[expression][1]} /></g>
      <g className="tpw-avatar__eyes">
        {[68, 92].map((cx) => <g key={cx}><ellipse cx={cx} cy={eyeY} rx="8" ry={art.eyeHeight} fill="#fffdf8" stroke="#3b2927" strokeWidth="1.7" /><circle cx={cx} cy={eyeY + (tired ? 1 : 0)} r={tired ? 2.7 : 3.6} fill={avatar.eyeColor} /><circle cx={cx} cy={eyeY + (tired ? 1 : 0)} r="1.55" fill="#11131a" /><circle cx={cx - 1.2} cy={eyeY - 1.3} r=".8" fill="white" /></g>)}
        {tired ? <><path d={`M59 ${eyeY - 1}Q68 ${eyeY + 2} 77 ${eyeY - 1}`} fill="none" stroke="#5d4037" strokeWidth="1.5" /><path d={`M83 ${eyeY - 1}Q92 ${eyeY + 2} 101 ${eyeY - 1}`} fill="none" stroke="#5d4037" strokeWidth="1.5" /></> : null}
      </g>
      <path d={`M80 ${eyeY + 4}L77 ${eyeY + 14}Q80 ${eyeY + 16} 84 ${eyeY + 13}`} fill="none" stroke="#75483b" strokeOpacity=".72" strokeWidth="1.7" strokeLinecap="round" />
      {expression === 'surpreso' ? <path d={art.mouth} fill="#4f2024" stroke="#512c2a" strokeWidth="1.5" /> : expression === 'sorriso' ? <path d={art.mouth} fill="#8e3d4a" stroke="#512c2a" strokeWidth="1.7" strokeLinejoin="round" /> : <path d={art.mouth} fill="none" stroke="#512c2a" strokeWidth="2.6" strokeLinecap="round" />}
      {expression === 'sorriso' ? <><circle cx="55" cy={faceY + 20} r="6" fill="#d75d6b" opacity=".2" /><circle cx="105" cy={faceY + 20} r="6" fill="#d75d6b" opacity=".2" /></> : null}
      {isSenior ? <g fill="none" stroke="#70453c" strokeWidth="1.1" opacity=".48"><path d={`M53 ${eyeY + 10}Q61 ${eyeY + 13} 67 ${eyeY + 10}M93 ${eyeY + 10}Q100 ${eyeY + 13} 107 ${eyeY + 10}`} /><path d={`M67 ${eyeY + 31}Q80 ${eyeY + 35} 93 ${eyeY + 31}`} /></g> : null}

      <g className="tpw-avatar__hair-front"><g transform={`translate(0 ${hairOffset})`}>
        <path d={frontHair[avatar.hairStyle]} fill="#100b10" opacity=".3" transform="translate(0 2.5)" />
        <path d={frontHair[avatar.hairStyle]} fill={`url(#${hairGradient})`} stroke="#2b1b24" strokeWidth="2.4" strokeLinejoin="round" />
        {avatar.hairStyle === 'coques' ? <><circle cx="45" cy="52" r="16" fill={`url(#${hairGradient})`} stroke="#2b1b24" strokeWidth="2.4" /><circle cx="115" cy="52" r="16" fill={`url(#${hairGradient})`} stroke="#2b1b24" strokeWidth="2.4" /></> : null}
        {hairMid[avatar.hairStyle] ? <path d={hairMid[avatar.hairStyle]} fill="none" stroke="#fff" strokeOpacity=".2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /> : null}
      </g></g>
    </g>
  </svg>
}
