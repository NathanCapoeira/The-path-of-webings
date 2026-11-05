import { useId } from 'react'
import { cn } from '@/lib/utils'
import { AVATAR_OPTIONS, DEFAULT_AVATAR } from '@/lib/game/avatar'
import { ACCESSORIES, BASE_CLOTHING, HAIR_STYLES, OUTERWEAR, type HairBase, type HairFringe } from '@/lib/game/avatar-catalog'
import type { AvatarConfig, AvatarReaction, Expression, FaceShape } from '@/lib/game/types'

export { AVATAR_OPTIONS, DEFAULT_AVATAR }

type OutfitArt = { silhouette: string; overlay?: string; seams: string; accent?: string }

const HAIR_FRONT: Record<HairBase, string> = {
  buzz: 'M47 70C49 45 62 35 81 35C101 35 113 48 114 70C99 61 62 61 47 70Z',
  short: 'M43 73C42 50 53 35 72 35C91 29 112 42 117 59L114 79L106 87C101 72 91 67 81 66C72 73 62 75 51 87Z',
  wave: 'M41 79C34 58 45 39 61 42C69 27 96 30 101 43C119 39 127 60 117 83L106 75C99 84 89 74 81 81C72 70 63 84 53 75Z',
  curl: 'M39 81C29 65 38 46 53 47C54 30 76 29 83 41C94 29 113 39 112 53C129 57 124 79 112 86L102 74L91 83L79 73L67 83L55 73Z',
  long: 'M41 76C42 39 74 29 97 39C115 47 122 61 118 80L107 93C103 70 92 58 81 55C73 67 60 75 50 93Z',
  braid: 'M42 78C43 41 74 30 97 40C114 48 121 63 117 80L106 89L98 76L88 86L77 74L64 87L52 78Z',
  afro: 'M36 82C21 61 35 39 50 40C54 20 78 22 84 34C99 19 119 33 117 49C135 56 128 81 114 87L102 76L91 85L78 74L64 86L51 76Z',
  locs: 'M42 78C42 41 74 30 98 40C115 48 121 64 117 81L106 89L98 76L88 86L78 74L65 87L53 78Z',
  buns: 'M44 72C41 52 53 38 67 42C74 31 91 31 99 42C114 38 122 52 116 72L106 69C98 62 90 59 80 60C69 60 61 63 53 70Z',
  ponytail: 'M41 77C43 39 77 30 99 42C117 51 122 66 116 83L105 90C102 68 91 56 80 54C73 66 61 76 51 90Z',
  fade: 'M45 72C46 48 59 35 80 34C102 34 114 49 115 72L105 66C96 57 66 57 54 67Z',
  crew: 'M45 71L50 47Q79 25 110 46L115 71L103 63Q80 53 56 65Z',
  caesar: 'M44 72Q45 40 80 36Q114 39 116 70L105 76L96 68L87 75L77 67L67 74L56 67Z',
  pixie: 'M43 76Q38 49 61 39Q83 23 109 43Q122 55 115 79L101 67L91 78L77 64L62 78L52 70Z',
  bob: 'M39 73Q40 34 80 32Q121 34 121 74L113 121L101 113L103 72Q80 58 56 72L59 114L47 122Z',
  mullet: 'M42 75Q39 41 66 35Q99 27 117 55L114 81L108 132L96 119L101 72Q78 56 54 76L57 126L45 116Z',
  mohawk: 'M50 71Q52 57 64 51L73 18L82 42L94 15L98 48Q111 54 114 71L101 64Q80 55 58 66Z',
  flat: 'M43 72L45 39L56 27H105L116 40L116 72L104 65Q80 55 55 66Z',
}

const HAIR_REAR: Partial<Record<HairBase, string>> = {
  wave: 'M40 70C35 46 48 34 64 36C76 25 101 31 108 43C124 51 123 69 116 87L112 134C105 148 95 139 98 125L101 78H55L59 127C61 142 49 148 42 134Z',
  curl: 'M37 78C27 58 39 39 54 41C57 25 78 24 85 36C98 25 117 37 115 52C132 61 125 83 114 88L111 127C103 140 94 132 98 116L100 79H58L61 116C65 131 55 140 46 128L43 91Z',
  long: 'M38 68C38 29 121 27 122 68L119 170C111 179 101 171 101 159L104 81H56L59 159C59 173 47 179 39 169Z',
  bob: 'M40 67Q40 29 80 28Q121 30 120 68L116 129L101 119L103 75H57L60 119L44 129Z',
  mullet: 'M40 68Q39 29 80 29Q121 32 119 70L115 153L99 138L102 76H57L61 140L44 153Z',
  braid: 'M45 68C45 34 115 34 115 69M50 72L45 164M61 74L58 176M72 76L69 168M89 76L92 171M101 74L105 176M111 72L116 164',
  locs: 'M43 69C43 33 117 33 117 70M48 66L43 165M59 68L57 178M70 70L68 169M90 70L92 172M101 68L104 178M112 66L118 165',
  ponytail: 'M43 68C43 34 117 34 117 68L108 91C123 98 128 126 117 159C109 182 92 170 101 150C110 126 107 103 97 91H55Z',
}

