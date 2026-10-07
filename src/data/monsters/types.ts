import type { StatBlock } from '../../types'

/** Monstro do catálogo do SRD 5.2.1 — só leitura; o mestre copia para editar. */
export interface SrdMonster {
  id: string
  statblock: StatBlock
}
