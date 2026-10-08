/**
 * Botão voltar do Android. Sem tratamento, o Capacitor fecha a Activity — o app
 * inteiro sai de uma vez. Aqui cada tela e cada sobreposição registra o que o
 * voltar faz enquanto está aberta, e o listener nativo (`BackButtonBridge`) roda
 * só o do topo:
 *
 * - `overlay` (modal, menu, painel inferior, visão da mesa) fecha primeiro;
 * - `page` é o mesmo destino do botão voltar do cabeçalho (inclusive o
 *   "descartar alterações?"), ou um passo atrás no assistente.
 *
 * Dentro da mesma camada vale o mais recente. Sem nenhum registrado, o bridge
 * sobe de rota (`parentPath`) e, na tela inicial, minimiza o app.
 */

export type BackLayer = 'page' | 'overlay'

interface BackEntry {
  layer: BackLayer
  run: () => void
}

const stack: BackEntry[] = []

/** Registra o que o voltar faz; devolve a função que tira o registro. */
export function pushBackHandler(run: () => void, layer: BackLayer = 'overlay'): () => void {
  const entry: BackEntry = { layer, run }
  stack.push(entry)
  return () => {
    const i = stack.indexOf(entry)
    if (i >= 0) stack.splice(i, 1)
  }
}

/**
 * Roda o handler do topo: sobreposições antes da página e, em cada camada, o
 * registrado por último. A camada não depende da ordem de montagem — o efeito de
 * um filho roda antes do da página, e um modal aberto já na montagem ficaria por baixo.
 */
export function runBackHandler(): boolean {
  for (const layer of ['overlay', 'page'] as const) {
    for (let i = stack.length - 1; i >= 0; i--) {
      if (stack[i].layer === layer) {
        stack[i].run()
        return true
      }
    }
  }
  return false
}

/** Tela "acima" de uma rota, para quando não há quem trate o voltar; `null` na tela inicial. */
export function parentPath(pathname: string): string | null {
  const parts = pathname.split('/').filter(Boolean)
  if (parts.length === 0) return null
  if (parts[0] === 'mestre' && parts.length > 1) {
    if (parts[1] === 'campanha' && parts.length > 3) return `/mestre/campanha/${parts[2]}`
    if (parts[1] === 'bestiario' && parts.length > 2) return '/mestre/bestiario'
    return '/mestre'
  }
  return '/'
}
