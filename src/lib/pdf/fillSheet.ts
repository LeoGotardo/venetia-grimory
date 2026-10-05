import { PDFDocument, PDFName, StandardFonts, rgb } from 'pdf-lib'
import type { PDFFont, PDFPage, PDFTextField } from 'pdf-lib'
import i18n from '../../i18n'
import { FIELDS } from './sheetFields'
import { gameData } from '../../data/rules'
import { getBackgrounds } from '../../data/backgrounds'
import { getItems } from '../../data/items'
import { resolveSpell } from '../../data/spells'
import { ABILITIES, calcPassivePerception, formatModifier } from '../calculations'
import type { CharacterSheet, InventoryItem } from '../../types'

/**
 * `export` preenche tudo e achata o resultado (PDF final, não editável).
 * `print` deixa em branco o que muda em jogo, para ser escrito a lápis, e
 * mantém o formulário editável.
 *
 * O que é "muda em jogo" foi cruzado com três fontes:
 *
 * 1. as regras de 2024 — Descanso Longo devolve todos os PV e **todos** os dados
 *    de vida gastos (mudou em relação a 2014, que devolvia metade), e Descanso
 *    Curto é onde se *gastam* dados de vida;
 * 2. o desenho da própria ficha — só são medidores as caixas que vêm em par
 *    (ATUAL/TEMP · GASTO/max · Total/Gastos), mais SUCESSOS/FALHAS, EXP,
 *    INSPIRAÇÃO HERÓICA e MOEDAS. As demais caixas são valores fixos;
 * 3. as ações do store — o que `longRest`/`shortRest` restauram e o que
 *    `updateHp`, `spendHitDie`, `spendSlot`, `updateCoins` e `addXP`
 *    alteram fora do wizard.
 *
 * Resultado: ficam em branco no modo `print` os PV atual e temporário, os
 * dados de vida gastos, o XP, os espaços de magia gastos e as moedas.
 *
 * Nunca são preenchidos, em modo nenhum, por não existirem no modelo de dados:
 * salvaguardas contra a morte, inspiração heroica e sintonização de itens.
 *
 * As magias das conjurações sem espaço (`spellcasting.free_casts` — Iniciado em
 * Magia e Arcana Mística) entram na lista de magias preparadas, mas o *uso* delas
 * não: a ficha oficial não tem medidor para conjuração sem espaço. O talento em si
 * aparece na lista de talentos.
 *
 * Dos recursos de classe (fúrias, pontos de foco, …) sai só o **máximo**, que é
 * derivado do nível; o valor atual é gasto em jogo e fica de fora.
 */
export type SheetPdfMode = 'print' | 'export'

interface FillValues {
  texts: Array<{ field: string; value: string }>
  marks: string[]
}

const FONT_SIZE = 8
const MIN_FONT_SIZE = 5

const ARMOR_CATEGORIES: Record<keyof typeof FIELDS.armor_training, string[]> = {
  leve: ['leve', 'light'],
  media: ['média', 'media', 'medium'],
  pesada: ['pesada', 'heavy'],
  shields: ['escudo', 'escudos', 'shield', 'shields'],
}

/** Recursos de classe: só o máximo entra na ficha — o atual muda a cada descanso. */
const CLASS_RESOURCES: Array<[keyof ClassResources, string, (r: ClassResources) => number | null]> = [
  ['rages', 'resources.rages', r => r.rages.max],
  ['bardic_inspiration', 'resources.bardicInspiration', r => r.bardic_inspiration.max],
  ['channel_divinity', 'resources.channelDivinity', r => r.channel_divinity.max],
  ['wild_shapes', 'resources.wildShapes', r => r.wild_shapes.max],
  ['sorcery_points', 'resources.sorceryPoints', r => r.sorcery_points.max],
  ['focus_points', 'resources.focusPoints', r => r.focus_points.max],
  ['action_surge', 'resources.actionSurge', r => r.action_surge.uses],
  ['second_wind', 'resources.secondWind', r => r.second_wind.max],
  ['lay_on_hands', 'resources.layOnHands', r => r.lay_on_hands.hp_pool],
]

type ClassResources = CharacterSheet['class_features']['class_resources']

function itemName(item: InventoryItem): string {
  if (item.name) return item.name
  const catalog = getItems().find(i => i.id === item.item_id)
  return catalog?.name ?? item.item_id ?? '?'
}