const HAIR_DETAIL: Partial<Record<HairBase, string>> = {
  buzz: 'M54 58C67 49 94 48 107 59', short: 'M52 59C67 43 95 43 108 59M55 69C71 56 95 56 107 68', fade: 'M53 55Q80 42 107 56', crew: 'M57 49L63 62M72 42L75 59M87 40L87 58M101 47L98 61', caesar: 'M53 54L59 67M67 47L71 65M82 44L82 65M97 48L94 66M107 55L103 68',
  wave: 'M48 58C57 47 66 69 75 57C84 46 93 68 105 54M49 70C58 61 67 77 76 68C86 58 96 77 108 66', curl: 'M48 57C52 46 64 47 67 58M70 47C76 37 88 40 91 51M94 57C100 47 111 51 111 62M56 69C62 61 70 65 72 73M84 64C90 55 99 61 100 70', afro: 'M43 58C49 46 62 47 66 59M67 42C74 31 88 34 92 46M96 51C105 40 117 47 117 60M48 71C56 61 67 64 70 75M82 59C89 49 101 53 104 65',
  long: 'M55 55C68 42 88 39 103 51M55 68C69 54 90 51 107 64M63 79C74 70 91 68 101 77', bob: 'M53 53Q80 39 107 53M51 67Q80 52 109 67', mullet: 'M52 52Q80 37 108 54M52 66Q80 50 108 67', braid: 'M55 54L66 73M69 45L77 73M86 42L88 73M101 49L98 74M52 73L61 83M106 70L100 83', locs: 'M52 51L60 77M67 42L72 76M83 39L83 75M99 44L94 77M110 54L104 80', buns: 'M55 57C69 45 93 45 106 59', ponytail: 'M55 55C70 41 93 43 106 57M61 69C74 57 94 57 105 69', flat: 'M53 38H107M53 49H108', mohawk: 'M70 49L77 27M82 45L92 24', pixie: 'M52 56Q70 39 92 45M61 70Q84 54 107 62',
}

const FRINGES: Record<HairFringe, string> = {
  none: '', straight: 'M50 58Q80 48 110 58L106 75Q94 66 82 76Q70 66 54 75Z', 'side-left': 'M48 54Q76 36 105 51Q85 55 61 76L50 73Z', 'side-right': 'M55 50Q84 37 113 58L108 76Q91 60 58 59Z', curtain: 'M52 51Q78 35 108 52L84 75L80 57L74 76Z', wispy: 'M52 52Q80 36 109 54L98 75L90 59L81 76L72 59L60 74Z', asymmetric: 'M47 51Q80 34 112 57L105 76L92 61L69 78L52 73Z', micro: 'M57 51Q80 40 104 52L101 66Q80 58 59 67Z',
}

