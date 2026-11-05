import type { HairColorMode } from './types'

export type HairGroup = 'curto' | 'medio' | 'longo' | 'crespo' | 'alternativo'
export type HairTexture = 'liso' | 'ondulado' | 'cacheado' | 'crespo' | 'trancado'
export type HairBase = 'buzz' | 'short' | 'wave' | 'curl' | 'long' | 'braid' | 'afro' | 'locs' | 'buns' | 'ponytail' | 'fade' | 'crew' | 'caesar' | 'pixie' | 'bob' | 'mullet' | 'mohawk' | 'flat'
export type HairFringe = 'none' | 'straight' | 'side-left' | 'side-right' | 'curtain' | 'wispy' | 'asymmetric' | 'micro'

export interface HairCatalogItem {
  id: string
  value: string
  label: string
  group: HairGroup
  texture: HairTexture
  base: HairBase
  fringe: HairFringe
  scaleX: number
  scaleY: number
  flip?: boolean
}

const hair = (id: string, label: string, group: HairGroup, texture: HairTexture, base: HairBase, fringe: HairFringe = 'none', scaleX = 1, scaleY = 1, flip = false): HairCatalogItem => ({ id, value: id, label, group, texture, base, fringe, scaleX, scaleY, flip })

export const HAIR_STYLES: HairCatalogItem[] = [
  hair('raspado', 'Raspado uniforme', 'curto', 'liso', 'buzz'), hair('buzz-cut', 'Buzz cut', 'curto', 'liso', 'buzz', 'none', .94, .9), hair('degrade-baixo', 'Degradê baixo', 'curto', 'liso', 'fade', 'side-left'), hair('degrade-medio', 'Degradê médio', 'curto', 'liso', 'fade', 'side-right', 1, 1.06), hair('degrade-alto', 'Degradê alto', 'curto', 'liso', 'fade', 'micro', .96, 1.12), hair('taper-fade', 'Taper fade', 'curto', 'cacheado', 'curl', 'none', .88, .83),
  hair('crew-cut', 'Crew cut', 'curto', 'liso', 'crew'), hair('caesar-cut', 'Caesar cut', 'curto', 'liso', 'caesar', 'straight'), hair('french-crop', 'French crop', 'curto', 'liso', 'caesar', 'micro', 1.04, 1.06), hair('side-part', 'Side part', 'curto', 'liso', 'short', 'side-left'), hair('topete', 'Topete', 'curto', 'ondulado', 'crew', 'side-right', 1, 1.18), hair('quiff', 'Quiff', 'curto', 'ondulado', 'wave', 'side-left', .93, .92), hair('slick-back', 'Slick back', 'curto', 'liso', 'short', 'none', .96, .92), hair('undercut', 'Undercut', 'curto', 'liso', 'fade', 'asymmetric', 1.02, 1.12), hair('curto', 'Curto texturizado', 'curto', 'ondulado', 'short', 'wispy'), hair('pixie', 'Pixie cut', 'curto', 'liso', 'pixie', 'side-right'),
  hair('medio-centro', 'Liso repartido ao meio', 'medio', 'liso', 'bob', 'curtain'), hair('medio-lateral', 'Liso lateral', 'medio', 'liso', 'bob', 'side-left', .96, .92), hair('ondulado', 'Ondulado médio', 'medio', 'ondulado', 'wave'), hair('cacheado', 'Cacheado médio', 'medio', 'cacheado', 'curl'), hair('shag', 'Shag', 'medio', 'ondulado', 'mullet', 'wispy', 1.04, .94), hair('wolf-cut', 'Wolf cut', 'medio', 'ondulado', 'mullet', 'curtain', 1.08, 1.04), hair('mullet', 'Mullet moderno', 'medio', 'liso', 'mullet', 'micro'), hair('curtain', 'Curtain hair', 'medio', 'liso', 'short', 'curtain', 1.04, 1.05), hair('bob', 'Bob tradicional', 'medio', 'liso', 'bob', 'straight'), hair('bob-assimetrico', 'Bob assimétrico', 'medio', 'liso', 'bob', 'asymmetric', 1.05, 1.04), hair('long-bob', 'Long bob', 'medio', 'liso', 'long', 'side-left', .92, .78), hair('chanel', 'Chanel', 'medio', 'liso', 'bob', 'micro', .94, .92), hair('camadas-medias', 'Camadas médias', 'medio', 'ondulado', 'wave', 'side-right', 1.08, 1.06), hair('franja-reta', 'Franja reta', 'medio', 'liso', 'bob', 'straight', 1.03, 1.02), hair('franja-lateral', 'Franja lateral', 'medio', 'liso', 'bob', 'side-right', 1.02, .98),
  hair('longo', 'Liso longo', 'longo', 'liso', 'long'), hair('longo-ondulado', 'Ondulado longo', 'longo', 'ondulado', 'long', 'side-left', 1.07, 1.05), hair('longo-cacheado', 'Cacheado longo', 'longo', 'cacheado', 'curl', 'curtain', 1.12, 1.18), hair('longo-crespo', 'Crespo longo', 'longo', 'crespo', 'afro', 'none', 1.08, 1.18), hair('longo-camadas', 'Longo em camadas', 'longo', 'liso', 'long', 'wispy', 1.05, 1.02), hair('longo-franja', 'Longo com franja', 'longo', 'liso', 'long', 'straight'), hair('rabo-alto', 'Rabo de cavalo alto', 'longo', 'liso', 'ponytail', 'side-left', 1, 1.05), hair('rabo', 'Rabo de cavalo baixo', 'longo', 'liso', 'ponytail', 'curtain', .98, .94), hair('coque-alto', 'Coque alto', 'longo', 'liso', 'buns', 'none', .9, 1.12), hair('coque-baixo', 'Coque baixo', 'longo', 'liso', 'buns', 'side-right', 1.08, .9), hair('meio-preso', 'Meio preso', 'longo', 'ondulado', 'ponytail', 'curtain', 1.08, 1), hair('tranca-lateral', 'Trança lateral', 'longo', 'trancado', 'braid', 'side-left', 1.05, 1.02), hair('trancado', 'Trança longa', 'longo', 'trancado', 'braid'), hair('duas-trancas', 'Duas tranças', 'longo', 'trancado', 'braid', 'straight', 1.08, 1.05),
  hair('afro-curto', 'Afro curto', 'crespo', 'crespo', 'afro', 'none', .87, .82), hair('afro-medio', 'Afro médio', 'crespo', 'crespo', 'afro', 'none', .98, .96), hair('afro', 'Afro volumoso', 'crespo', 'crespo', 'afro', 'none', 1.12, 1.12), hair('twa', 'TWA', 'crespo', 'crespo', 'curl', 'none', .82, .78), hair('flat-top', 'Flat top', 'crespo', 'crespo', 'flat'), hair('twist-out', 'Twist out', 'crespo', 'crespo', 'curl', 'wispy', 1.06, 1.02), hair('finger-coils', 'Finger coils', 'crespo', 'cacheado', 'curl', 'micro', .95, .96), hair('two-strand', 'Two-strand twists', 'crespo', 'trancado', 'locs', 'curtain', .96, .9), hair('bantu-knots', 'Bantu knots', 'crespo', 'crespo', 'buns', 'micro', 1.05, 1.02), hair('coques', 'Coques duplos', 'crespo', 'crespo', 'buns', 'none'), hair('locs-curtas', 'Locs curtas', 'crespo', 'trancado', 'locs', 'none', .92, .78), hair('locs', 'Locs médias', 'crespo', 'trancado', 'locs'), hair('locs-longas', 'Locs longas', 'crespo', 'trancado', 'locs', 'none', 1.05, 1.14), hair('high-top-locs', 'High-top locs', 'crespo', 'trancado', 'locs', 'micro', .88, 1.05), hair('box-braids', 'Box braids', 'crespo', 'trancado', 'braid', 'none', 1.05, 1.12), hair('cornrows', 'Cornrows', 'crespo', 'trancado', 'buzz', 'none', 1, 1.04), hair('fulani', 'Fulani braids', 'crespo', 'trancado', 'braid', 'curtain', 1.08, 1.08),
  hair('emo', 'Emo', 'alternativo', 'liso', 'mullet', 'asymmetric', 1.04, 1), hair('mohawk', 'Moicano punk', 'alternativo', 'liso', 'mohawk'), hair('faux-hawk', 'Faux hawk', 'alternativo', 'ondulado', 'mohawk', 'micro', .88, .9), hair('undercut-assimetrico', 'Undercut assimétrico', 'alternativo', 'liso', 'fade', 'asymmetric', 1.08, 1.12), hair('mullet-alt', 'Mullet alternativo', 'alternativo', 'ondulado', 'mullet', 'asymmetric', 1.1, 1.12), hair('shag-volume', 'Shag volumoso', 'alternativo', 'ondulado', 'wave', 'wispy', 1.15, 1.12),
]

