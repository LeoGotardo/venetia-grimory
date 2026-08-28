import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSheetStore } from '../../store/sheetStore'
import { calcModifier, formatModifier, ABILITIES, abilityName, calcPrimaryClassLevel, canChooseSubclass } from '../../lib/calculations'
import { Input } from '../ui/Input'
import Button from '../ui/Button'
import { Badge } from '../ui/Badge'
import type { AbilityId } from '../../types'
import { MIN_LEVEL, MAX_LEVEL, MULTICLASS_PREREQUISITES, CASTER_TYPE } from '../../constants'
import { getCantripsByClasses, getSpellsByClassesAndLevels, getCantripsByClass, getSpellsByClass } from '../../data/spells'
import { getBackgrounds } from '../../data/backgrounds'
import type { Spell } from '../../data/spells'
import { SpellCard } from '../ui/SpellCard'
import { ItemCard } from '../ui/ItemCard'
import type { ItemDetail } from '../ui/ItemCard'
import { BackpackSearch } from '../ui/BackpackSearch'
import { gameData } from '../../data/rules'

const ETHICAL_ALIGNMENTS = ['Lawful', 'Neutral', 'Chaotic'] as const
const MORAL_ALIGNMENTS = ['Good', 'Neutral', 'Evil'] as const
const ABILITY_MAX = 30

const SELECT_BASE = 'w-full bg-[#2D2520] border border-[#B8860B]/30 rounded px-2 py-2 text-[#F5F0E8] text-sm focus:outline-none focus:ring-1 focus:ring-[#B8860B]'
const SECTION_CARD = 'bg-[#3D332D] border border-[#B8860B]/20 rounded-xl p-4 space-y-4'
const SECTION_TITLE = 'font-cinzel font-semibold text-[#B8860B] pb-2 border-b border-[#B8860B]/20'