const OUTFIT_ART: Record<string, OutfitArt> = {
  tee: { silhouette:'M25 207L29 170C31 153 48 144 65 141L80 158L95 141C113 144 129 153 132 170L136 207Z', seams:'M65 142Q80 158 95 142M39 166L34 205M121 166L126 205' },
  oversized:{ silhouette:'M12 207L17 168C19 151 43 142 63 140L80 155L97 140C118 142 141 151 143 168L148 207Z', seams:'M62 141Q80 157 98 141M22 177H138M49 149L38 204M111 149L122 204' },
  hoodie:{ silhouette:'M17 207L20 169C22 151 44 140 63 139L80 156L97 139C117 140 138 151 141 169L144 207Z', overlay:'M57 143Q80 128 103 143L96 168L80 158L64 168ZM55 184Q80 174 105 184L103 207H57Z', seams:'M62 143L80 160L98 143M80 160V181' },
  shirt:{ silhouette:'M23 207L27 169C29 151 48 144 64 141L80 158L96 141C113 144 132 151 134 169L138 207Z', overlay:'M63 141L80 158L69 171L57 147ZM97 141L80 158L91 171L103 147Z', seams:'M80 159V207M39 169L35 205M121 169L125 205' },
  jacket:{ silhouette:'M17 207L20 168C23 150 43 142 63 139L80 157L97 139C118 142 138 150 141 168L144 207Z', overlay:'M22 168L52 148L80 160L108 148L138 168L130 207H30ZM52 148L69 177L80 160L91 177L108 148', seams:'M80 160V207M31 180H58M102 180H131M42 153L53 207M118 153L107 207' },
  bomber:{ silhouette:'M15 207L18 169C20 151 42 140 64 140L80 154L96 140C119 140 140 151 142 169L145 207Z', overlay:'M18 169Q31 154 47 149L54 207H24ZM142 169Q129 154 113 149L106 207H136Z', seams:'M64 141Q80 154 96 141M80 154V207M20 197H140' },
  sport:{ silhouette:'M22 207L25 169C27 151 47 143 64 141L80 155L96 141C114 143 133 151 136 169L139 207Z', overlay:'M25 169L52 148L64 141L80 155L96 141L108 148L136 169L128 181L105 161L98 207H62L55 161L32 181Z', seams:'M64 142Q80 156 96 142M62 207L55 161M98 207L105 161' },
  blazer:{ silhouette:'M22 207L25 169C28 151 47 143 64 140L80 157L96 140C114 143 133 151 136 169L139 207Z', overlay:'M64 140L80 157L68 180L49 148ZM96 140L80 157L92 180L111 148ZM68 180L80 207L92 180', seams:'M80 158V207M34 170L30 205M126 170L130 205' },
  tank:{ silhouette:'M31 207L35 166Q40 148 64 143L80 158L96 143Q120 148 125 166L129 207Z', overlay:'M48 149L60 145Q57 164 80 168Q103 164 100 145L112 149', seams:'M42 169L38 205M118 169L122 205' },
  knit:{ silhouette:'M19 207L23 166Q28 148 63 140L80 155L97 140Q132 148 137 166L141 207Z', overlay:'M62 141Q80 154 98 141L94 160Q80 168 66 160Z', seams:'M30 174H130M28 186H132M26 198H134' },
}

const DETAIL_PATHS: Record<string,string> = { clean:'', stripe:'M28 177H132M29 184H131', panel:'M44 151L62 207M116 151L98 207M62 177H98', zip:'M80 157V207M76 175H84M76 190H84', pockets:'M39 181H62V197H40ZM98 181H121L120 197H98Z', graphic:'M67 173L80 164L93 173L88 191H72Z' }
const OUTER_PATHS: Record<string,string> = {
  denim:'M18 207L23 164L51 146L67 154L59 207ZM142 207L137 164L109 146L93 154L101 207ZM51 146L67 154L80 174L93 154L109 146', leather:'M16 207L21 163L50 145L70 158L59 207ZM144 207L139 163L110 145L90 158L101 207ZM50 145L71 160L80 174L89 160L110 145', varsity:'M15 207L19 166L48 147L63 154L56 207ZM145 207L141 166L112 147L97 154L104 207ZM48 147Q80 164 112 147', wind:'M14 207L19 164L53 145L66 157L57 207ZM146 207L141 164L107 145L94 157L103 207ZM53 145L80 171L107 145', cardigan:'M21 207L25 163L57 145L72 160L66 207ZM139 207L135 163L103 145L88 160L94 207ZM72 160L80 173L88 160', coat:'M17 207L22 162L53 143L72 158L62 207ZM143 207L138 162L107 143L88 158L98 207ZM53 143L72 159L80 181L88 159L107 143', 'open-shirt':'M20 207L25 164L53 147L70 159L60 207ZM140 207L135 164L107 147L90 159L100 207ZM53 147L70 160L80 178L90 160L107 147', vest:'M32 207L38 158L62 143L73 160L66 207ZM128 207L122 158L98 143L87 160L94 207ZM62 143L73 160L80 177L87 160L98 143',
}

