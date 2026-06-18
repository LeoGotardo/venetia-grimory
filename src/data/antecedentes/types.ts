import type { AtributoId } from '../../types/dados'

export interface Antecedente {
  id: string
  nome: string
  atributos_sugeridos: AtributoId[]
  talento: string
  pericias: string[]
  ferramenta: string
  equipamento_inicial: {
    A: string
    B: string
  }
}