export const HAIR_COLOR_MODES: { value: HairColorMode; label: string }[] = [
  { value: 'solid', label: 'Uniforme' }, { value: 'highlights', label: 'Mechas' }, { value: 'tips', label: 'Pontas' }, { value: 'ombre', label: 'Ombré' },
  { value: 'roots', label: 'Raiz escura' }, { value: 'split', label: 'Duas cores' }, { value: 'fringe', label: 'Franja colorida' }, { value: 'streaks', label: 'Reflexos' },
]

export const HAIR_COLORS = [
  ['#100D10','Preto profundo'],['#1B1718','Preto natural'],['#141B2C','Preto azulado'],['#292326','Preto suave'],['#2A1914','Castanho muito escuro'],['#3B251D','Castanho escuro'],['#5A3928','Castanho médio'],['#79503A','Castanho claro'],['#4B2B25','Chocolate'],['#665950','Castanho acinzentado'],['#8A613A','Castanho dourado'],['#71382C','Castanho avermelhado'],['#A56A3D','Caramelo'],['#725436','Loiro escuro'],['#B58A48','Loiro mel'],['#C99D43','Loiro dourado'],['#D5BC85','Loiro areia'],['#D8C7A3','Loiro bege'],['#B8B29F','Loiro acinzentado'],['#E8DFC3','Platinado'],['#F0E7D6','Loiro perolado'],['#D89A78','Loiro morango'],['#B9572E','Ruivo natural'],['#C96632','Ruivo cobre'],['#DD8650','Ruivo claro'],['#C7823E','Ruivo dourado'],['#A83C28','Ruivo intenso'],['#7A3528','Ruivo escuro'],['#763D32','Auburn'],['#C9CBD0','Cinza claro'],['#999DA5','Cinza médio'],['#62666D','Cinza escuro'],['#D8DCE4','Prateado'],['#F1EEE8','Branco natural'],['#143B8F','Azul'],['#101E56','Azul-marinho'],['#68AEE8','Azul-claro'],['#24C7D9','Ciano'],['#24734A','Verde'],['#148A68','Esmeralda'],['#91D5B2','Menta'],['#5A348A','Roxo'],['#A76AD1','Lilás'],['#B99ADC','Lavanda'],['#E678A7','Rosa'],['#C52983','Magenta'],['#C93645','Vermelho'],['#E47632','Laranja'],['#E4C743','Amarelo'],['#F5F2FF','Branco fantasia'],['#617A8C','Azul dessaturado'],['#8B667D','Rosa dessaturado'],
].map(([value,label]) => ({ value, label }))