function ageGroup(age:number){ if(age<4)return'baby';if(age<10)return'child';if(age<18)return'teen';if(age>=60)return'senior';return'adult' }
function facePath(shape:FaceShape,y:number,baby:boolean){const top=y-(baby?43:41),bottom=y+(baby?44:43);if(shape==='redondo')return`M80 ${top}C105 ${top} 119 ${top+18} 118 ${y+5}C117 ${bottom-10} 101 ${bottom} 80 ${bottom}C59 ${bottom} 43 ${bottom-10} 42 ${y+5}C41 ${top+18} 55 ${top} 80 ${top}Z`;if(shape==='angular')return`M80 ${top}C103 ${top} 116 ${top+15} 116 ${y+3}L111 ${bottom-13}L96 ${bottom-2}L80 ${bottom+2}L64 ${bottom-2}L49 ${bottom-13}L44 ${y+3}C44 ${top+15} 57 ${top} 80 ${top}Z`;return`M80 ${top}C103 ${top} 115 ${top+15} 115 ${y+4}C115 ${bottom-10} 100 ${bottom} 80 ${bottom+2}C60 ${bottom} 45 ${bottom-10} 45 ${y+4}C45 ${top+15} 57 ${top} 80 ${top}Z`}

function expressionArt(expression:Expression,eyeY:number){const b=eyeY-10,m=eyeY+23;const brows:Record<Expression,[string,string]>={sorriso:[`M57 ${b+1}Q67 ${b-4} 76 ${b}`,`M84 ${b}Q93 ${b-4} 103 ${b+1}`],calmo:[`M57 ${b}Q67 ${b-2} 76 ${b}`,`M84 ${b}Q93 ${b-2} 103 ${b}`],serio:[`M57 ${b+1}L76 ${b-1}`,`M84 ${b-1}L103 ${b+1}`],triste:[`M57 ${b-2}Q67 ${b+2} 76 ${b+3}`,`M84 ${b+3}Q93 ${b+2} 103 ${b-2}`],preocupado:[`M57 ${b+1}Q67 ${b-5} 76 ${b+2}`,`M84 ${b+2}Q93 ${b-5} 103 ${b+1}`],cansado:[`M57 ${b+2}L76 ${b+3}`,`M84 ${b+3}L103 ${b+2}`],surpreso:[`M57 ${b-3}Q67 ${b-8} 76 ${b-3}`,`M84 ${b-3}Q93 ${b-8} 103 ${b-3}`],irritado:[`M57 ${b-3}L76 ${b+2}`,`M84 ${b+2}L103 ${b-3}`]};const mouths:Record<Expression,string>={sorriso:`M69 ${m-2}Q80 ${m+10} 91 ${m-2}Q80 ${m+4} 69 ${m-2}Z`,calmo:`M72 ${m}Q80 ${m+3} 88 ${m}`,serio:`M71 ${m+1}Q80 ${m} 89 ${m+1}`,triste:`M70 ${m+5}Q80 ${m-5} 90 ${m+5}`,preocupado:`M69 ${m+2}Q74 ${m-2} 79 ${m+2}Q84 ${m+6} 91 ${m+1}`,cansado:`M72 ${m+3}Q80 ${m+1} 88 ${m+3}`,surpreso:`M80 ${m-3}C87 ${m-3} 88 ${m+9} 80 ${m+10}C72 ${m+9} 73 ${m-3} 80 ${m-3}Z`,irritado:`M70 ${m+4}Q80 ${m-3} 90 ${m+3}`};return{brows,mouth:mouths[expression],eyeHeight:expression==='cansado'?2.2:expression==='irritado'?3.7:expression==='surpreso'?6.2:4.8}}

export const AVATAR_GEOMETRY = {
  canvas: { width: 160, height: 210 },
  head: { x: 80, top: 34, centerY: 79 },
  eyes: { leftX: 68, rightX: 92, y: 84 },
  ears: { leftX: 45, rightX: 115, y: 84 },
  neck: { x: 80, y: 145 },
  shoulders: { leftX: 28, rightX: 132, y: 164 },
  torso: { x: 80, top: 140, bottom: 207 },
} as const

