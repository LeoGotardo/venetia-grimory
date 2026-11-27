import { createAvatar } from '@dicebear/core'
import * as openPeeps from '@dicebear/open-peeps'
import { BALD_HAIR, DRACONIC_ACCESSORIES, PEEPS_ACCESSORIES, PORTRAIT_PALETTES, type Accessory, type Portrait } from './options'

/**
 * Desenha o retrato (viewBox 704×704, o do Open Peeps): o Open Peeps montado pelo
 * DiceBear e as nossas camadas de fantasia por cima, no mesmo traço — preenchimento
 * chapado e contorno de tinta grosso. Recebe um retrato já normalizado: todo texto
 * aqui sai de constantes escolhidas pelos ids, nenhum valor entra cru no SVG.
 *
 * Carregado sob demanda (`usePortraitUrl`): o Open Peeps pesa, e a lista de fichas
 * não precisa dele para abrir.
 */

const INK = '#000'
const ink = (width: number) => `stroke="${INK}" stroke-width="${width}" stroke-linejoin="round" stroke-linecap="round"`
const IVORY = '#F4EEDC'
const GOLD = '#D4A017'

/** Escurece (`f > 0`) ou clareia (`f < 0`) uma cor `#rrggbb`. */
function shade(hex: string, f: number): string {
  const n = parseInt(hex.slice(1), 16)
  const ch = (v: number) => Math.round(f >= 0 ? v * (1 - f) : v + (255 - v) * -f)
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(ch)
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`
}

// As coordenadas abaixo foram medidas sobre o Open Peeps (rosto de três quartos,
// virado para a direita): orelha visível ~(232, 385), olhos ~y 340, boca ~(470, 455).

/** Cobrem a orelha redonda do Open Peeps; no cabelo longo, a ponta sai por cima dele. */
const EARS: Record<Portrait['ears'], (skin: string) => string> = {
  round: () => '',
  pointed: skin => `<path d="M266 350 C232 326 196 288 150 232 C166 300 180 356 198 408 C210 436 236 450 260 440 C264 410 268 380 266 350 Z" fill="${skin}" ${ink(12)}/>`
    + `<path d="M244 384 C226 352 206 320 186 292" fill="none" ${ink(8)}/>`,
  long: skin => `<path d="M266 350 C220 312 160 250 92 160 C120 260 160 350 196 410 C210 436 236 450 260 440 C264 410 268 380 266 350 Z" fill="${skin}" ${ink(12)}/>`
    + `<path d="M242 386 C210 340 170 280 130 222" fill="none" ${ink(8)}/>`,
}

const HORNS: Record<Portrait['horns'], (color: string) => string> = {
  none: () => '',
  nubs: c => `<path d="M318 182 L334 116 L366 172 Z" fill="${c}" ${ink(12)}/><path d="M458 160 L482 100 L506 170 Z" fill="${c}" ${ink(12)}/>`,
  straight: c => `<path d="M300 196 L282 30 L352 168 Z" fill="${c}" ${ink(12)}/><path d="M452 160 L500 8 L508 182 Z" fill="${c}" ${ink(12)}/>`,
  curved: c => `<path d="M332 176 C262 118 168 150 168 242 C168 314 242 334 272 292 C232 292 214 252 236 220 C262 190 304 200 324 216 Z" fill="${c}" ${ink(12)}/>`
    + `<path d="M468 172 C520 108 594 118 604 170 C562 150 522 166 496 198 Z" fill="${c}" ${ink(12)}/>`,
  swept: c => `<path d="M322 182 C272 120 202 80 118 70 C188 112 240 162 286 218 Z" fill="${c}" ${ink(12)}/>`
    + `<path d="M468 166 C500 110 562 70 634 58 C584 100 538 150 506 196 Z" fill="${c}" ${ink(12)}/>`,
}

/** Saem da mandíbula, dos dois lados da boca. */
const TUSKS: Record<Portrait['tusks'], string> = {
  none: '',
  small: `<path d="M432 498 L440 456 L458 498 Z" fill="${IVORY}" ${ink(8)}/><path d="M498 494 L512 452 L522 496 Z" fill="${IVORY}" ${ink(8)}/>`,
  large: `<path d="M428 500 L438 420 L462 500 Z" fill="${IVORY}" ${ink(8)}/><path d="M496 496 L514 414 L526 498 Z" fill="${IVORY}" ${ink(8)}/>`,
}

const MARKINGS: Record<Portrait['markings'], (skin: string) => string> = {
  none: () => '',
  freckles: skin => [[330, 420], [350, 438], [362, 414], [318, 444], [520, 420], [536, 436]]
    .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="${shade(skin, 0.35)}"/>`).join(''),
  scar: () => '<path d="M372 282 L436 404 M386 326 L410 314 M404 362 L428 350" fill="none" stroke="#F2B8A8" stroke-width="10" stroke-linecap="round"/>',
  tattoo: () => '<path d="M300 380 L344 420 L316 472 M378 232 L420 262 L462 232" fill="none" stroke="#24465E" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>',
  warpaint: () => '<path d="M372 372 L444 372 L438 394 L378 394 Z M500 370 L552 370 L548 392 L504 392 Z" fill="#B0302A"/>',
  scales: skin => `<path d="M300 430 a14 14 0 0 1 28 0 a14 14 0 0 1 28 0 M314 458 a14 14 0 0 1 28 0 a14 14 0 0 1 28 0 M372 214 a14 14 0 0 1 28 0 a14 14 0 0 1 28 0 a14 14 0 0 1 28 0" fill="none" stroke="${shade(skin, 0.4)}" stroke-width="7"/>`,
}