export type ClothingSlot = 'base' | 'outer'
export type ClothingCategory = 'casual' | 'streetwear' | 'esportivo' | 'social' | 'alternativo' | 'conforto'
export interface ClothingItem { id: string; value: string; label: string; category: ClothingCategory; slot: ClothingSlot; artBase: string; detail: string; material: string }

const baseFamilies = [
  ['camiseta','Camiseta','casual','tee','algodão'],['oversized','Oversized','streetwear','oversized','algodão'],['moletom','Moletom','conforto','hoodie','moletom'],['camisa','Camisa','casual','shirt','algodão'],['jaqueta','Jaqueta estruturada','streetwear','jacket','jeans'],['bomber','Bomber fechada','alternativo','bomber','sintético'],['esportivo','Esportiva','esportivo','sport','esportivo'],['social','Blazer fechado','social','blazer','formal'],['regata','Regata','casual','tank','malha'],['tricot','Tricô','conforto','knit','malha'],
] as const
const baseVariants = [['','Clássica','clean'],['-faixa','com faixa','stripe'],['-painel','com recortes','panel'],['-zip','com zíper','zip'],['-bolsos','com bolsos','pockets'],['-grafica','estampada','graphic']] as const
export const BASE_CLOTHING: ClothingItem[] = baseFamilies.flatMap(([legacy,label,category,artBase,material]) => baseVariants.map(([suffix,variant,detail], index) => { const id=index===0?legacy:`${legacy}${suffix}`; return { id, value:id, label:`${label} ${variant}`, category, slot:'base', artBase, detail, material } }))

