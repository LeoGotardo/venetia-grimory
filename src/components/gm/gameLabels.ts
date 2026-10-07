import { gameData } from '../../data/rules'

/** Nomes traduzidos de ids das regras, para os cartões e resumos do mestre. */
export function classLabel(id: string | null): string {
  if (!id) return '—'
  return gameData.classes.find(c => c.id === id)?.name ?? id
}

export function languageLabel(id: string): string {
  const all = [...gameData.languages.common, ...gameData.languages.rare]
  return all.find(l => l.id === id)?.name ?? id
}