function HeadAccessory({art,color}:{art:string;color:string}) {
  if (art==='none') return null
  if (art==='cap') return <><path d="M44 53Q47 31 80 29Q113 31 116 53L109 58Q80 49 51 58Z" fill={color} stroke="#17233a" strokeWidth="2"/><path d="M78 54Q110 49 127 57Q110 63 82 61Z" fill={color} stroke="#17233a" strokeWidth="2"/></>
  if (art==='beanie') return <><path d="M44 54Q44 27 59 18Q80 6 101 18Q116 27 116 54Z" fill={color} stroke="#17233a" strokeWidth="2"/><path d="M43 52Q80 47 117 52L114 62Q80 55 46 62Z" fill={color} stroke="#17233a" strokeWidth="2"/></>
  if (art==='bucket') return <><path d="M49 53L55 29Q80 21 105 29L111 53Z" fill={color} stroke="#17233a" strokeWidth="2"/><path d="M34 56Q80 47 126 56Q122 66 80 65Q38 66 34 56Z" fill={color} stroke="#17233a" strokeWidth="2"/></>
  if (art==='bow') return <path d="M105 37C95 28 88 33 92 44L105 48L118 43C121 32 114 27 105 37Z" fill={color} stroke="#17233a" strokeWidth="2"/>
  if (art==='clips') return <><rect x="48" y="55" width="14" height="4" rx="2" fill={color} stroke="#17233a"/><rect x="98" y="55" width="14" height="4" rx="2" fill={color} stroke="#17233a"/></>
  if (art==='bandana') return <><path d="M45 55Q80 45 115 55L113 64Q80 54 47 64Z" fill={color} stroke="#17233a" strokeWidth="1.5"/><path d="M110 59L126 68L113 72Z" fill={color} stroke="#17233a" strokeWidth="1.5"/></>
  if (art==='headband') return <path d="M49 58Q80 42 111 58" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round"/>
  return <path d="M46 57Q80 49 114 57L113 65Q80 57 47 65Z" fill={color} stroke="#17233a" strokeWidth="1.5"/>
}
function FaceAccessory({art,color,eyeY}:{art:string;color:string;eyeY:number}) {
  if (art==='none') return null
  if (art==='nose') return <circle cx="85" cy={eyeY+13} r="1.8" fill={color} stroke="#17233a" strokeWidth=".6"/>
  if (art==='brow') return <><circle cx="99" cy={eyeY-10} r="1.6" fill={color}/><circle cx="103" cy={eyeY-9} r="1.6" fill={color}/></>
  const fill=art==='sun'?'#172033':art==='color'?color:'white', opacity=art==='sun'?'.95':'.18'
  if (art==='cat') return <g fill={fill} fillOpacity={opacity} stroke={color} strokeWidth="2"><path d={`M54 ${eyeY-8}L78 ${eyeY-5}L76 ${eyeY+7}Q61 ${eyeY+10} 57 ${eyeY}ZM106 ${eyeY-8}L82 ${eyeY-5}L84 ${eyeY+7}Q99 ${eyeY+10} 103 ${eyeY}Z`}/><path d={`M78 ${eyeY}H82`}/></g>
  if (art==='aviator') return <g fill={fill} fillOpacity={opacity} stroke={color} strokeWidth="2"><path d={`M55 ${eyeY-6}Q67 ${eyeY-10} 79 ${eyeY-5}Q78 ${eyeY+9} 67 ${eyeY+10}Q56 ${eyeY+8} 55 ${eyeY-6}ZM105 ${eyeY-6}Q93 ${eyeY-10} 81 ${eyeY-5}Q82 ${eyeY+9} 93 ${eyeY+10}Q104 ${eyeY+8} 105 ${eyeY-6}Z`}/><path d={`M79 ${eyeY-3}H81`}/></g>
  const round=art==='round'||art==='sun'||art==='color'
  return <g fill={fill} fillOpacity={opacity} stroke={color} strokeWidth="2"><rect x="55" y={eyeY-7} width="23" height="14" rx={round?7:3}/><rect x="82" y={eyeY-7} width="23" height="14" rx={round?7:3}/><path d={`M78 ${eyeY}H82M55 ${eyeY-1}L48 ${eyeY-4}M105 ${eyeY-1}L112 ${eyeY-4}`}/></g>
}
function EarAccessory({art,color,faceY}:{art:string;color:string;faceY:number}) {
  if (art==='none') return null
  const y=faceY+14
  if (art==='hoop') return <g fill="none" stroke={color} strokeWidth="2"><circle cx="44" cy={y} r="6"/><circle cx="116" cy={y} r="6"/></g>
  if (art==='drop') return <g fill={color} stroke={color} strokeWidth="1.5"><path d={`M44 ${y-3}V${y+10}M116 ${y-3}V${y+10}`}/><circle cx="44" cy={y+12} r="3"/><circle cx="116" cy={y+12} r="3"/></g>
  if (art==='gauge') return <g fill="#17233a" stroke={color} strokeWidth="2"><circle cx="44" cy={y} r="4"/><circle cx="116" cy={y} r="4"/></g>
  if (art==='cuff') return <g fill="none" stroke={color} strokeWidth="2.5"><path d={`M41 ${y-7}Q47 ${y-4} 43 ${y+1}M119 ${y-7}Q113 ${y-4} 117 ${y+1}`}/></g>
  if (art==='double') return <g fill={color}><circle cx="43" cy={y-3} r="2"/><circle cx="46" cy={y+3} r="2"/><circle cx="117" cy={y-3} r="2"/><circle cx="114" cy={y+3} r="2"/></g>
  const shape=art==='star'?'★':art==='pearl'?'●':'◆'
  return <g fill={color} fontSize="7" textAnchor="middle"><text x="44" y={y+2}>{shape}</text><text x="116" y={y+2}>{shape}</text></g>
}
function NeckAccessory({art,color}:{art:string;color:string}) {
  if (art==='none') return null
  if (art==='tie') return <path d="M75 151L80 158L85 151L88 190L80 201L72 190Z" fill={color} stroke="#17233a" strokeWidth="1.5"/>
  if (art==='bow-tie') return <path d="M80 157L67 150L62 160L77 164H83L98 160L93 150Z" fill={color} stroke="#17233a" strokeWidth="1.5"/>
  if (art==='scarf'||art==='neck-band') return <path d="M59 145Q80 158 101 145L99 165Q80 174 61 165Z" fill={color} stroke="#17233a" strokeWidth="1.5"/>
  if (art==='beads') return <g fill={color}>{[64,70,76,82,88,94].map((x,i)=><circle key={x} cx={x} cy={149+Math.abs(i-2.5)*2.3} r="2.3"/>)}</g>
  return <g fill="none" stroke={color} strokeWidth={art==='choker'?4:2}><path d="M61 141Q80 158 99 141"/>{art==='pendant'?<circle cx="80" cy="157" r="4" fill={color}/>:null}</g>
}

