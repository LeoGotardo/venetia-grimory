import i18n from '../i18n'
import type { SrdMonster } from './monsters/types'

export type { SrdMonster } from './monsters/types'

/**
 * Catálogo do SRD 5.2.1 no idioma atual. São ~700 KB por idioma: fica num chunk
 * próprio, carregado só quando o mestre abre o bestiário ou o seletor de monstros.
 */
export async function loadSrdMonsters(language: string = i18n.language): Promise<SrdMonster[]> {
  const parts = language === 'pt'
    ? await Promise.all([
        import('./monsters/pt/cr0-1'), import('./monsters/pt/cr2-5'),
        import('./monsters/pt/cr6-10'), import('./monsters/pt/cr11-30'),
      ])
    : await Promise.all([
        import('./monsters/en/cr0-1'), import('./monsters/en/cr2-5'),
        import('./monsters/en/cr6-10'), import('./monsters/en/cr11-30'),
      ])
  return parts.flatMap(p => p.default)
}
