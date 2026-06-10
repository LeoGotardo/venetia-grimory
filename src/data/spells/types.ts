export interface Magia {
  id: string
  nome: string
  circulo: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
  escola: string
  classes: string[]
  concentracao?: boolean
  ritual?: boolean
  descricao?: string
  componentes?: Array<'V' | 'S' | 'M'>
  material?: string
  tempo_conjuracao?: string
  alcance?: string
  duracao?: string
  dano?: string
  tipo_dano?: string
  salvaguarda?: string
}
