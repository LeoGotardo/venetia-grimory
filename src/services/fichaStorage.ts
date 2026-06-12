import type { Ficha } from '../types'
import type { FichaListItem } from '../store/fichaStore'
import { STORAGE_KEY_FICHA_PREFIX, STORAGE_KEY_LISTA } from '../constants'

function buildListItem(id: string, ficha: Ficha): FichaListItem {
  return {
    id,
    nome: ficha.identidade.nome_personagem ?? '',
    classe: ficha.identidade.classe_id ?? '—',
    especie: ficha.identidade.especie_id ?? '—',
    nivel: ficha.identidade.nivel,
    updatedAt: new Date().toISOString(),
  }
}

function lerLista(): FichaListItem[] {
  const raw = localStorage.getItem(STORAGE_KEY_LISTA)
  if (!raw) return []

  try {
    return JSON.parse(raw) as FichaListItem[]
  } catch {
    console.error('[fichaStorage] Lista corrompida, reiniciando.')
    return []
  }
}

function salvarLista(lista: FichaListItem[]): void {
  localStorage.setItem(STORAGE_KEY_LISTA, JSON.stringify(lista))
}

export function salvarFicha(id: string, ficha: Ficha): void {
  localStorage.setItem(`${STORAGE_KEY_FICHA_PREFIX}${id}`, JSON.stringify(ficha))

  const lista = lerLista()
  const idx = lista.findIndex(item => item.id === id)
  const novoItem = buildListItem(id, ficha)

  if (idx >= 0) {
    lista[idx] = novoItem
  } else {
    lista.push(novoItem)
  }

  salvarLista(lista)
}

export function carregarFicha(id: string): Ficha | null {
  const raw = localStorage.getItem(`${STORAGE_KEY_FICHA_PREFIX}${id}`)
  if (!raw) return null

  try {
    return JSON.parse(raw) as Ficha
  } catch {
    console.error(`[fichaStorage] Ficha ${id} corrompida.`)
    return null
  }
}

export function deletarFicha(id: string): void {
  localStorage.removeItem(`${STORAGE_KEY_FICHA_PREFIX}${id}`)
  const lista = lerLista().filter(item => item.id !== id)
  salvarLista(lista)
}

export function listarFichas(): FichaListItem[] {
  return lerLista()
}
