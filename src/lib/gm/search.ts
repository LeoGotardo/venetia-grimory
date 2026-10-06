/** Normaliza para busca: sem acento, minúsculo. "Dragão" acha "dragao". */
export function searchKey(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

export function matchesSearch(text: string, query: string): boolean {
  const q = searchKey(query)
  return q === '' || searchKey(text).includes(q)
}
