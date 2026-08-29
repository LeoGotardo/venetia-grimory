/** As oito maestrias de arma do PHB 2024. */
export type WeaponMastery =
  | 'Cleave'
  | 'Graze'
  | 'Nick'
  | 'Push'
  | 'Sap'
  | 'Slow'
  | 'Topple'
  | 'Vex'

export interface Weapon {
  item_type: 'arma'
  id: string
  name: string
  category: 'Simples' | 'Marcial' | 'Simple' | 'Martial'
  type: 'Corpo a Corpo' | 'À Distância' | 'Melee' | 'Ranged'
  price: string
  damage: string
  damage_type: string
  weight: string
  properties: string[]
  /** Maestria de arma (PHB 2024). Palavra-chave mantida em inglês nos dois
   *  idiomas: é o identificador da regra, igual ao das opções de classe. */
  mastery: WeaponMastery
  description: string
}

export interface Armor {
  item_type: 'armadura'
  id: string
  name: string
  category: 'Leve' | 'Média' | 'Pesada' | 'Escudo' | 'Light' | 'Medium' | 'Heavy' | 'Shield'
  price: string
  ac: string
  min_strength: number | null
  stealth_disadvantage: boolean
  weight: string
  description: string
}

export interface Tool {
  item_type: 'ferramenta'
  id: string
  name: string
  category:
    | 'Ferramentas de Artesão'
    | 'Utilitário'
    | 'Jogos'
    | 'Instrumento Musical'
    | "Artisan's Tools"
    | 'Utility'
    | 'Gaming Sets'
    | 'Musical Instrument'
  price: string
  weight: string
  description: string
  sale_price?: string
}

export interface EquipmentPack {
  item_type: 'kit'
  id: string
  name: string
  category: 'Pacote de Equipamento' | 'Equipment Pack'
  price: string
  weight: string
  included_items: string[]
  description: string
}

export interface Transport {
  item_type: 'transporte'
  id: string
  name: string
  category:
    | 'Montaria Terrestre'
    | 'Animal de Carga'
    | 'Arreio'
    | 'Acessório'
    | 'Veículo Terrestre'
    | 'Veículo Aquático'
    | 'Land Mount'
    | 'Pack Animal'
    | 'Tack'
    | 'Accessory'
    | 'Land Vehicle'
    | 'Water Vehicle'
  price: string
  weight?: string
  speed?: string
  carry_capacity?: string
  description: string
}

export interface AdventuringGear {
  item_type: 'equipamento'
  id: string
  name: string
  category:
    | 'Equipamento'
    | 'Munição'
    | 'Foco Arcano'
    | 'Foco Druídico'
    | 'Símbolo Sagrado'
    | 'Vestuário'
    | 'Recipiente'
    | 'Gear'
    | 'Ammunition'
    | 'Arcane Focus'
    | 'Druidic Focus'
    | 'Holy Symbol'
    | 'Clothing'
    | 'Container'
  price: string
  weight: string
  description: string
}

export interface MagicItem {
  item_type: 'item_magico'
  id: string
  name: string
  category: string
  rarity:
    | 'Comum'
    | 'Incomum'
    | 'Raro'
    | 'Muito Raro'
    | 'Lendário'
    | 'Artefato'
    | 'Varia'
    | 'Common'
    | 'Uncommon'
    | 'Rare'
    | 'Very Rare'
    | 'Legendary'
    | 'Artifact'
    | 'Varies'
  price: string
  attunement?: boolean
  level?: number
  spell_id?: string
  effect?: string
  description: string
}

export type Item = Weapon | Armor | Tool | EquipmentPack | Transport | MagicItem | AdventuringGear