/** Acessórios nossos; os do Open Peeps (óculos, tapa-olho) vão dentro dele. */
const OUR_ACCESSORIES: Partial<Record<Accessory, string>> = {
  halo: '<ellipse cx="390" cy="62" rx="160" ry="32" fill="none" stroke="#F3D27A" stroke-width="34" opacity="0.3"/>'
    + '<ellipse cx="390" cy="62" rx="160" ry="32" fill="none" stroke="#F3D27A" stroke-width="14"/>',
  circlet: `<path d="M246 272 C350 236 450 232 552 256" fill="none" stroke="${GOLD}" stroke-width="16" stroke-linecap="round"/>`
    + `<path d="M246 272 C350 236 450 232 552 256" fill="none" stroke="${INK}" stroke-width="4"/><circle cx="420" cy="242" r="16" fill="#4FA3D9" ${ink(6)}/>`,
  earring: `<circle cx="238" cy="452" r="16" fill="none" stroke="${GOLD}" stroke-width="9"/>`,
}

/** Cabeça dracônica, por cima da humana (que fica careca e sem barba por baixo). */
function draconicHead(skin: string, eye: string): string {
  return `<path d="M262 300 L150 236 L218 330 L112 350 L216 392 L132 456 L246 444 Z" fill="${shade(skin, 0.18)}" ${ink(12)}/>`
    + `<path d="M228 330 C218 218 290 136 392 128 C474 122 542 164 562 238 C604 258 654 300 664 352 C672 398 644 432 602 448 C582 494 540 534 480 552 C410 572 328 558 282 512 C242 470 226 410 228 330 Z" fill="${skin}" ${ink(14)}/>`
    + `<path d="M478 330 C546 300 622 318 652 356 C640 410 592 440 524 440 C494 418 476 380 478 330 Z" fill="${shade(skin, -0.2)}"/>`
    + `<path d="M392 300 C420 272 470 272 494 300 C470 322 420 324 392 300 Z" fill="${eye}" ${ink(8)}/><ellipse cx="443" cy="300" rx="6" ry="19" fill="${INK}"/>`
    + `<path d="M376 266 C420 242 472 242 508 262" fill="none" ${ink(13)}/>`
    + `<ellipse cx="616" cy="352" rx="13" ry="8" fill="${INK}"/>`
    + `<path d="M516 470 C560 474 602 458 628 430" fill="none" ${ink(11)}/>`
}

const hex = (color: string) => color.slice(1)
const isPeepsAccessory = (a: Accessory): a is (typeof PEEPS_ACCESSORIES)[number] =>
  (PEEPS_ACCESSORIES as readonly string[]).includes(a)

