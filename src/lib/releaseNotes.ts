import notes from '../data/releaseNotes.json'
import { RELEASE_NOTES_MAX_SHOWN } from '../constants'
import { versionCodeFromTag } from './appUpdate'

/**
 * Novidades de cada versão, mostradas uma vez na primeira abertura depois de
 * atualizar. As notas moram em `src/data/releaseNotes.json`, a mais nova
 * primeiro: a primeira entrada é a versão deste bundle. `scripts/release.sh`
 * recusa a tag se ela não tiver notas ali e usa o texto como mensagem da tag
 * (que vira a GitHub Release).
 */

export interface ReleaseNote {
  /** Tag da versão, `vX.Y.Z`. */
  version: string
  pt: string[]
  en: string[]
}

export const RELEASE_NOTES: ReleaseNote[] = notes

/** Versão deste bundle: a das notas mais novas. */
export const currentVersion = (): string | null => RELEASE_NOTES[0]?.version ?? null

/**
 * O que mostrar ao abrir. `lastSeen` é a última versão cujas novidades a pessoa
 * já viu. Instalação nova (nada visto e nada salvo) não vê novidades — não há
 * "antes" para comparar. Quem pulou versões vê as que perdeu, até `RELEASE_NOTES_MAX_SHOWN`.
 */
export function notesToShow(lastSeen: string | null, hasSavedData: boolean, all: ReleaseNote[] = RELEASE_NOTES): ReleaseNote[] {
  const latest = all[0]
  if (!latest || lastSeen === latest.version) return []
  if (lastSeen === null && !hasSavedData) return []
  const seenCode = lastSeen === null ? null : versionCodeFromTag(lastSeen)
  if (seenCode === null) return [latest]
  return all
    .filter(note => (versionCodeFromTag(note.version) ?? 0) > seenCode)
    .slice(0, RELEASE_NOTES_MAX_SHOWN)
}

/** Itens no idioma da interface; o que não for inglês cai no português. */
export function noteItems(note: ReleaseNote, language: string): string[] {
  return language.startsWith('en') ? note.en : note.pt
}