export function EditPanel() {
  const { t } = useTranslation()
  return (
    <div className="space-y-5 max-w-2xl">
      <p className="flex items-center gap-1.5 text-xs text-[#A8A09B] bg-[#3D332D] border border-[#B8860B]/20 rounded-lg px-3 py-2">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="#B8860B" className="flex-shrink-0"><path d="M12 2l2.4 7.6H22l-6.2 4.5 2.4 7.6L12 17.2l-6.2 4.5 2.4-7.6L2 9.6h7.6z"/></svg>
        {t('edit.autoSave')}
      </p>
      <InfoSection />
      <ProgressionSection />
      <MulticlassSection />
      <AbilitiesSection />
      <ArmorSection />
      <SkillsSection />
      <SpellSection />
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
  const { sheet, setLevel, setIdentity, setCharClass, setSubclass, setSpecies, setBackgroundId } = useSheetStore()
  const { t } = useTranslation()
  const id = sheet.identity
  const level = id.level
  // Subclasse exige 3 níveis na classe primária, não no nível total
  const primaryLevel = calcPrimaryClassLevel(level, id.multiclasses ?? [])
  const subclassUnlocked = canChooseSubclass(primaryLevel)
  const charClass = gameData.classes.find(c => c.id === id.class_id)
  const species = gameData.species?.find(e => e.id === id.species_id)

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
          <select
            value={id.class_id ?? ''}
            onChange={e => setCharClass(e.target.value)}
            className={SELECT_BASE}
          >
            <option value="">{t('edit.selectClass')}</option>
            {gameData.classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
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
          <select
            value={id.species_id ?? ''}
            onChange={e => setSpecies(e.target.value)}
            className={SELECT_BASE}
          >
            <option value="">{t('edit.selectClass')}</option>
            {gameData.species?.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
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

        {/* Antecedente */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-[#B8860B] font-medium">{t('edit.background')}</label>
          <select
            value={id.background_id ?? ''}
            onChange={e => setBackgroundId(e.target.value)}
            className={SELECT_BASE}
          >
            <option value="">{t('edit.selectClass')}</option>
            {getBackgrounds().map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
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
  const { sheet, setSkills } = useSheetStore()
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
                    {expertise && <Badge variant="crimson" className="text-[9px]">{t('edit.expertiseBadge')}</Badge>}
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

function SpellSection() {
  const { sheet, updateSpellcasting } = useSheetStore()
  const { t, i18n } = useTranslation()
  const { spellcasting } = sheet
  const [activeSpellLevel, setActiveSpellLevel] = useState(1)
  const [search, setSearch] = useState('')
  const [spellInfo, setSpellInfo] = useState<Spell | null>(null)

  const classId = sheet.identity.class_id ?? ''
  const totalLevel = sheet.identity.level
  const multiclasses = sheet.identity.multiclasses ?? []
  const primaryLevel = totalLevel - multiclasses.reduce((s, m) => s + m.level, 0)

  const charClass = gameData.classes.find(c => c.id === classId)

  // Para cada classe conjuradora do personagem, determina o máximo de círculo acessível
  // (baseado no nível NAQUELA classe, não no total — regra do D&D multiclasse)
  const classesParaMagias = useMemo<Array<{ classId: string; maxSpellLevel: number }>>(() => {
    if (multiclasses.length === 0) {
      const mc = getMaxCirculoNaClasse(charClass, totalLevel)
      return [{ classId, maxSpellLevel: mc > 0 ? mc : 9 }]
    }
    const result: Array<{ classId: string; maxSpellLevel: number }> = []
    if (CASTER_TYPE[classId] != null) {
      const mc = getMaxCirculoNaClasse(charClass, Math.max(1, primaryLevel))
      result.push({ classId, maxSpellLevel: mc > 0 ? mc : 9 })
    }
    for (const m of multiclasses) {
      if (CASTER_TYPE[m.class_id] != null) {
        const mc2 = gameData.classes.find(c => c.id === m.class_id)
        const max = getMaxCirculoNaClasse(mc2, m.level)
        if (max > 0) result.push({ classId: m.class_id, maxSpellLevel: max })
      }
    }
    if (result.length === 0) result.push({ classId, maxSpellLevel: 9 })
    return result
  }, [classId, charClass, totalLevel, primaryLevel, multiclasses])

  const allClasseIds = useMemo(() => classesParaMagias.map(c => c.classId), [classesParaMagias])

  // Progressão da classe primária no nível relevante (para exibir limites de truques/magias)
  const level = multiclasses.length === 0 ? totalLevel : Math.max(1, primaryLevel)
  const prog = useMemo(() => {
    if (!charClass?.progression) return null
    return (charClass.progression[Math.max(0, level - 1)] ?? charClass.progression[0]) as Record<string, unknown> | null
  }, [charClass, level])

  const availableCantrips = useMemo(() => getCantripsByClasses(allClasseIds), [allClasseIds, i18n.language])
  const availableSpells = useMemo(
    () => getSpellsByClassesAndLevels(classesParaMagias),
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
    for (const { classId: classId } of classesParaMagias) {
      const list = isTruque ? getCantripsByClass(classId) : getSpellsByClass(classId)
      if (list.some(m => m.name === name)) return classId
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

  if (!spellcasting.spellcaster) {
    return (
      <section aria-label={t('edit.magic')} className={SECTION_CARD}>
        <h3 className={SECTION_TITLE}>{t('edit.magic')}</h3>
        <p className="text-sm text-[#A8A09B]">{t('edit.notCaster')}</p>
      </section>
    )
  }

  const maxCantrips = (prog?.cantrips as number | undefined) ?? 0
  const maxSpells = (prog?.prepared_spells as number | undefined) ?? 0

  return (
    <section aria-label={t('edit.magic')} className={SECTION_CARD}>
      <h3 className={SECTION_TITLE}>{t('edit.magic')}</h3>

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