/*
 * Cor do cabelo e da barba. No Open Peeps o cabelo e o contorno da cabeça são um só
 * caminho preto, então não dá para pintar só o cabelo: o preto do trecho vira a cor
 * e ganha um traço de tinta por cima — linha fina (queixo, orelha) some sob o traço e
 * continua preta, massa de cabelo fica colorida com borda de tinta. A cor de
 * destaque do DiceBear é uma só para cabelo e barba: vai um sentinela e cada trecho
 * troca pela sua. Os marcadores são os grupos que o estilo monta (`@dicebear/open-peeps`
 * 9); se uma versão nova mudar, o retrato sai sem cor e `portrait.test.ts` acusa.
 */
export const PEEPS_MARKERS = {
  head: '<g transform="matrix(.99789 0 0 1 156 62)">',
  face: '<g transform="translate(315 248)">',
  beard: '<g transform="translate(279 400)">',
  mask: '<g transform="translate(179 343)">',
} as const
const CONTRAST_SENTINEL = '010203'

function tint(segment: string, color: string | null, inkWidth: number): string {
  if (!color) return segment
  return segment
    .replaceAll('fill="#000"', `fill="${color}" stroke="${INK}" stroke-width="${inkWidth}" stroke-linejoin="round"`)
    .replaceAll(`fill="#${CONTRAST_SENTINEL}"`, `fill="${color}"`)
}

function tintHairAndBeard(svg: string, hair: string | null, beard: string): string {
  const [h, f, b, m] = [PEEPS_MARKERS.head, PEEPS_MARKERS.face, PEEPS_MARKERS.beard, PEEPS_MARKERS.mask].map(mark => svg.indexOf(mark))
  if (!(h >= 0 && h < f && f < b && b < m)) {
    console.warn('[retrato] O Open Peeps mudou de formato; cabelo e barba ficam na cor original.')
    return svg
  }
  return svg.slice(0, h) + tint(svg.slice(h, f), hair, 12) + svg.slice(f, b) + tint(svg.slice(b, m), beard, 8) + svg.slice(m)
}

export function portraitSvg(p: Portrait): string {
  const pal = PORTRAIT_PALETTES
  const skin = pal.skin[p.skin]
  const draconic = p.head === 'draconic'
  // Na cabeça dracônica só o que fica por cima dela; os óculos e o brinco ficariam escondidos.
  const accessories = draconic ? p.accessories.filter(a => DRACONIC_ACCESSORIES.includes(a)) : p.accessories
  const peepsAccessory = accessories.find(isPeepsAccessory)
  const peep = tintHairAndBeard(createAvatar(openPeeps, {
    seed: 'retrato',
    head: [draconic ? 'noHair1' : p.hair],
    face: [p.face],
    facialHair: [p.beard === 'none' ? 'full' : p.beard],
    facialHairProbability: !draconic && p.beard !== 'none' ? 100 : 0,
    accessories: [peepsAccessory ?? 'glasses'],
    accessoriesProbability: peepsAccessory ? 100 : 0,
    maskProbability: 0,
    skinColor: [hex(skin)],
    headContrastColor: [CONTRAST_SENTINEL],
    clothingColor: [hex(pal.clothes[p.clothes])],
    // Careca: tingir só deixaria um fio colorido dentro do contorno da cabeça.
  }).toString(), BALD_HAIR.includes(p.hair) || draconic ? null : pal.hairColor[p.hairColor], pal.beardColor[p.beardColor]).replace('<svg ', '<svg width="704" height="704" ')

  const layers = [
    `<rect width="704" height="704" fill="${pal.background[p.background]}"/>`,
    peep,
    draconic ? draconicHead(skin, pal.eyeColor[p.eyeColor]) : EARS[p.ears](skin),
    MARKINGS[p.markings](skin),
    draconic ? '' : TUSKS[p.tusks],
    HORNS[p.horns](pal.hornColor[p.hornColor]),
    accessories.map(a => OUR_ACCESSORIES[a] ?? '').join(''),
  ]
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 704 704">${layers.join('')}</svg>`
}

/** Para `<img src>`: a imagem não executa nada e não depende de rede. */
export function portraitDataUrl(p: Portrait): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(portraitSvg(p))}`
}