function buildFillValues(sheet: CharacterSheet, mode: SheetPdfMode): FillValues {
  const texts: FillValues['texts'] = []
  const marks: FillValues['marks'] = []
  const completo = mode === 'export'

  const text = (field: string, value: unknown) => {
    if (value === null || value === undefined || value === '') return
    texts.push({ field, value: String(value) })
  }
  /** Só sai no modo `export`; no modo `print` fica em branco. */
  const volatile = (field: string, value: unknown) => {
    if (completo) text(field, value)
  }
  const mark = (field: string, on: boolean | null | undefined) => {
    if (on) marks.push(field)
  }
  const volatileMark = (fields: readonly string[], quantity: number) => {
    if (!completo) return
    for (const field of fields.slice(0, quantity)) marks.push(field)
  }
  const list = (items: Array<string | null | undefined>) =>
    items.filter(Boolean).join('\n')

  const { identity, combat, spellcasting, inventory, personality, proficiencies } = sheet

  // ---- identidade
  const multiclasses = identity.multiclasses ?? []
  const charClass = gameData.classes.find(c => c.id === identity.class_id)
  const species = gameData.species?.find(e => e.id === identity.species_id)
  const background = getBackgrounds().find(a => a.id === identity.background_id)
  const subclass = charClass?.subclasses.find(s => s.id === identity.subclass_id)
  const primaryLevel = identity.level - multiclasses.reduce((sum, m) => sum + m.level, 0)
  const secondaryClasses = multiclasses.map(m => ({
    charClass: gameData.classes.find(c => c.id === m.class_id),
    level: m.level,
  }))

  text(FIELDS.identity.name, identity.character_name)
  text(FIELDS.identity.source, background?.name)
  text(
    FIELDS.identity.charClass,
    multiclasses.length === 0
      ? charClass?.name
      : [
          `${charClass?.name ?? '?'} ${primaryLevel}`,
          ...secondaryClasses.map(m => `${m.charClass?.name ?? '?'} ${m.level}`),
        ].join(' / '),
  )
  const lineage = species?.lineages?.find(l => l.id === identity.lineage_id)
  text(FIELDS.identity.species, lineage ? `${species?.name} (${lineage.name})` : species?.name)
  text(
    FIELDS.identity.subclass,
    [
      subclass?.name,
      ...multiclasses.map(m => {
        const mc = gameData.classes.find(c => c.id === m.class_id)
        return mc?.subclasses.find(s => s.id === m.subclass_id)?.name
      }),
    ]
      .filter(Boolean)
      .join(' / '),
  )
  text(FIELDS.identity.level, identity.level)
  volatile(FIELDS.identity.exp, identity.xp)

  // ---- combate
  const hitDice = combat.hit_dice
  text(FIELDS.combat.classe_armadura, combat.armor_class.value)
  mark(FIELDS.combat.shield, combat.armor_class.shield_equipped)
  text(FIELDS.combat.pv_maximo, combat.hit_points.max)
  volatile(FIELDS.combat.pv_atual, combat.hit_points.current)
  volatile(FIELDS.combat.pv_temporario, combat.hit_points.temporary || null)
  text(
    FIELDS.combat.dados_vida_maximo,
    hitDice.total ? `${hitDice.total}${hitDice.type ?? ''}` : null,
  )
  volatile(FIELDS.combat.dados_vida_gastos, hitDice.spent || null)
  text(FIELDS.combat.bonus_proficiencia, formatModifier(combat._proficiency_bonus))
  text(FIELDS.combat.initiative, formatModifier(combat.initiative._value))
  text(
    FIELDS.combat.speed,
    combat.speed._total_meters ? `${combat.speed._total_meters} m` : null,
  )
  text(FIELDS.combat.size, species?.size)
  text(
    FIELDS.combat.percepcao_passiva,
    calcPassivePerception(sheet.skills.percepcao?._value ?? 0),
  )

  // ---- atributos, salvaguardas e perícias
  for (const ability of ABILITIES) {
    const fields = FIELDS.abilities[ability]
    const save = combat.saves[ability]
    text(fields.modificador, formatModifier(sheet.abilities[ability]._modifier))
    text(fields.value, sheet.abilities[ability].value)
    text(fields.save, formatModifier(save?._value ?? null))
    mark(fields.salvaguarda_proficiencia, save?.proficient)
  }

  for (const [id, fields] of Object.entries(FIELDS.skills)) {
    const skill = sheet.skills[id]
    if (!skill) continue
    text(fields.bonus, formatModifier(skill._value))
    mark(fields.proficiencia, skill.proficient || skill.expertise)
  }

  // ---- ataques (a ficha tem 6 linhas)
  combat.attacks.slice(0, FIELDS.attacks.length).forEach((attack, i) => {
    const linha = FIELDS.attacks[i]
    text(linha.name, attack.name)
    text(linha.bonus, formatModifier(attack._attack_bonus))
    text(linha.damage, [attack._damage, attack.damage_type].filter(Boolean).join(' '))
    text(linha.anotacoes, attack.notes)
  })

  // ---- características, talentos e proficiências
  const resources = sheet.class_features.class_resources
  const caracteristicas = [
    ...sheet.class_features.active.map(c => c.name),
    ...CLASS_RESOURCES.flatMap(([, key, max]) => {
      const total = max(resources)
      return total ? [`${i18n.t(key)}: ${total}`] : []
    }),
  ]
  const meio = Math.ceil(caracteristicas.length / 2)
  text(FIELDS.texts.caracteristicas_classe_esquerda, list(caracteristicas.slice(0, meio)))
  text(FIELDS.texts.caracteristicas_classe_direita, list(caracteristicas.slice(meio)))
  text(
    FIELDS.texts.caracteristicas_especie,
    list(sheet.species_traits.active_traits.map(t => t.name)),
  )
  text(FIELDS.texts.feats, list(sheet.feats.list.map(t => t.name)))
  text(FIELDS.texts.proficiencia_armas, proficiencies.weapons.join(', '))
  text(FIELDS.texts.proficiencia_ferramentas, proficiencies.tools.join(', '))

  const armors = proficiencies.armors.map(a => a.toLowerCase())
  for (const [category, field] of Object.entries(FIELDS.armor_training)) {
    const nomes = ARMOR_CATEGORIES[category as keyof typeof FIELDS.armor_training]
    mark(field, armors.some(a => nomes.includes(a)))
  }

  // ---- magia
  // Iniciado em Magia dá magias a quem não tem classe conjuradora — daí o `||`.
  if (spellcasting.spellcaster || spellcasting.free_casts.length > 0) {
    const ability = spellcasting.spellcasting_ability
    // no idioma da interface, para casar com o modelo escolhido
    text(FIELDS.spellcasting.spellcasting_ability, ability ? i18n.t(`attrs.${ability}`) : null)
    text(
      FIELDS.spellcasting.modificador_conjuracao,
      ability ? formatModifier(sheet.abilities[ability]._modifier) : null,
    )
    text(FIELDS.spellcasting.cd_magia, spellcasting._spell_dc)
    text(FIELDS.spellcasting.bonus_ataque_magia, formatModifier(spellcasting._spell_attack_bonus))

    // A ficha oficial tem uma única fileira por círculo, então os espaços de Magia
    // de Pacto entram somados na fileira do círculo deles — é o que o jogador
    // escreveria à mão. No app as duas reservas continuam separadas.
    FIELDS.spell_slots.forEach((celula, i) => {
      const level = i + 1
      const slot = spellcasting.spell_slots[`c${level}` as keyof typeof spellcasting.spell_slots]
      const pact = spellcasting.pact_slots.level === level ? spellcasting.pact_slots : null
      const max = (slot?.max ?? 0) + (pact?.max ?? 0)
      if (!max) return
      text(celula.total, max)
      volatileMark(celula.spent, (slot?.spent ?? 0) + (pact?.spent ?? 0))
    })

    const nomesDeMagias = [
      ...Object.values(spellcasting.cantrips_by_class).flat(),
      ...Object.values(spellcasting.spells_by_class).flat(),
      // Iniciado em Magia e Arcana Mística: sempre preparadas, mas não vêm de
      // nenhuma classe do personagem, então não estão nos mapas acima.
      ...spellcasting.free_casts.flatMap(c => [...c.cantrips, ...(c.spell ? [c.spell] : [])]),
    ]
    const preparadas = [...new Set(nomesDeMagias)]
      .map(name => resolveSpell(name))
      .filter((m): m is NonNullable<typeof m> => m !== null)
      .sort((a, b) => a.level - b.level || a.name.localeCompare(b.name))

    preparadas.slice(0, FIELDS.spells.length).forEach((m, i) => {
      const linha = FIELDS.spells[i]
      text(linha.level, m.level)
      text(linha.name, m.name)
      text(linha.casting_time, m.casting_time)
      text(linha.range, m.range)
      mark(linha.concentration, m.concentration)
      mark(linha.ritual, m.ritual)
      mark(linha.material, m.componentes?.includes('M'))
      text(linha.anotacoes, [m.damage, m.damage_type].filter(Boolean).join(' ') || m.duration)
    })
  }

  // ---- inventário e perfil
  text(
    FIELDS.profile.equipment,
    list(
      inventory.items.map(item =>
        item.quantity > 1 ? `${item.quantity}× ${itemName(item)}` : itemName(item),
      ),
    ),
  )
  for (const [coin, field] of Object.entries(FIELDS.coins)) {
    volatile(field, inventory.coins[coin as keyof typeof inventory.coins] || null)
  }

  text(FIELDS.profile.appearance, personality.appearance_description)
  text(
    FIELDS.profile.personality_backstory,
    list([
      personality.backstory,
      ...personality.traits,
      ...personality.ideals,
      ...personality.bonds,
      ...personality.flaws,
    ]),
  )
  text(
    FIELDS.profile.alignment,
    [identity.alignment.ethical, identity.alignment.moral].filter(Boolean).join(' '),
  )
  text(FIELDS.profile.languages, proficiencies.languages.join(', '))

  return { texts, marks }
}

