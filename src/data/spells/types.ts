export interface Spell {
  id: string
  name: string
  level: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
  school: string
  classes: string[]
  concentration?: boolean
  ritual?: boolean
  description?: string
  componentes?: Array<'V' | 'S' | 'M'>
  material?: string
  casting_time?: string
  range?: string
  duration?: string
  damage?: string
  damage_type?: string
  save?: string
}
