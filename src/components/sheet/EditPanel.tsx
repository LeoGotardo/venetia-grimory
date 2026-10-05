import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSheetStore } from '../../store/sheetStore'
import {
  calcModifier,
  formatModifier,
  ABILITIES,
  abilityName,
  calcPrimaryClassLevel,
  canChooseSubclass,
  calcThirdCasterCantrips,
  calcThirdCasterPreparedSpells,
  calcThirdCasterSlots,
  isCasterClass,
  isThirdCaster,
  spellListForClass,
} from '../../lib/calculations'
import { Input, Textarea } from '../ui/Input'
import Button from '../ui/Button'
import { Badge } from '../ui/Badge'
import type { AbilityId } from '../../types'
import {
  MIN_LEVEL,
  MAX_LEVEL,
  MULTICLASS_PREREQUISITES,
  BACKGROUND_ABILITY_POINTS_TOTAL,
  SPECIES_WITH_ORIGIN_FEAT,
  FEAT_SOURCE_SPECIES,
  FEAT_SOURCE_MANUAL,
} from '../../constants'
import {
  hasFightingStyle,
  hasDivineOrder,
  hasPrimalOrder,
  hasFavoredEnemy,
  hasAnyClassChoice,
} from '../../lib/classChoices'
import type { Attack } from '../../types'
import { getCantripsByClasses, getSpellsByClassesAndLevels, getCantripsByClass, getSpellsByClass } from '../../data/spells'
import { getBackgrounds } from '../../data/backgrounds'
import type { Spell } from '../../data/spells'
import { SpellCard } from '../ui/SpellCard'
import { ItemCard } from '../ui/ItemCard'
import type { ItemDetail } from '../ui/ItemCard'
import { ClassCard } from '../ui/ClassCard'
import { SpeciesCard } from '../ui/SpeciesCard'
import { BackpackSearch } from '../ui/BackpackSearch'
import { FreeCastPicker } from '../ui/FreeCastPicker'
import { gameData, gameDataPt } from '../../data/rules'

const ETHICAL_ALIGNMENTS = ['Lawful', 'Neutral', 'Chaotic'] as const
const MORAL_ALIGNMENTS = ['Good', 'Neutral', 'Evil'] as const
const ABILITY_MAX = 30

const SELECT_BASE = 'w-full bg-[#2D2520] border border-[#B8860B]/30 rounded px-2 py-2 text-[#F5F0E8] text-sm focus:outline-none focus:ring-1 focus:ring-[#B8860B]'
const SECTION_CARD = 'bg-[#3D332D] border border-[#B8860B]/20 rounded-xl p-4 space-y-4'
const SECTION_TITLE = 'font-cinzel font-semibold text-[#B8860B] pb-2 border-b border-[#B8860B]/20'

export function EditPanel() {
  const { t } = useTranslation()
  return (
    <div className="space-y-5">
      <p className="flex items-center gap-1.5 text-xs text-[#A8A09B] bg-[#3D332D] border border-[#B8860B]/20 rounded-lg px-3 py-2 lg:max-w-2xl">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="#B8860B" className="flex-shrink-0"><path d="M12 2l2.4 7.6H22l-6.2 4.5 2.4 7.6L12 17.2l-6.2 4.5 2.4-7.6L2 9.6h7.6z"/></svg>
        {t('edit.autoSave')}
      </p>

      {/* Duas colunas no desktop: quem é o personagem à esquerda, o que ele faz à
          direita. As seções largas (magias, personalidade, mochila) ficam embaixo,
          ocupando a linha inteira, porque precisam da largura toda. */}
      <div className="space-y-5 lg:grid lg:grid-cols-2 lg:gap-5 lg:items-start lg:space-y-0">
        <div className="space-y-5">
          <InfoSection />
          <AppearanceSection />
          <ProgressionSection />
          <MulticlassSection />
          <ClassChoicesSection />
          <FeatsSection />
          <ProficienciesSection />
        </div>
        <div className="space-y-5">
          <AbilitiesSection />
          <MovementSection />
          <ArmorSection />
          <AttacksSection />
          <SkillsSection />
        </div>
      </div>

      <SpellSection />
      <PersonalitySection />
      <BackpackSection />
    </div>
  )
}