/**
 * As caixas de seleção do modelo têm aparência quebrada (o estado marcado
 * desenha um glifo numa fonte que o widget não declara), então o ponto é
 * desenhado direto na página em vez de usar `check()`.
 */
function drawMarks(pdf: PDFDocument, marks: string[], flatten: boolean) {
  const form = pdf.getForm()
  const pages = pdf.getPages()
  const widgetPage = new Map<string, PDFPage>()
  pages.forEach(page => {
    const annots = page.node.Annots()
    if (!annots) return
    for (let i = 0; i < annots.size(); i++) widgetPage.set(annots.get(i).toString(), page)
  })

  for (const name of marks) {
    const checkbox = form.getCheckBox(name)
    for (const widget of checkbox.acroField.getWidgets()) {
      const rect = widget.getRectangle()
      const page = widgetPage.get(pdf.context.getObjectRef(widget.dict)?.toString() ?? '')
      page?.drawCircle({
        x: rect.x + rect.width / 2,
        y: rect.y + rect.height / 2,
        size: Math.min(rect.width, rect.height) * 0.38,
        color: rgb(0.1, 0.1, 0.1),
      })
    }
  }

  // O achatamento herda a aparência quebrada das caixas; como as marcas já
  // foram desenhadas, os campos podem sair do documento.
  if (flatten) {
    for (const field of form.getFields()) {
      if (field.constructor.name === 'PDFCheckBox') form.removeField(field)
    }
  }
}