export function Avatar({avatar,age=1,reaction=null,className,label,animate=true,framing='full'}:{avatar:AvatarConfig;age?:number;reaction?:AvatarReaction;className?:string;label?:string;animate?:boolean;framing?:'full'|'head'|'torso'}){
  const id=useId().replace(/:/g,''),group=ageGroup(age),baby=group==='baby',senior=group==='senior',faceY=baby?83:79,eyeY=faceY+5,hairOffset=faceY-79
  const expression=reaction==='celebrate'?'sorriso':reaction==='rest'?'cansado':avatar.expression,face=facePath(avatar.faceShape,faceY,baby),art=expressionArt(expression,eyeY),tired=expression==='cansado'
  const hairStyle=HAIR_STYLES.find(item=>item.id===avatar.hairStyle)??HAIR_STYLES[0],base=hairStyle.base,front=HAIR_FRONT[base],rear=HAIR_REAR[base],detail=HAIR_DETAIL[base],fringe=FRINGES[hairStyle.fringe]
  const primary=senior?'#B5B7BC':avatar.hairColor,secondary=senior?'#E3E4E7':avatar.hairSecondaryColor
  const baseItem=BASE_CLOTHING.find(item=>item.id===avatar.outfit)??BASE_CLOTHING[0],clothing=OUTFIT_ART[baseItem.artBase]??OUTFIT_ART.tee,outer=OUTERWEAR.find(item=>item.id===avatar.outerwear)
  const head=ACCESSORIES.head.find(item=>item.id===avatar.headAccessory)!,faceAcc=ACCESSORIES.face.find(item=>item.id===avatar.faceAccessory)!,ear=ACCESSORIES.ears.find(item=>item.id===avatar.earAccessory)!,neck=ACCESSORIES.neck.find(item=>item.id===avatar.neckAccessory)!
  const faceClip=`face-${id}`,hairGradient=`hair-${id}`,skinGradient=`skin-${id}`,outfitGradient=`outfit-${id}`,frontClip=`front-${id}`,baseClip=`base-${id}`,outerClip=`outer-${id}`,headwearClip=`headwear-${id}`
  const scaleX=hairStyle.flip?-hairStyle.scaleX:hairStyle.scaleX,hairTransform=`translate(80 70) scale(${scaleX} ${hairStyle.scaleY}) translate(-80 -70) translate(0 ${hairOffset})`
  const headwearCover=head?.headwearFit==='cover',headwearTop=head?.art==='beanie'?58:head?.art==='bucket'?57:54
  const viewBox=framing==='head'?'22 8 116 122':framing==='torso'?'8 118 144 92':'0 0 160 210'
  const stops=avatar.hairColorMode==='ombre'?[<stop key="a" offset="0" stopColor={primary}/>,<stop key="b" offset=".48" stopColor={primary}/>,<stop key="c" offset="1" stopColor={secondary}/>]:avatar.hairColorMode==='roots'?[<stop key="a" offset="0" stopColor="#171217"/>,<stop key="b" offset=".28" stopColor={primary}/>,<stop key="c" offset="1" stopColor={primary}/>]:[<stop key="a" offset="0" stopColor="#fff" stopOpacity=".14"/>,<stop key="b" offset=".2" stopColor={primary}/>,<stop key="c" offset="1" stopColor={primary}/>]
  return <svg viewBox={viewBox} role="img" aria-label={label??'Avatar do personagem'} preserveAspectRatio="xMidYMid meet" className={cn('h-auto w-full overflow-hidden',animate&&'tpw-avatar',reaction&&`tpw-avatar--${reaction}`,className)}>
    <defs><clipPath id={faceClip}><path d={face}/></clipPath><clipPath id={frontClip}><path d={front}/></clipPath><clipPath id={baseClip}><path d={clothing.silhouette}/></clipPath>{outer?<clipPath id={outerClip}><path d={OUTER_PATHS[outer.artBase]}/></clipPath>:null}<clipPath id={headwearClip}><rect x="18" y={headwearTop} width="124" height="156"/></clipPath><linearGradient id={skinGradient}><stop stopColor="#fff" stopOpacity=".16"/><stop offset=".28" stopColor={avatar.skinTone}/><stop offset="1" stopColor={avatar.skinTone}/></linearGradient><linearGradient id={hairGradient} x1="0" y1="0" x2="0" y2="1">{stops}</linearGradient><linearGradient id={outfitGradient}><stop stopColor="#fff" stopOpacity=".16"/><stop offset=".2" stopColor={avatar.outfitColor}/><stop offset="1" stopColor={avatar.outfitColor}/></linearGradient></defs>
    {rear?<g className="tpw-avatar__hair-back" transform={hairTransform}>{base==='braid'||base==='locs'?<><path d={rear} fill="none" stroke="#171016" strokeWidth="10" strokeLinecap="round"/><path d={rear} fill="none" stroke={`url(#${hairGradient})`} strokeWidth="7" strokeLinecap="round"/></>:<path d={rear} fill={`url(#${hairGradient})`} stroke="#2b1b24" strokeWidth="2.5"/>}</g>:null}
    <g className="tpw-avatar__body"><path d="M66 122C68 137 67 145 62 151H98C93 145 92 137 94 122Z" fill={`url(#${skinGradient})`} stroke="#543529" strokeWidth="2"/><path d={clothing.silhouette} fill={`url(#${outfitGradient})`} stroke="#112448" strokeWidth="2.5"/><g clipPath={`url(#${baseClip})`}>{clothing.overlay?<path d={clothing.overlay} fill={avatar.outfitSecondaryColor} fillOpacity=".28" stroke="#fff" strokeOpacity=".2"/>:null}<path d={clothing.seams} fill="none" stroke="#fff" strokeOpacity=".42" strokeWidth="2"/>{DETAIL_PATHS[baseItem.detail]?<path d={DETAIL_PATHS[baseItem.detail]} fill={baseItem.detail==='graphic'?avatar.outfitSecondaryColor:'none'} stroke={avatar.outfitSecondaryColor} strokeWidth="2"/>:null}{avatar.outfitPattern==='stripes'?<path d="M20 170H140M20 181H140M20 192H140" stroke={avatar.outfitSecondaryColor} strokeWidth="3" opacity=".65"/>:avatar.outfitPattern==='checker'?<path d="M20 170H140M20 185H140M40 145V210M60 145V210M80 145V210M100 145V210M120 145V210" stroke={avatar.outfitSecondaryColor} strokeWidth="2" opacity=".55"/>:avatar.outfitPattern==='dots'?<g fill={avatar.outfitSecondaryColor} opacity=".7">{[35,55,75,95,115,135].map((x,i)=><circle key={x} cx={x} cy={174+(i%2)*14} r="3"/>)}</g>:avatar.outfitPattern==='graphic'?<path d="M67 174L80 163L93 174L87 193H73Z" fill={avatar.outfitSecondaryColor}/>:null}</g>{outer?<><path d={OUTER_PATHS[outer.artBase]} fill={avatar.outfitSecondaryColor} stroke="#112448" strokeWidth="2.3"/><g clipPath={`url(#${outerClip})`}><path d={DETAIL_PATHS[outer.detail]} fill={outer.detail==='graphic'?avatar.outfitColor:'none'} stroke={avatar.outfitColor} strokeWidth="2"/></g></>:null}<NeckAccessory art={neck?.art??'none'} color={avatar.outfitSecondaryColor}/></g>
    <g className="tpw-avatar__head"><ellipse cx="45" cy={faceY+5} rx="7" ry="11" fill={avatar.skinTone} stroke="#543529" strokeWidth="2"/><ellipse cx="115" cy={faceY+5} rx="7" ry="11" fill={avatar.skinTone} stroke="#543529" strokeWidth="2"/><path d={face} fill={`url(#${skinGradient})`} stroke="#543529" strokeWidth="2.4"/><g clipPath={`url(#${faceClip})`}><ellipse cx="105" cy={faceY+14} rx="23" ry="38" fill="#542b2b" opacity=".11"/><ellipse cx="62" cy={faceY-16} rx="23" ry="18" fill="#fff" opacity=".08"/></g><EarAccessory art={ear?.art??'none'} color={avatar.outfitSecondaryColor} faceY={faceY}/><g className="tpw-avatar__brows" fill="none" stroke="#3c2823" strokeWidth="3" strokeLinecap="round"><path d={art.brows[expression][0]}/><path d={art.brows[expression][1]}/></g><g className="tpw-avatar__eyes">{[68,92].map(cx=><g key={cx}><ellipse cx={cx} cy={eyeY} rx="8" ry={art.eyeHeight} fill="#fffdf8" stroke="#3b2927" strokeWidth="1.7"/><circle cx={cx} cy={eyeY+(tired?1:0)} r={tired?2.7:3.6} fill={avatar.eyeColor}/><circle cx={cx} cy={eyeY+(tired?1:0)} r="1.55" fill="#11131a"/><circle cx={cx-1.2} cy={eyeY-1.3} r=".8" fill="white"/></g>)}</g><path d={`M80 ${eyeY+4}L77 ${eyeY+14}Q80 ${eyeY+16} 84 ${eyeY+13}`} fill="none" stroke="#75483b" strokeWidth="1.7"/>{expression==='surpreso'||expression==='sorriso'?<path d={art.mouth} fill={expression==='sorriso'?'#8e3d4a':'#4f2024'} stroke="#512c2a" strokeWidth="1.7"/>:<path d={art.mouth} fill="none" stroke="#512c2a" strokeWidth="2.6" strokeLinecap="round"/>}{senior?<g fill="none" stroke="#70453c" opacity=".48"><path d={`M53 ${eyeY+10}Q61 ${eyeY+13} 67 ${eyeY+10}M93 ${eyeY+10}Q100 ${eyeY+13} 107 ${eyeY+10}`}/></g>:null}
      <g className="tpw-avatar__hair-front" transform={hairTransform} clipPath={headwearCover?`url(#${headwearClip})`:undefined}><path d={front} fill="#100b10" opacity=".28" transform="translate(0 2.5)"/><path d={front} fill={`url(#${hairGradient})`} stroke="#2b1b24" strokeWidth="2.4"/>{avatar.hairColorMode==='split'?<g clipPath={`url(#${frontClip})`}><rect x="80" y="20" width="60" height="90" fill={secondary}/></g>:null}{avatar.hairColorMode==='tips'?<g clipPath={`url(#${frontClip})`}><rect x="30" y="67" width="100" height="45" fill={secondary} opacity=".9"/></g>:null}{base==='buns'&&!headwearCover?<><circle cx="51" cy="42" r="13" fill={`url(#${hairGradient})`} stroke="#2b1b24" strokeWidth="2.4"/><circle cx="109" cy="42" r="13" fill={avatar.hairColorMode==='split'?secondary:`url(#${hairGradient})`} stroke="#2b1b24" strokeWidth="2.4"/></>:null}{detail?<path d={detail} fill="none" stroke={avatar.hairColorMode==='highlights'||avatar.hairColorMode==='streaks'?secondary:'#fff'} strokeOpacity={avatar.hairColorMode==='streaks'?'.75':'.24'} strokeWidth={avatar.hairColorMode==='highlights'?'3':'2'}/>:null}{fringe?<path d={fringe} fill={avatar.hairColorMode==='fringe'?secondary:`url(#${hairGradient})`} stroke="#2b1b24" strokeWidth="1.8"/>:null}</g>
      <FaceAccessory art={faceAcc?.art??'none'} color={avatar.outfitSecondaryColor} eyeY={eyeY}/><g transform={`translate(0 ${hairOffset})`}><HeadAccessory art={head?.art??'none'} color={avatar.outfitSecondaryColor}/></g>
    </g>
  </svg>
}