function InfoSection() {
  const { sheet, setIdentity } = useSheetStore()
  const { t } = useTranslation()
  const id = sheet.identity

  return (
    <section aria-label={t('edit.basicInfo')} className={SECTION_CARD}>
      <h3 className={SECTION_TITLE}>{t('edit.basicInfo')}</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label={t('edit.charName')}
          value={id.character_name ?? ''}
          onChange={e => setIdentity({ character_name: e.target.value })}
          placeholder={t('edit.charNamePlaceholder')}
        />
        <Input
          label={t('edit.playerName')}
          value={id.player_name ?? ''}
          onChange={e => setIdentity({ player_name: e.target.value })}
          placeholder={t('edit.playerNamePlaceholder')}
        />
        <Input
          label={t('edit.campaign')}
          value={id.campaign ?? ''}
          onChange={e => setIdentity({ campaign: e.target.value })}
          placeholder={t('edit.campaignPlaceholder')}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-[#B8860B] font-medium">{t('edit.ethicalAlignment')}</label>
          <select
            value={id.alignment.ethical ?? ''}
            onChange={e => setIdentity({ alignment: { ...id.alignment, ethical: e.target.value || null } })}
            className={SELECT_BASE}
          >
            <option value="">{t('edit.selectDefault')}</option>
            {ETHICAL_ALIGNMENTS.map(a => (
              <option key={a} value={a}>
                {a === 'Lawful' ? t('common.ethicLawfulAlt') : a === 'Neutral' ? t('common.ethicNeutral') : t('common.ethicChaotic')}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-[#B8860B] font-medium">{t('edit.moralAlignment')}</label>
          <select
            value={id.alignment.moral ?? ''}
            onChange={e => setIdentity({ alignment: { ...id.alignment, moral: e.target.value || null } })}
            className={SELECT_BASE}
          >
            <option value="">{t('edit.selectDefault')}</option>
            {MORAL_ALIGNMENTS.map(a => (
              <option key={a} value={a}>
                {a === 'Good' ? t('common.moralGoodAlt') : a === 'Neutral' ? t('common.moralNeutral') : t('common.moralEvilAlt')}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  )
}

function ProgressionSection() {
  const { sheet, setLevel, setIdentity, setCharClass, setSubclass, setSpecies, setBackground } = useSheetStore()
  const { t } = useTranslation()
  const id = sheet.identity
  const level = id.level
  // Subclasse exige 3 níveis na classe primária, não no nível total
  const primaryLevel = calcPrimaryClassLevel(level, id.multiclasses ?? [])
  const subclassUnlocked = canChooseSubclass(primaryLevel)
  const charClass = gameData.classes.find(c => c.id === id.class_id)
  const species = gameData.species?.find(e => e.id === id.species_id)
  const [showClass, setShowClass] = useState(false)
  const [showSpecies, setShowSpecies] = useState(false)

  return (
    <section aria-label={t('edit.progression')} className={SECTION_CARD}>
      <h3 className={SECTION_TITLE}>{t('edit.progression')}</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Nível */}
        <div className="flex flex-col gap-1">
          <label htmlFor="edit-nivel" className="text-sm text-[#B8860B] font-medium">{t('edit.level')}</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLevel(Math.max(MIN_LEVEL, level - 1))}
              className="w-8 h-8 rounded bg-[#2D2520] border border-[#B8860B]/30 text-[#F5F0E8] font-bold hover:bg-[#4D4037] transition-colors cursor-pointer"
              aria-label={t('edit.decreaseLevel')}
            >−</button>
            <input
              id="edit-nivel"
              type="number"
              min={MIN_LEVEL}
              max={MAX_LEVEL}
              value={level}
              onChange={e => setLevel(Math.max(MIN_LEVEL, Math.min(MAX_LEVEL, Number(e.target.value))))}
              className="w-16 text-center bg-[#2D2520] border border-[#B8860B]/50 rounded py-1 text-[#F5F0E8] font-cinzel font-bold text-xl focus:outline-none focus:ring-1 focus:ring-[#B8860B]"
            />
            <button
              onClick={() => setLevel(Math.min(MAX_LEVEL, level + 1))}
              className="w-8 h-8 rounded bg-[#2D2520] border border-[#B8860B]/30 text-[#F5F0E8] font-bold hover:bg-[#4D4037] transition-colors cursor-pointer"
              aria-label={t('edit.increaseLevel')}
            >+</button>
          </div>
        </div>

        {/* XP */}
        <div className="flex flex-col gap-1">
          <label htmlFor="edit-xp" className="text-sm text-[#B8860B] font-medium">{t('edit.xp')}</label>
          <input
            id="edit-xp"
            type="number"
            min={0}
            value={id.xp}
            onChange={e => setIdentity({ xp: Math.max(0, Number(e.target.value)) })}
            className="bg-[#2D2520] border border-[#B8860B]/30 rounded px-3 py-2 text-[#F5F0E8] text-sm focus:outline-none focus:ring-1 focus:ring-[#B8860B]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Classe */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-[#B8860B] font-medium">{t('edit.class')}</label>
          <div className="flex items-center gap-2">
            <select
              value={id.class_id ?? ''}
              onChange={e => setCharClass(e.target.value)}
              className={SELECT_BASE}
            >
              <option value="">{t('edit.selectClass')}</option>
              {gameData.classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {charClass && (
              <button
                type="button"
                onClick={() => setShowClass(true)}
                aria-label={t('edit.viewDetails', { name: charClass.name })}
                className={DETAIL_BUTTON}
              >
                ℹ
              </button>
            )}
          </div>
        </div>

        {/* Subclasse (somente nível ≥ 3) */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-[#B8860B] font-medium">
            {t('edit.subclass')} {!subclassUnlocked && <span className="text-[#A8A09B] text-xs">({t('edit.subclassSuffix')})</span>}
          </label>
          <select
            value={id.subclass_id ?? ''}
            onChange={e => setSubclass(e.target.value || null)}
            disabled={!id.class_id || !subclassUnlocked}
            className={`${SELECT_BASE} disabled:opacity-40`}
          >
            <option value="">{t('edit.selectClass')}</option>
            {charClass?.subclasses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        {/* Espécie */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-[#B8860B] font-medium">{t('edit.species')}</label>
          <div className="flex items-center gap-2">
            <select
              value={id.species_id ?? ''}
              onChange={e => setSpecies(e.target.value)}
              className={SELECT_BASE}
            >
              <option value="">{t('edit.selectClass')}</option>
              {gameData.species?.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
            {species && (
              <button
                type="button"
                onClick={() => setShowSpecies(true)}
                aria-label={t('edit.viewDetails', { name: species.name })}
                className={DETAIL_BUTTON}
              >
                ℹ
              </button>
            )}
          </div>
        </div>

        {/* Linhagem (se espécie tem linhagens) */}
        {species?.lineages && species.lineages.length > 0 && (
          <div className="flex flex-col gap-1">
            <label className="text-sm text-[#B8860B] font-medium">{t('edit.lineage')}</label>
            <select
              value={id.lineage_id ?? ''}
              onChange={e => setSpecies(id.species_id!, e.target.value || undefined)}
              className={SELECT_BASE}
            >
              <option value="">{t('edit.selectClass')}</option>
              {species.lineages.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
        )}

        {/* Antecedente — passa pela ação completa, que aplica perícias, talento e bônus */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-[#B8860B] font-medium">{t('edit.background')}</label>
          <select
            value={id.background_id ?? ''}
            onChange={e => setBackground(e.target.value, id.background_distribution ?? {})}
            className={SELECT_BASE}
          >
            <option value="">{t('edit.selectClass')}</option>
            {getBackgrounds().map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
      </div>

      {id.background_id && <BackgroundBonusEditor />}

      <ClassCard charClass={showClass ? (charClass ?? null) : null} level={level} onClose={() => setShowClass(false)} />
      <SpeciesCard
        species={showSpecies ? (species ?? null) : null}
        lineageId={id.lineage_id}
        onClose={() => setShowSpecies(false)}
      />
    </section>
  )
}

/**
 * Os +3 pontos de atributo do antecedente: 2+1 em dois atributos, ou 1+1+1 em três.
 * Só grava quando a distribuição fecha os 3 pontos — `setBackground` desfaz a
 * anterior antes de aplicar a nova, e uma distribuição parcial deixaria a ficha
 * com menos pontos do que deveria.
 */
function BackgroundBonusEditor() {
  const { sheet, setBackground } = useSheetStore()
  const { t } = useTranslation()
  const backgroundId = sheet.identity.background_id ?? ''
  const distribution = sheet.identity.background_distribution ?? {}

  const modoSalvo = Object.values(distribution).includes(2) ? '2+1' : '1+1+1'
  const [modo, setModo] = useState<'2+1' | '1+1+1'>(
    Object.keys(distribution).length > 0 ? modoSalvo : '2+1',
  )

  const escolhidos = ABILITIES.filter(a => (distribution[a] ?? 0) > 0)
  const maior = ABILITIES.find(a => distribution[a] === 2) ?? null
  const slots = modo === '2+1' ? [2, 1] : [1, 1, 1]

  function atual(idx: number): AbilityId | '' {
    if (modo === '2+1') return (idx === 0 ? maior : escolhidos.find(a => a !== maior)) ?? ''
    return escolhidos[idx] ?? ''
  }

  function definir(idx: number, ability: AbilityId | '') {
    const proximos = slots.map((_, i) => (i === idx ? ability : atual(i)))
    const nova: Partial<Record<AbilityId, number>> = {}
    proximos.forEach((a, i) => {
      if (!a) return
      nova[a] = (nova[a] ?? 0) + slots[i]
    })
    const total = Object.values(nova).reduce((sum, v) => sum + v, 0)
    // atributo repetido ou distribuição incompleta: espera o resto da escolha
    if (total !== BACKGROUND_ABILITY_POINTS_TOTAL || Object.keys(nova).length !== slots.length) return
    setBackground(backgroundId, nova)
  }

  function trocarModo(novoModo: '2+1' | '1+1+1') {
    setModo(novoModo)
    setBackground(backgroundId, {})
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-[#B8860B] font-medium">{t('edit.backgroundBonus')}</span>
        <div className="flex gap-1">
          {(['2+1', '1+1+1'] as const).map(m => (
            <button
              key={m}
              type="button"
              aria-pressed={modo === m}
              onClick={() => trocarModo(m)}
              className={`px-2 py-0.5 rounded text-xs font-medium border transition-colors cursor-pointer
                ${modo === m
                  ? 'bg-[#B8860B]/20 border-[#B8860B] text-[#D4A017]'
                  : 'border-[#B8860B]/20 text-[#A8A09B] hover:text-[#F5F0E8]'}`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {slots.map((bonus, idx) => (
          <div key={idx} className="flex flex-col gap-1">
            <label className="text-[11px] text-[#A8A09B]">+{bonus}</label>
            <select
              value={atual(idx)}
              onChange={e => definir(idx, (e.target.value || '') as AbilityId | '')}
              className={SELECT_BASE}
            >
              <option value="">{t('edit.selectDefault')}</option>
              {ABILITIES.map(a => <option key={a} value={a}>{abilityName(a, t)}</option>)}
            </select>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Escolhas que a classe concede fora do nível: Estilo de Luta, Ordem Divina/Primal
 * e Inimigo Favorito. O wizard oferece as mesmas no passo 3 — aqui elas podem ser
 * revistas depois, que é o que faltava.
 */
function ClassChoicesSection() {
  const { sheet, setClassChoices } = useSheetStore()
  const { t } = useTranslation()
  const classId = sheet.identity.class_id ?? ''
  const primaryLevel = calcPrimaryClassLevel(sheet.identity.level, sheet.identity.multiclasses ?? [])
  const cc = sheet.class_features

  if (!classId || !hasAnyClassChoice(classId, primaryLevel)) return null

  const escolhas: Array<{
    key: string
    label: string
    value: string | null
    options: Array<{ id: string; name: string }>
    onChange: (id: string | null) => void
  }> = []

  if (hasFightingStyle(classId, primaryLevel)) {
    escolhas.push({
      key: 'fighting_style',
      label: t('edit.fightingStyle'),
      value: cc.fighting_style,
      options: gameData.fighting_styles ?? [],
      onChange: id => setClassChoices({ fighting_style: id }),
    })
  }
  if (hasDivineOrder(classId)) {
    escolhas.push({
      key: 'divine_order',
      label: t('edit.divineOrder'),
      value: cc.divine_order,
      options: gameData.divine_orders ?? [],
      onChange: id => setClassChoices({ divine_order: id }),
    })
  }
  if (hasPrimalOrder(classId)) {
    escolhas.push({
      key: 'primal_order',
      label: t('edit.primalOrder'),
      value: cc.primal_order,
      options: gameData.primal_orders ?? [],
      onChange: id => setClassChoices({ primal_order: id }),
    })
  }
  if (hasFavoredEnemy(classId)) {
    escolhas.push({
      key: 'favored_enemy',
      label: t('edit.favoredEnemy'),
      value: cc.favored_enemy,
      options: gameData.favored_enemies ?? [],
      onChange: id => setClassChoices({ favored_enemy: id }),
    })
  }

  return (
    <section aria-label={t('edit.classChoices')} className={SECTION_CARD}>
      <h3 className={SECTION_TITLE}>{t('edit.classChoices')}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {escolhas.map(e => (
          <div key={e.key} className="flex flex-col gap-1">
            <label className="text-sm text-[#B8860B] font-medium">{e.label}</label>
            <select
              value={e.value ?? ''}
              onChange={ev => e.onChange(ev.target.value || null)}
              className={SELECT_BASE}
            >
              <option value="">{t('edit.selectDefault')}</option>
              {e.options.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </div>
        ))}
      </div>
    </section>
  )
}

/**
 * Talentos adquiridos. Os que vêm do antecedente, da espécie ou de um nível
 * aparecem marcados com a origem; os adicionados aqui à mão cobrem o que a ficha
 * não deriva sozinha. O Humano escolhe o Talento de Origem nesta seção.
 */
function FeatsSection() {
  const { sheet, addFeat, removeFeat, setSpeciesOriginFeat } = useSheetStore()
  const { t } = useTranslation()
  const [novo, setNovo] = useState('')

  const speciesId = sheet.identity.species_id
  const grantsOriginFeat = !!speciesId && SPECIES_WITH_ORIGIN_FEAT.includes(speciesId)
  const speciesFeat = sheet.feats.list.find(f => f.source === FEAT_SOURCE_SPECIES) ?? null

  const catalogo = [...(gameData.origin_feats ?? []), ...(gameData.general_feats ?? [])]
  const disponiveis = catalogo.filter(f => !sheet.feats.list.some(a => a.feat_id === f.id))

  const ORIGIN_LABEL: Record<string, string> = {
    [FEAT_SOURCE_SPECIES]: t('edit.featFromSpecies'),
    [FEAT_SOURCE_MANUAL]: t('edit.featManual'),
  }

  return (
    <section aria-label={t('edit.feats')} className={SECTION_CARD}>
      <h3 className={SECTION_TITLE}>{t('edit.feats')}</h3>

      {grantsOriginFeat && (
        <div className="flex flex-col gap-1">
          <label className="text-sm text-[#B8860B] font-medium">{t('edit.speciesOriginFeat')}</label>
          <select
            value={speciesFeat?.feat_id ?? ''}
            onChange={e => setSpeciesOriginFeat(e.target.value || null)}
            className={SELECT_BASE}
          >
            <option value="">{t('edit.selectDefault')}</option>
            {(gameData.origin_feats ?? []).map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>
      )}

      {sheet.feats.list.length === 0 ? (
        <p className="text-sm text-[#A8A09B]">{t('edit.noFeats')}</p>
      ) : (
        <div className="space-y-1.5">
          {sheet.feats.list.map(feat => (
            <div
              key={feat.feat_id}
              className="flex items-center gap-2 bg-[#2D2520] border border-[#B8860B]/10 rounded-lg px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <div className="text-sm text-[#F5F0E8] truncate">{feat.name}</div>
                <div className="text-[11px] text-[#A8A09B]">
                  {feat.category}
                  {ORIGIN_LABEL[feat.source] ? ` · ${ORIGIN_LABEL[feat.source]}` : ` · ${feat.source}`}
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeFeat(feat.feat_id)}
                aria-label={t('edit.removeFeat', { name: feat.name })}
                className="w-6 h-6 shrink-0 flex items-center justify-center rounded bg-[#3D332D] border border-red-900/20 text-red-500/60 hover:text-red-400 hover:border-red-900/50 transition-colors cursor-pointer text-xs"
              >✕</button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-sm text-[#B8860B] font-medium">{t('edit.addFeat')}</label>
          <select value={novo} onChange={e => setNovo(e.target.value)} className={SELECT_BASE}>
            <option value="">{t('edit.selectDefault')}</option>
            {disponiveis.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </div>
        <Button
          size="sm"
          variant="secondary"
          disabled={!novo}
          onClick={() => { addFeat(novo); setNovo('') }}
        >
          {t('edit.add')}
        </Button>
      </div>
    </section>
  )
}

const ATTACK_TYPES: Attack['type'][] = ['Corpo a Corpo', 'À Distância', 'Magia']

/** Ataques anotados à mão. A ficha guarda o texto; nada aqui é derivado. */
function AttacksSection() {
  const { sheet, addAttack, removeAttack } = useSheetStore()
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [type, setType] = useState<Attack['type']>('Corpo a Corpo')
  const [bonus, setBonus] = useState('')
  const [damage, setDamage] = useState('')
  const [damageType, setDamageType] = useState('')

  function adicionar() {
    if (!name.trim()) return
    addAttack({
      name: name.trim(),
      weapon_id: null,
      type,
      ability_used: null,
      _attack_bonus: bonus.trim() === '' ? null : Number(bonus),
      _damage: damage.trim() || null,
      damage_type: damageType.trim() || null,
      properties: [],
      notes: null,
    })
    setName(''); setBonus(''); setDamage(''); setDamageType('')
  }

  return (
    <section aria-label={t('edit.attacks')} className={SECTION_CARD}>
      <h3 className={SECTION_TITLE}>{t('edit.attacks')}</h3>

      {sheet.combat.attacks.length === 0 ? (
        <p className="text-sm text-[#A8A09B]">{t('edit.noAttacks')}</p>
      ) : (
        <div className="space-y-1.5">
          {sheet.combat.attacks.map((atk, idx) => (
            <div
              key={`${atk.name}-${idx}`}
              className="flex items-center gap-2 bg-[#2D2520] border border-[#B8860B]/10 rounded-lg px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <div className="text-sm text-[#F5F0E8] truncate">{atk.name}</div>
                <div className="text-[11px] text-[#A8A09B]">
                  {atk.type}
                  {atk._attack_bonus !== null ? ` · ${formatModifier(atk._attack_bonus)}` : ''}
                  {atk._damage ? ` · ${atk._damage}${atk.damage_type ? ` ${atk.damage_type}` : ''}` : ''}
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeAttack(idx)}
                aria-label={t('edit.removeAttack', { name: atk.name })}
                className="w-6 h-6 shrink-0 flex items-center justify-center rounded bg-[#3D332D] border border-red-900/20 text-red-500/60 hover:text-red-400 hover:border-red-900/50 transition-colors cursor-pointer text-xs"
              >✕</button>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <Input label={t('edit.attackName')} value={name} onChange={e => setName(e.target.value)} />
        <div className="flex flex-col gap-1">
          <label className="text-sm text-[#B8860B] font-medium">{t('edit.attackType')}</label>
          <select value={type} onChange={e => setType(e.target.value as Attack['type'])} className={SELECT_BASE}>
            {ATTACK_TYPES.map(tp => <option key={tp} value={tp}>{tp}</option>)}
          </select>
        </div>
        <Input label={t('edit.attackBonus')} type="number" value={bonus} onChange={e => setBonus(e.target.value)} />
        <Input label={t('edit.attackDamage')} value={damage} onChange={e => setDamage(e.target.value)} placeholder="1d8+3" />
        <Input label={t('edit.attackDamageType')} value={damageType} onChange={e => setDamageType(e.target.value)} />
        <div className="flex items-end">
          <Button size="sm" variant="secondary" disabled={!name.trim()} onClick={adicionar}>
            {t('edit.add')}
          </Button>
        </div>
      </div>
    </section>
  )
}

function MulticlassSection() {
  const { sheet, addMulticlass, removeMulticlass, setMulticlassLevel, setMulticlassSubclass } = useSheetStore()
  const { t } = useTranslation()
  const id = sheet.identity
  const multiclasses = id.multiclasses ?? []
  const totalLevel = id.level
  const primaryLevel = totalLevel - multiclasses.reduce((s, m) => s + m.level, 0)
  const [addingClass, setAddingClass] = useState(false)

  function checkPrerequisite(classId: string): boolean {
    const prereq = MULTICLASS_PREREQUISITES[classId]
    if (!prereq) return true
    const vals = prereq.abilities.map(a => sheet.abilities[a].value ?? 0)
    return prereq.mode === 'ou' ? vals.some(v => v >= 13) : vals.every(v => v >= 13)
  }

  const availableClasses = gameData.classes.filter(c =>
    c.id !== id.class_id && !multiclasses.some(m => m.class_id === c.id)
  )

  return (
    <section aria-label={t('multiclass.title')} className={SECTION_CARD}>
      <div className="flex items-center justify-between pb-2 border-b border-[#B8860B]/20">
        <h3 className="font-cinzel font-semibold text-[#B8860B]">{t('multiclass.title')}</h3>
        {totalLevel > 1 && !addingClass && (
          <button
            type="button"
            onClick={() => setAddingClass(true)}
            className="text-xs text-[#B8860B] border border-[#B8860B]/40 rounded px-2 py-1 hover:bg-[#B8860B]/10 transition-colors cursor-pointer"
          >
            + {t('multiclass.addClass')}
          </button>
        )}
      </div>

      {/* Classe primária */}
      <div className="flex items-center gap-3 text-sm">
        <span className="text-[#A8A09B] text-xs uppercase tracking-wide min-w-[70px]">{t('multiclass.primaryClass')}</span>
        <span className="text-[#F5F0E8] font-medium flex-1">{gameData.classes.find(c => c.id === id.class_id)?.name ?? '—'}</span>
        <span className="text-[#B8860B] font-cinzel font-bold">{t('multiclass.levelIn', { n: primaryLevel })}</span>
      </div>

      {/* Classes secundárias */}
      {multiclasses.map(m => {
        const c = gameData.classes.find(cc => cc.id === m.class_id)
        const maxNivel = totalLevel - multiclasses.filter(x => x.class_id !== m.class_id).reduce((s, x) => s + x.level, 0) - 1
        return (
          <div key={m.class_id} className="space-y-2 pt-2 border-t border-[#B8860B]/10">
            <div className="flex items-center gap-2">
              <span className="text-[#F5F0E8] font-medium flex-1 text-sm">{c?.name ?? m.class_id}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setMulticlassLevel(m.class_id, m.level - 1)}
                  disabled={m.level <= 1}
                  className="w-6 h-6 rounded bg-[#2D2520] border border-[#B8860B]/20 text-[#F5F0E8] text-xs hover:bg-[#3D332D] disabled:opacity-30 cursor-pointer disabled:cursor-default"
                >−</button>
                <span className="w-6 text-center text-sm font-cinzel font-bold text-[#F5F0E8]">{m.level}</span>
                <button
                  type="button"
                  onClick={() => setMulticlassLevel(m.class_id, m.level + 1)}
                  disabled={m.level >= maxNivel}
                  className="w-6 h-6 rounded bg-[#2D2520] border border-[#B8860B]/20 text-[#F5F0E8] text-xs hover:bg-[#3D332D] disabled:opacity-30 cursor-pointer disabled:cursor-default"
                >+</button>
              </div>
              <button
                type="button"
                onClick={() => removeMulticlass(m.class_id)}
                className="text-[#A8A09B] hover:text-red-400 transition-colors text-sm px-1 cursor-pointer"
                aria-label={t('multiclass.remove')}
              >×</button>
            </div>
            {canChooseSubclass(m.level) && (
              <select
                value={m.subclass_id ?? ''}
                onChange={e => setMulticlassSubclass(m.class_id, e.target.value || null)}
                className={`${SELECT_BASE} text-xs`}
              >
                <option value="">{t('edit.selectClass')}</option>
                {c?.subclasses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            )}
          </div>
        )
      })}

      {/* Seletor para adicionar nova classe */}
      {addingClass && (
        <div className="space-y-2 pt-2 border-t border-[#B8860B]/10">
          <p className="text-xs text-[#A8A09B]">{t('multiclass.selectSecondary')}</p>
          <div className="flex flex-wrap gap-2">
            {availableClasses.map(c => {
              const ok = checkPrerequisite(c.id)
              const prereq = MULTICLASS_PREREQUISITES[c.id]
              return (
                <div key={c.id} className="flex flex-col items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => { addMulticlass(c.id); setAddingClass(false) }}
                    className={[
                      'px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer',
                      ok
                        ? 'border-[#B8860B]/40 text-[#F5F0E8] hover:bg-[#B8860B]/10 hover:border-[#B8860B]'
                        : 'border-red-800/40 text-[#A8A09B]',
                    ].join(' ')}
                  >
                    {c.name}
                  </button>
                  {!ok && prereq && (
                    <span className="text-[9px] text-red-400">
                      {prereq.abilities.join(prereq.mode === 'ou' ? '/' : '+')} 13+
                    </span>
                  )}
                </div>
              )
            })}
          </div>
          <button
            type="button"
            onClick={() => setAddingClass(false)}
            className="text-xs text-[#A8A09B] hover:text-[#F5F0E8] transition-colors cursor-pointer"
          >
            {t('multiclass.cancel')}
          </button>
        </div>
      )}

      {multiclasses.length === 0 && !addingClass && (
        <p className="text-xs text-[#A8A09B]">
          {totalLevel > 1 ? t('multiclass.noSecondary') : t('multiclass.needLevel2')}
        </p>
      )}
    </section>
  )
}

function AbilitiesSection() {
  const { sheet, setAbilities } = useSheetStore()
  const { t } = useTranslation()

  function setAttr(attr: AbilityId, newVal: number) {
    const val = Math.max(1, Math.min(ABILITY_MAX, newVal))
    const current = ABILITIES.reduce(
      (acc, a) => ({ ...acc, [a]: sheet.abilities[a].value ?? 10 }),
      {} as Record<AbilityId, number>,
    )
    setAbilities({ ...current, [attr]: val })
  }

  return (
    <section aria-label={t('edit.attrs')} className={SECTION_CARD}>
      <h3 className={SECTION_TITLE}>{t('edit.attrs')}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {ABILITIES.map(attr => {
          const val = sheet.abilities[attr].value ?? 10
          const mod = calcModifier(val)
          const modPos = mod > 0
          const modNeg = mod < 0

          return (
            <div key={attr} className="flex flex-col gap-1">
              <label htmlFor={`edit-attr-${attr}`} className="text-sm text-[#B8860B] font-medium">
                {abilityName(attr, t)}
              </label>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setAttr(attr, val - 1)}
                  disabled={val <= 1}
                  aria-label={t('edit.decreaseAttr', { attr: abilityName(attr, t) })}
                  className="w-7 h-9 rounded-l bg-[#2D2520] border border-[#B8860B]/30 text-[#F5F0E8] font-bold hover:bg-[#4D4037] disabled:opacity-30 transition-colors cursor-pointer disabled:cursor-default"
                >−</button>
                <input
                  id={`edit-attr-${attr}`}
                  type="number"
                  min={1}
                  max={ABILITY_MAX}
                  value={val}
                  onChange={e => setAttr(attr, Number(e.target.value))}
                  className="w-12 text-center bg-[#2D2520] border-y border-[#B8860B]/30 py-1.5 text-[#F5F0E8] font-cinzel font-bold text-lg focus:outline-none focus:ring-1 focus:ring-[#B8860B]"
                  aria-label={t('edit.attrValue', { attr: abilityName(attr, t) })}
                />
                <button
                  onClick={() => setAttr(attr, val + 1)}
                  disabled={val >= ABILITY_MAX}
                  aria-label={t('edit.increaseAttr', { attr: abilityName(attr, t) })}
                  className="w-7 h-9 rounded-r bg-[#2D2520] border border-[#B8860B]/30 text-[#F5F0E8] font-bold hover:bg-[#4D4037] disabled:opacity-30 transition-colors cursor-pointer disabled:cursor-default"
                >+</button>
                <span
                  className={`ml-1 text-sm font-bold font-cinzel w-9 text-center ${modPos ? 'text-green-400' : modNeg ? 'text-red-400' : 'text-[#A8A09B]'}`}
                  aria-label={t('edit.modifier', { n: formatModifier(mod) })}
                >
                  {formatModifier(mod)}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function ArmorSection() {
  const { sheet, setArmor } = useSheetStore()
  const { t } = useTranslation()
  const [itemInfo, setItemInfo] = useState<ItemDetail | null>(null)
  const armorId = sheet.combat.armor_class.equipped_armor_id
  const currentArmor = gameData.armors?.find(a => a.id === armorId)

  return (
    <section aria-label={t('edit.armor')} className={SECTION_CARD}>
      <h3 className={SECTION_TITLE}>{t('edit.armor')}</h3>
      <div className="flex flex-col gap-2">
        <label className="text-sm text-[#B8860B] font-medium">{t('edit.equippedArmor')}</label>
        <div className="flex gap-2 items-center">
          <select
            value={armorId ?? ''}
            onChange={e => setArmor(e.target.value || null)}
            className={SELECT_BASE}
            aria-label={t('edit.equippedArmor')}
          >
            <option value="">{t('edit.noArmorOption')}</option>
            {gameData.armors?.map(a => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.category} · CA {a.ac})
              </option>
            ))}
          </select>
          {currentArmor && (
            <button
              type="button"
              onClick={() => setItemInfo({ ...currentArmor, _type: 'armadura' })}
              aria-label={t('edit.viewDetails', { name: currentArmor.name })}
              className="w-8 h-8 shrink-0 flex items-center justify-center text-xs text-[#A8A09B] hover:text-[#F5F0E8] border border-[#B8860B]/20 hover:border-[#B8860B]/50 rounded-full transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B]"
            >
              ℹ
            </button>
          )}
        </div>
        {currentArmor && (
          <p className="text-xs text-[#A8A09B]">
            {currentArmor.cost_gp ? `${currentArmor.cost_gp} ${t('bag.gp')} · ` : ''}
            {currentArmor.weight_kg ? `${currentArmor.weight_kg} kg · ` : ''}
            CA {currentArmor.ac}
            {currentArmor.str_requirement ? ` · FOR mín. ${currentArmor.str_requirement}` : ''}
            {currentArmor.stealth_penalty ? ` · ${t('edit.forceStealthPenalty')}` : ''}
          </p>
        )}
      </div>

      {/* Lista de todas as armaduras */}
      <div className="space-y-1 pt-2">
        <p className="text-xs text-[#A8A09B] font-medium uppercase tracking-wide">{t('edit.reference')}</p>
        {gameData.armors?.map(a => (
          <div key={a.id} className="flex items-center justify-between py-1 border-b border-[#B8860B]/10 last:border-0">
            <div>
              <span className="text-sm text-[#F5F0E8]">{a.name}</span>
              <span className="text-xs text-[#A8A09B] ml-2">CA {a.ac} · {a.category}</span>
            </div>
            <button
              type="button"
              onClick={() => setItemInfo({ ...a, _type: 'armadura' })}
              aria-label={t('edit.viewDetails', { name: a.name })}
              className="w-6 h-6 shrink-0 flex items-center justify-center text-[10px] text-[#A8A09B] hover:text-[#F5F0E8] border border-[#B8860B]/20 hover:border-[#B8860B]/50 rounded-full transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B]"
            >
              ℹ
            </button>
          </div>
        ))}
      </div>

      <ItemCard item={itemInfo} onClose={() => setItemInfo(null)} />
    </section>
  )
}

function SkillsSection() {
  const { sheet, setSkills, setExpertise } = useSheetStore()
  const { t } = useTranslation()
  const anteId = sheet.identity.background_id
  const background = getBackgrounds().find(a => a.id === anteId)
  const backgroundSkills = background?.skills ?? []

  function toggleSkill(skillId: string) {
    if (backgroundSkills.includes(skillId)) return
    const current = gameData.skills
      .filter(p => sheet.skills[p.id]?.proficient)
      .map(p => p.id)
    const newList = current.includes(skillId)
      ? current.filter(p => p !== skillId)
      : [...current, skillId]
    setSkills(newList)
  }

  // Especialização exige proficiência: marcar aqui liga a proficiência junto.
  function toggleExpertise(skillId: string) {
    const current = gameData.skills
      .filter(p => sheet.skills[p.id]?.expertise)
      .map(p => p.id)
    const newList = current.includes(skillId)
      ? current.filter(p => p !== skillId)
      : [...current, skillId]
    if (!current.includes(skillId) && !sheet.skills[skillId]?.proficient) toggleSkill(skillId)
    setExpertise(newList)
  }

  // Agrupar por atributo para facilitar leitura
  const atributosUnicos = [...new Set(gameData.skills.map(p => p.ability))]

  return (
    <section aria-label={t('edit.skills')} className={SECTION_CARD}>
      <h3 className={SECTION_TITLE}>
        {t('edit.skills')}
        <span className="ml-2 text-xs font-normal text-[#A8A09B]">
          {t('edit.trainedCount', { n: gameData.skills.filter(p => sheet.skills[p.id]?.proficient).length })}
        </span>
      </h3>

      <div className="space-y-3">
        {atributosUnicos.map(ability => (
          <div key={ability}>
            <div className="text-xs text-[#A8A09B] font-semibold mb-1 uppercase tracking-wide">{ability}</div>
            <div className="space-y-0.5">
              {gameData.skills.filter(p => p.ability === ability).map(p => {
                const partialSheet = sheet.skills[p.id]
                const proficient = partialSheet?.proficient ?? false
                const expertise = partialSheet?.expertise ?? false
                const isBackground = backgroundSkills.includes(p.id)

                return (
                  <label
                    key={p.id}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer select-none transition-colors
                      ${proficient ? 'bg-[#2D2520]' : 'hover:bg-[#2D2520]/50'}
                      ${isBackground ? 'opacity-70' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={proficient}
                      onChange={() => toggleSkill(p.id)}
                      disabled={isBackground}
                      className="w-3.5 h-3.5 accent-[#B8860B] cursor-pointer disabled:cursor-default"
                      aria-label={t('edit.skillProfAriaLabel', { attr: p.name })}
                    />
                    <span className={`text-sm flex-1 ${proficient ? 'text-[#F5F0E8]' : 'text-[#A8A09B]'}`}>
                      {p.name}
                    </span>
                    {isBackground && <Badge variant="gold" className="text-[9px]">{t('edit.backgroundBadge')}</Badge>}
                    <button
                      type="button"
                      onClick={e => { e.preventDefault(); toggleExpertise(p.id) }}
                      aria-pressed={expertise}
                      aria-label={t('edit.expertiseAriaLabel', { attr: p.name })}
                      title={t('edit.expertiseBadge')}
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold border transition-colors cursor-pointer
                        ${expertise
                          ? 'bg-[#4D2020] border-[#7B1D1D] text-[#F5F0E8]'
                          : 'border-[#B8860B]/20 text-[#A8A09B]/60 hover:border-[#B8860B]/50 hover:text-[#F5F0E8]'}`}
                    >
                      {t('edit.expertiseBadge')}
                    </button>
                    {partialSheet?._value !== null && partialSheet?._value !== undefined && (
                      <span className={`text-xs font-bold min-w-[2rem] text-right ${(partialSheet._value) > 0 ? 'text-green-400' : 'text-[#A8A09B]'}`}>
                        {partialSheet._value >= 0 ? `+${partialSheet._value}` : partialSheet._value}
                      </span>
                    )}
                  </label>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function getMaxCirculoNaClasse(classData: { progression: unknown[] } | undefined, level: number): number {
  if (!classData?.progression) return 0
  const idx = Math.max(0, Math.min(level - 1, classData.progression.length - 1))
  const prog = classData.progression[idx] as Record<string, unknown>
  const slots = prog?.slots as Record<string, number> | undefined
  if (!slots) return 0
  return Object.entries(slots)
    .filter(([, v]) => v > 0)
    .reduce((acc, [k]) => Math.max(acc, parseInt(k.replace('c', ''))), 0)
}

/** Maior círculo acessível, cobrindo as subclasses de 1/3 conjurador. */
function getMaxCircle(
  classData: { progression: unknown[] } | undefined,
  level: number,
  subclassId: string | null,
): number {
  if (isThirdCaster(subclassId)) {
    return Object.entries(calcThirdCasterSlots(level))
      .filter(([, v]) => (v ?? 0) > 0)
      .reduce((acc, [k]) => Math.max(acc, parseInt(k.replace('c', ''))), 0)
  }
  return getMaxCirculoNaClasse(classData, level)
}

function SpellSection() {
  const { sheet, updateSpellcasting } = useSheetStore()
  const { t, i18n } = useTranslation()
  const { spellcasting } = sheet
  const [activeSpellLevel, setActiveSpellLevel] = useState(1)
  const [search, setSearch] = useState('')
  const [spellInfo, setSpellInfo] = useState<Spell | null>(null)

  const classId = sheet.identity.class_id ?? ''
  const subclassId = sheet.identity.subclass_id
  const totalLevel = sheet.identity.level
  const multiclasses = useMemo(() => sheet.identity.multiclasses ?? [], [sheet.identity.multiclasses])
  const primaryLevel = totalLevel - multiclasses.reduce((s, m) => s + m.level, 0)

  const charClass = gameData.classes.find(c => c.id === classId)

  // Para cada classe conjuradora do personagem, determina o máximo de círculo acessível
  // (baseado no nível NAQUELA classe, não no total — regra do D&D multiclasse)
  // `classId` é a chave de armazenamento; `spellListId` é a lista do catálogo —
  // diferem no Cavaleiro Místico e no Trapaceiro Arcano, que conjuram da lista de mago.
  const classesParaMagias = useMemo<
    Array<{ classId: string; spellListId: string; maxSpellLevel: number }>
  >(() => {
    const entry = (id: string, sub: string | null, level: number, fallback = 0) => {
      const cd = gameData.classes.find(c => c.id === id)
      const max = getMaxCircle(cd, level, sub)
      return {
        classId: id,
        spellListId: spellListForClass(id, sub),
        maxSpellLevel: max > 0 ? max : fallback,
      }
    }

    if (multiclasses.length === 0) return [entry(classId, subclassId, totalLevel, 9)]

    const result: Array<{ classId: string; spellListId: string; maxSpellLevel: number }> = []
    if (isCasterClass(classId, subclassId)) {
      result.push(entry(classId, subclassId, Math.max(1, primaryLevel), 9))
    }
    for (const m of multiclasses) {
      if (!isCasterClass(m.class_id, m.subclass_id)) continue
      const e = entry(m.class_id, m.subclass_id, m.level)
      if (e.maxSpellLevel > 0) result.push(e)
    }
    if (result.length === 0) result.push(entry(classId, subclassId, totalLevel, 9))
    return result
  }, [classId, subclassId, totalLevel, primaryLevel, multiclasses])

  const allClasseIds = useMemo(() => classesParaMagias.map(c => c.spellListId), [classesParaMagias])

  // Progressão da classe primária no nível relevante (para exibir limites de truques/magias)
  const level = multiclasses.length === 0 ? totalLevel : Math.max(1, primaryLevel)
  const prog = useMemo(() => {
    if (!charClass?.progression) return null
    return (charClass.progression[Math.max(0, level - 1)] ?? charClass.progression[0]) as Record<string, unknown> | null
  }, [charClass, level])

  // eslint-disable-next-line react-hooks/exhaustive-deps -- os getters leem i18n.language na chamada; a dep refaz o memo na troca de idioma
  const availableCantrips = useMemo(() => getCantripsByClasses(allClasseIds), [allClasseIds, i18n.language])
  const availableSpells = useMemo(
    () =>
      getSpellsByClassesAndLevels(
        classesParaMagias.map(c => ({ classId: c.spellListId, maxSpellLevel: c.maxSpellLevel })),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- os getters leem i18n.language na chamada; a dep refaz o memo na troca de idioma
    [classesParaMagias, i18n.language],
  )

  const availableSpellLevels = useMemo(() => {
    const levels = new Set(availableSpells.map(m => m.level))
    return Array.from(levels).sort((a, b) => a - b) as number[]
  }, [availableSpells])

  const truquesFiltrados = useMemo(
    () => availableCantrips.filter(tr => !search || tr.name.toLowerCase().includes(search.toLowerCase())),
    [availableCantrips, search],
  )

  const spellsOfLevel = useMemo(
    () => availableSpells
      .filter(m => m.level === activeSpellLevel)
      .filter(m => !search || m.name.toLowerCase().includes(search.toLowerCase())),
    [availableSpells, activeSpellLevel, search],
  )

  function resolveCasterClass(name: string, isTruque: boolean): string {
    for (const entry of classesParaMagias) {
      const list = isTruque
        ? getCantripsByClass(entry.spellListId)
        : getSpellsByClass(entry.spellListId)
      // A magia é procurada na lista do catálogo, mas guardada sob a classe.
      if (list.some(m => m.name === name)) return entry.classId
    }
    return classesParaMagias[0]?.classId ?? classId
  }

  function toggleCantrip(name: string) {
    const classId = resolveCasterClass(name, true)
    const current = spellcasting.cantrips_by_class[classId] ?? []
    updateSpellcasting({
      cantrips_by_class: {
        ...spellcasting.cantrips_by_class,
        [classId]: current.includes(name) ? current.filter(t => t !== name) : [...current, name],
      },
    })
  }

  function toggleSpell(name: string) {
    const classId = resolveCasterClass(name, false)
    const current = spellcasting.spells_by_class[classId] ?? []
    updateSpellcasting({
      spells_by_class: {
        ...spellcasting.spells_by_class,
        [classId]: current.includes(name) ? current.filter(m => m !== name) : [...current, name],
      },
    })
  }

  const allCantrips = Object.values(spellcasting.cantrips_by_class).flat()
  const allSpells = Object.values(spellcasting.spells_by_class).flat()

  const freeCasts = spellcasting.free_casts ?? []

  if (!spellcasting.spellcaster && freeCasts.length === 0) {
    return (
      <section aria-label={t('edit.magic')} className={SECTION_CARD}>
        <h3 className={SECTION_TITLE}>{t('edit.magic')}</h3>
        <p className="text-sm text-[#A8A09B]">{t('edit.notCaster')}</p>
      </section>
    )
  }

  const maxCantrips = isThirdCaster(subclassId)
    ? calcThirdCasterCantrips(subclassId, level)
    : ((prog?.cantrips as number | undefined) ?? 0)
  const maxSpells = isThirdCaster(subclassId)
    ? calcThirdCasterPreparedSpells(level)
    : ((prog?.prepared_spells as number | undefined) ?? 0)

  return (
    <section aria-label={t('edit.magic')} className={SECTION_CARD}>
      <h3 className={SECTION_TITLE}>{t('edit.magic')}</h3>

      <FreeCastPicker />

      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder={t('edit.searchSpellsPlaceholder')}
        className="w-full bg-[#2D2520] border border-[#B8860B]/30 rounded-lg px-3 py-2 text-[#F5F0E8] text-sm placeholder:text-[#A8A09B] focus:outline-none focus:ring-1 focus:ring-[#B8860B]"
        aria-label={t('edit.searchSpellsAriaLabel')}
      />

      {/* Truques */}
      {availableCantrips.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#B8860B] font-medium">{t('edit.cantrips')}</span>
            {maxCantrips > 0 && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${allCantrips.length >= maxCantrips ? 'bg-[#B8860B]/20 text-[#D4A017]' : 'bg-[#2D2520] text-[#A8A09B]'}`}>
                {allCantrips.length}/{maxCantrips}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {truquesFiltrados.map(tr => {
              const isSelected = allCantrips.includes(tr.name)
              return (
                <div key={tr.id} className="inline-flex items-center">
                  <button
                    type="button"
                    onClick={() => toggleCantrip(tr.name)}
                    aria-pressed={isSelected}
                    className={[
                      'pl-3 pr-2 py-1.5 rounded-l-full border-y border-l text-xs font-medium transition-colors cursor-pointer',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B]',
                      isSelected
                        ? 'bg-[#B8860B]/20 border-[#B8860B] text-[#D4A017]'
                        : 'border-[#B8860B]/30 text-[#A8A09B] hover:border-[#B8860B]/60 hover:text-[#F5F0E8]',
                    ].join(' ')}
                  >
                    {tr.name}
                    {tr.concentration && <span className="ml-1 opacity-60">C</span>}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpellInfo(tr)}
                    aria-label={t('edit.viewDetails', { name: tr.name })}
                    className={[
                      'inline-flex items-center justify-center w-6 py-1.5 rounded-r-full border-y border-r text-[10px] transition-colors cursor-pointer',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B]',
                      isSelected
                        ? 'bg-[#B8860B]/20 border-[#B8860B] text-[#D4A017] hover:bg-[#B8860B]/30'
                        : 'border-[#B8860B]/30 text-[#A8A09B] hover:border-[#B8860B]/60 hover:text-[#F5F0E8]',
                    ].join(' ')}
                  >
                    ℹ
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Magias por círculo */}
      {availableSpellLevels.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#B8860B] font-medium">{t('edit.preparedSpells')}</span>
            {maxSpells > 0 && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${allSpells.length >= maxSpells ? 'bg-[#B8860B]/20 text-[#D4A017]' : 'bg-[#2D2520] text-[#A8A09B]'}`}>
                {allSpells.length}/{maxSpells}
              </span>
            )}
          </div>
          <div className="flex gap-1 overflow-x-auto pb-1" role="tablist">
            {availableSpellLevels.map(c => (
              <button
                key={c}
                role="tab"
                aria-selected={activeSpellLevel === c}
                onClick={() => setActiveSpellLevel(c)}
                className={[
                  'px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B]',
                  activeSpellLevel === c ? 'bg-[#B8860B] text-[#1A1612]' : 'bg-[#2D2520] text-[#A8A09B] hover:text-[#F5F0E8]',
                ].join(' ')}
              >
                {c}º
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2" role="tabpanel">
            {spellsOfLevel.length === 0
              ? <p className="text-xs text-[#A8A09B]">{search ? t('edit.noSpellsFound') : t('edit.noSpellsAvailable')}</p>
              : spellsOfLevel.map(m => {
                  const isSelected = allSpells.includes(m.name)
                  return (
                    <div key={m.id} className="inline-flex items-center">
                      <button
                        type="button"
                        onClick={() => toggleSpell(m.name)}
                        aria-pressed={isSelected}
                        className={[
                          'pl-3 pr-2 py-1.5 rounded-l-full border-y border-l text-xs font-medium transition-colors cursor-pointer',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B]',
                          isSelected
                            ? 'bg-[#7B1D1D]/30 border-[#7B1D1D] text-[#F5F0E8]'
                            : 'border-[#B8860B]/20 text-[#A8A09B] hover:border-[#B8860B]/40 hover:text-[#F5F0E8]',
                        ].join(' ')}
                      >
                        {m.name}
                        {m.concentration && <span className="ml-1 opacity-60">C</span>}
                        {m.ritual && <span className="ml-1 opacity-60">R</span>}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSpellInfo(m)}
                        aria-label={t('edit.viewDetails', { name: m.name })}
                        className={[
                          'inline-flex items-center justify-center w-6 py-1.5 rounded-r-full border-y border-r text-[10px] transition-colors cursor-pointer',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B]',
                          isSelected
                            ? 'bg-[#7B1D1D]/30 border-[#7B1D1D] text-[#F5F0E8] hover:bg-[#7B1D1D]/50'
                            : 'border-[#B8860B]/20 text-[#A8A09B] hover:border-[#B8860B]/40 hover:text-[#F5F0E8]',
                        ].join(' ')}
                      >
                        ℹ
                      </button>
                    </div>
                  )
                })
            }
          </div>
        </div>
      )}

      <SpellCard spellcasting={spellInfo} onClose={() => setSpellInfo(null)} />
    </section>
  )
}

function BackpackSection() {
  const { t } = useTranslation()
  return (
    <section aria-label={t('edit.bag')} className={SECTION_CARD}>
      <h3 className={SECTION_TITLE}>{t('edit.bag')}</h3>
      <BackpackSearch />
    </section>
  )
}

const DETAIL_BUTTON =
  'w-9 h-9 shrink-0 flex items-center justify-center text-xs text-[#A8A09B] hover:text-[#F5F0E8] ' +
  'border border-[#B8860B]/20 hover:border-[#B8860B]/50 rounded-full transition-colors cursor-pointer ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B]'

interface StringListEditorProps {
  label: string
  values: string[]
  placeholder: string
  onChange: (values: string[]) => void
  /**
   * Catálogo para listas guardadas por id (idiomas). Os chips mostram o nome,
   * o datalist oferece nomes e o que é digitado volta a ser id ao ser gravado —
   * o resto do app compara ids, não rótulos traduzidos.
   */
  catalog?: Array<{ id: string; name: string }>
  /** Entradas concedidas por classe/antecedente: exibidas, mas não removíveis. */
  locked?: string[]
}

/**
 * Editor genérico para os campos da ficha guardados como lista de textos
 * (traços, idiomas, proficiências). Adiciona por Enter e remove por chip.
 */
function StringListEditor({ label, values, placeholder, onChange, catalog, locked = [] }: StringListEditorProps) {
  const { t } = useTranslation()
  const [draft, setDraft] = useState('')
  const listId = `list-${label.replace(/\s+/g, '-').toLowerCase()}`

  const displayOf = (value: string) =>
    catalog?.find(o => o.id === value)?.name ?? value

  function add() {
    const typed = draft.trim()
    if (!typed) { setDraft(''); return }
    // Aceita o nome exibido e grava o id correspondente; sem catálogo, texto livre.
    const match = catalog?.find(o => o.name.toLowerCase() === typed.toLowerCase() || o.id === typed)
    const value = match?.id ?? typed
    if (values.includes(value)) { setDraft(''); return }
    onChange([...values, value])
    setDraft('')
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm text-[#B8860B] font-medium">{label}</span>

      <div className="flex flex-wrap gap-1.5">
        {values.length === 0 && <span className="text-xs text-[#A8A09B]">{t('edit.emptyList')}</span>}
        {values.map(v => {
          const isLocked = locked.includes(v)
          return (
            <span
              key={v}
              className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded border ${
                isLocked
                  ? 'bg-[#2D2520] border-[#B8860B]/40 text-[#D4A017]'
                  : 'bg-[#2D2520] border-[#B8860B]/20 text-[#F5F0E8]'
              }`}
            >
              {displayOf(v)}
              {isLocked ? (
                <span className="text-[9px] text-[#A8A09B]">{t('edit.granted')}</span>
              ) : (
                <button
                  type="button"
                  onClick={() => onChange(values.filter(x => x !== v))}
                  aria-label={t('edit.removeEntry', { name: displayOf(v) })}
                  className="text-red-400/70 hover:text-red-300 cursor-pointer focus-visible:outline-none"
                >
                  ×
                </button>
              )}
            </span>
          )
        })}
      </div>

      <div className="flex gap-2">
        <input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          placeholder={placeholder}
          list={catalog ? listId : undefined}
          aria-label={label}
          className="flex-1 bg-[#2D2520] border border-[#B8860B]/30 rounded px-3 py-2 text-[#F5F0E8] text-sm placeholder:text-[#A8A09B] focus:outline-none focus:ring-1 focus:ring-[#B8860B]"
        />
        {catalog && (
          <datalist id={listId}>
            {catalog.map(o => <option key={o.id} value={o.name} />)}
          </datalist>
        )}
        <Button size="sm" variant="secondary" onClick={add} disabled={!draft.trim()}>
          {t('edit.addEntry')}
        </Button>
      </div>
    </div>
  )
}

/** Detalhes físicos — só editáveis no assistente até agora. */
function AppearanceSection() {
  const { sheet, setIdentity, setPersonality } = useSheetStore()
  const { t } = useTranslation()
  const id = sheet.identity

  return (
    <section aria-label={t('edit.appearance')} className={SECTION_CARD}>
      <h3 className={SECTION_TITLE}>{t('edit.appearance')}</h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Input label={t('step11.age')} value={id.age ?? ''} onChange={e => setIdentity({ age: e.target.value })} placeholder={t('step11.agePlaceholder')} />
        <Input label={t('step11.height')} value={id.height ?? ''} onChange={e => setIdentity({ height: e.target.value })} placeholder={t('step11.heightPlaceholder')} />
        <Input label={t('step11.weight')} value={id.weight ?? ''} onChange={e => setIdentity({ weight: e.target.value })} placeholder={t('step11.weightPlaceholder')} />
        <Input label={t('step11.eyes')} value={id.eyes ?? ''} onChange={e => setIdentity({ eyes: e.target.value })} placeholder={t('step11.eyesPlaceholder')} />
        <Input label={t('step11.skin')} value={id.skin ?? ''} onChange={e => setIdentity({ skin: e.target.value })} placeholder={t('step11.skinPlaceholder')} />
        <Input label={t('step11.hair')} value={id.hair ?? ''} onChange={e => setIdentity({ hair: e.target.value })} placeholder={t('step11.hairPlaceholder')} />
      </div>

      <Textarea
        label={t('edit.appearanceDescription')}
        value={sheet.personality.appearance_description ?? ''}
        onChange={e => setPersonality({ appearance_description: e.target.value })}
        placeholder={t('edit.appearanceDescriptionPlaceholder')}
      />
    </section>
  )
}

/**
 * Deslocamento: a base vem da espécie e o bônus de itens ou talentos. O total
 * é derivado, então só estes dois campos são editáveis.
 */
function MovementSection() {
  const { sheet, setSpeed } = useSheetStore()
  const { t } = useTranslation()
  const speed = sheet.combat.speed

  return (
    <section aria-label={t('edit.movement')} className={SECTION_CARD}>
      <h3 className={SECTION_TITLE}>{t('edit.movement')}</h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 items-end">
        <Input
          label={t('edit.baseSpeed')}
          type="number"
          min={0}
          step={0.5}
          value={speed.base_meters ?? ''}
          onChange={e => setSpeed({ base_meters: e.target.value === '' ? null : Math.max(0, Number(e.target.value)) })}
        />
        <Input
          label={t('edit.bonusSpeed')}
          type="number"
          step={0.5}
          value={speed.bonus_meters}
          onChange={e => setSpeed({ bonus_meters: Number(e.target.value) || 0 })}
        />
        <div className="flex flex-col gap-1">
          <span className="text-sm text-[#B8860B] font-medium">{t('combat.speed')}</span>
          <span className="font-cinzel font-bold text-2xl text-[#F5F0E8]">
            {speed._total_meters ?? 0}{t('sheet.mUnit')}
          </span>
        </div>
      </div>
    </section>
  )
}

/** Idiomas e proficiências de armadura, arma e ferramenta. */
function ProficienciesSection() {
  const { sheet, setProficiencies, setLanguages } = useSheetStore()
  const { t } = useTranslation()
  const prof = sheet.proficiencies
  const languageCatalog = [
    ...(gameData.languages?.common ?? []),
    ...(gameData.languages?.rare ?? []),
  ].map(l => ({ id: l.id, name: l.name }))
  // As proficiências são gravadas com as strings canônicas em português
  // (`gameDataPt`), então a trava tem de comparar com elas, não com a tradução.
  const charClassPt = gameDataPt.classes.find(c => c.id === sheet.identity.class_id)

  return (
    <section aria-label={t('edit.proficiencies')} className={SECTION_CARD}>
      <h3 className={SECTION_TITLE}>{t('edit.proficiencies')}</h3>

      <StringListEditor
        label={t('step09.heading')}
        values={prof.languages}
        placeholder={t('edit.addLanguagePlaceholder')}
        catalog={languageCatalog}
        onChange={setLanguages}
      />
      <StringListEditor
        label={t('step02.armors')}
        values={prof.armors}
        placeholder={t('edit.addProficiencyPlaceholder')}
        locked={charClassPt?.armors ?? []}
        onChange={armors => setProficiencies({ armors })}
      />
      <StringListEditor
        label={t('edit.weapons')}
        values={prof.weapons}
        placeholder={t('edit.addProficiencyPlaceholder')}
        locked={charClassPt?.weapons ?? []}
        onChange={weapons => setProficiencies({ weapons })}
      />
      <StringListEditor
        label={t('edit.tools')}
        values={prof.tools}
        placeholder={t('edit.addProficiencyPlaceholder')}
        onChange={tools => setProficiencies({ tools })}
      />
    </section>
  )
}

/** Personalidade e história — antes só editáveis no assistente, ou nem isso. */
function PersonalitySection() {
  const { sheet, setPersonality } = useSheetStore()
  const { t } = useTranslation()
  const p = sheet.personality

  return (
    <section aria-label={t('edit.personality')} className={SECTION_CARD}>
      <h3 className={SECTION_TITLE}>{t('edit.personality')}</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-5 gap-y-4">
        <StringListEditor
          label={t('notes.traits')}
          values={p.traits}
          placeholder={t('step11.trait1Placeholder')}
          onChange={traits => setPersonality({ traits })}
        />
        <StringListEditor
          label={t('notes.ideals')}
          values={p.ideals}
          placeholder={t('step11.idealsPlaceholder')}
          onChange={ideals => setPersonality({ ideals })}
        />
        <StringListEditor
          label={t('notes.bonds')}
          values={p.bonds}
          placeholder={t('step11.bondsPlaceholder')}
          onChange={bonds => setPersonality({ bonds })}
        />
        <StringListEditor
          label={t('notes.flaws')}
          values={p.flaws}
          placeholder={t('step11.flawsPlaceholder')}
          onChange={flaws => setPersonality({ flaws })}
        />
      </div>

      <Textarea
        label={t('notes.backstory')}
        value={p.backstory ?? ''}
        onChange={e => setPersonality({ backstory: e.target.value })}
        placeholder={t('step11.backstoryPlaceholder')}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-5 gap-y-4">
        <Textarea
          label={t('edit.allies')}
          value={p.allies_and_organizations ?? ''}
          onChange={e => setPersonality({ allies_and_organizations: e.target.value })}
          placeholder={t('edit.alliesPlaceholder')}
        />
        <Textarea
          label={t('edit.symbol')}
          value={p.symbol_or_treasure ?? ''}
          onChange={e => setPersonality({ symbol_or_treasure: e.target.value })}
          placeholder={t('edit.symbolPlaceholder')}
        />
      </div>
    </section>
  )
}