const outerFamilies = [
  ['denim','Jaqueta jeans','streetwear','denim','jeans'],['couro','Jaqueta de couro','alternativo','leather','couro'],['varsity','Jaqueta varsity','streetwear','varsity','moletom'],['corta-vento','Corta-vento','esportivo','wind','sintético'],['cardigan','Cardigan','conforto','cardigan','malha'],['sobretudo','Sobretudo','social','coat','formal'],['camisa-aberta','Camisa aberta','casual','open-shirt','algodão'],['colete','Colete','social','vest','formal'],
] as const
const outerVariants = [['','Essencial','clean'],['-contraste','Contraste','panel'],['-faixas','com faixas','stripe'],['-bolsos','com bolsos','pockets'],['-detalhada','Detalhada','graphic']] as const
export const OUTERWEAR: ClothingItem[] = outerFamilies.flatMap(([root,label,category,artBase,material]) => outerVariants.map(([suffix,variant,detail]) => { const id=`${root}${suffix}`; return { id, value:id, label:`${label} ${variant}`, category, slot:'outer', artBase, detail, material } }))
export const CLOTHING_ITEMS = [...BASE_CLOTHING, ...OUTERWEAR]

export type AccessorySlot = 'head' | 'face' | 'ears' | 'neck'
export interface AccessoryItem { id: string; label: string; slot: AccessorySlot; art: string }
const accessory = (slot: AccessorySlot, entries: [string,string,string][]): AccessoryItem[] => entries.map(([id,label,art]) => ({ id,label,slot,art }))
export const ACCESSORIES: Record<AccessorySlot, AccessoryItem[]> = {
  head: accessory('head', [['none','Nenhum','none'],['bone','Boné','cap'],['gorro','Gorro','beanie'],['bandana','Bandana','bandana'],['tiara','Tiara','headband'],['laco','Laço','bow'],['presilhas','Presilhas','clips'],['bucket','Chapéu bucket','bucket'],['faixa','Faixa esportiva','sport-band']]),
  face: accessory('face', [['none','Nenhum','none'],['oculos-redondo','Óculos redondos','round'],['oculos-quadrado','Óculos quadrados','square'],['oculos-sol','Óculos escuros','sun'],['oculos-gatinho','Óculos gatinho','cat'],['oculos-aviador','Aviador','aviator'],['oculos-colorido','Óculos coloridos','color'],['piercing-nariz','Piercing no nariz','nose'],['piercing-sobrancelha','Piercing na sobrancelha','brow']]),
  ears: accessory('ears', [['none','Nenhum','none'],['brinco-ponto','Brincos ponto','stud'],['argolas','Argolas','hoop'],['brinco-longo','Brincos longos','drop'],['alargador','Alargadores','gauge'],['ear-cuff','Ear cuff','cuff'],['piercing-duplo','Piercing duplo','double'],['brinco-estrela','Brincos estrela','star'],['brinco-perola','Brincos pérola','pearl']]),
  neck: accessory('neck', [['none','Nenhum','none'],['corrente','Corrente','chain'],['colar','Colar pingente','pendant'],['choker','Choker','choker'],['lenco','Lenço','scarf'],['bandana-pescoco','Bandana de pescoço','neck-band'],['gravata','Gravata','tie'],['gravata-borboleta','Gravata borboleta','bow-tie'],['colar-contas','Colar de contas','beads']]),
}

export const OUTFIT_PATTERNS = [{ value: 'none', label: 'Sem estampa' }, { value: 'stripes', label: 'Listras' }, { value: 'checker', label: 'Xadrez' }, { value: 'dots', label: 'Poá' }, { value: 'graphic', label: 'Gráfico' }] as const
