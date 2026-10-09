import type { Combatant } from '../../types'
import type { Cell } from '../../lib/gm/terrain'
import { sizeSquares } from '../../lib/gm/movement'
import { TOKEN_FILL, tokenInitials } from './tokenStyle'

/** O que o token precisa para ser desenhado — serve ao combatente do mestre e ao da mesa transmitida. */
export type TokenLike = Pick<Combatant, 'kind' | 'name' | 'defeated' | 'size'> & {
  hp?: Pick<Combatant['hp'], 'current' | 'max'> | null
}

/** Círculo com a cor do tipo, iniciais, X de derrotado e (para o mestre) a barra de PV. */
export function drawToken(
  ctx: CanvasRenderingContext2D,
  c: TokenLike,
  pos: Cell,
  scale: number,
  o: { active: boolean; selected: boolean; ghost: boolean; showHp: boolean },
) {
  const size = sizeSquares(c) * scale
  const cx = pos.x * scale + size / 2
  const cy = pos.y * scale + size / 2
  const r = size / 2 - Math.max(2, scale * 0.08)

  ctx.globalAlpha = o.ghost ? 0.35 : 1
  ctx.fillStyle = c.defeated ? '#4a4540' : TOKEN_FILL[c.kind]
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fill()
  ctx.lineWidth = o.active ? 3 : o.selected ? 2.5 : 1.5
  ctx.strokeStyle = o.active ? '#D4A017' : o.selected ? '#F5F0E8' : 'rgba(0,0,0,0.6)'
  ctx.stroke()

  // Token pequeno demais (mapa todo enquadrado no celular) fica só com a cor.
  if (r >= 6) {
    ctx.fillStyle = '#fff'
    ctx.font = `700 ${Math.round(r * 0.75)}px Manrope, system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(tokenInitials(c.name), cx, cy + 1, r * 1.8)
  }

  if (c.defeated) {
    ctx.strokeStyle = '#d4564a'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(cx - r * 0.6, cy - r * 0.6)
    ctx.lineTo(cx + r * 0.6, cy + r * 0.6)
    ctx.moveTo(cx + r * 0.6, cy - r * 0.6)
    ctx.lineTo(cx - r * 0.6, cy + r * 0.6)
    ctx.stroke()
  }

  if (o.showHp && c.hp && c.hp.max > 0 && scale >= 14) {
    const w = size * 0.8
    const x = pos.x * scale + (size - w) / 2
    const y = pos.y * scale + size - 4
    ctx.fillStyle = 'rgba(0,0,0,0.7)'
    ctx.fillRect(x, y, w, 3)
    const pct = c.hp.current / c.hp.max
    ctx.fillStyle = pct > 0.5 ? '#6f9f5f' : pct > 0.25 ? '#D4A017' : '#c0473b'
    ctx.fillRect(x, y, w * pct, 3)
  }
  ctx.globalAlpha = 1
}