/** O modelo fixa 8pt; em campo estreito o texto é reduzido para não sair cortado. */
function fitFontSize(field: PDFTextField, value: string, font: PDFFont) {
  const widget = field.acroField.getWidgets()[0]
  if (!widget) return
  const available = widget.getRectangle().width - 4
  const required = font.widthOfTextAtSize(value, FONT_SIZE)
  if (required <= available) return
  const proporcional = (FONT_SIZE * available) / required
  field.setFontSize(Math.max(MIN_FONT_SIZE, Math.floor(proporcional * 10) / 10))
  // Cada widget do modelo traz um /DA próprio, que venceria o do campo.
  for (const w of field.acroField.getWidgets()) w.dict.delete(PDFName.of('DA'))
}

/** Preenche o modelo oficial com os dados da ficha e devolve o PDF resultante. */
export async function fillSheetPdf(
  sheet: CharacterSheet,
  mode: SheetPdfMode,
  template: ArrayBuffer,
): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(template)
  const form = pdf.getForm()
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const { texts, marks } = buildFillValues(sheet, mode)

  for (const { field, value } of texts) {
    const textField = form.getTextField(field)
    textField.setText(value)
    if (!textField.isMultiline()) fitFontSize(textField, value, font)
  }
  form.updateFieldAppearances(font)

  const flatten = mode === 'export'
  drawMarks(pdf, marks, flatten)
  if (flatten) form.flatten()

  return pdf.save()
}
