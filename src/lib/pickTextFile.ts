/**
 * Abre o seletor de arquivos e devolve o conteúdo como texto, ou `null` se a
 * pessoa cancelar. `application/json` junto do `.json` porque alguns seletores
 * do Android não reconhecem a extensão e deixam o arquivo cinza.
 */
export function pickTextFile(accept = '.json,application/json'): Promise<string | null> {
  return new Promise(resolve => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = accept

    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) return resolve(null)
      const reader = new FileReader()
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : null)
      reader.onerror = () => resolve(null)
      reader.readAsText(file)
    }
    input.addEventListener('cancel', () => resolve(null))

    input.click()
  })
}
