import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useSheetStore } from '../../store/sheetStore'
import { WizardNav } from './WizardNav'
import { formatModifier, ABILITIES, abilityName, calcPrimaryClassLevel, canChooseSubclass } from '../../lib/calculations'

import { getBackgrounds } from '../../data/backgrounds'
import { gameData } from '../../data/rules'

export function Step12Review() {
  const { sheet, sheetId, setStep, saveLocal } = useSheetStore()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const id = sheet.identity

  const charClass = gameData.classes.find(c => c.id === id.class_id)
  const species = gameData.species?.find(e => e.id === id.species_id)
  const backgroundName = getBackgrounds().find(a => a.id === id.background_id)?.name
  const subclass = charClass?.subclasses.find(s => s.id === id.subclass_id)
  const primaryLevel = calcPrimaryClassLevel(id.level, id.multiclasses ?? [])

  function create() {
    saveLocal()
    if (sheetId) navigate(`/ficha/${sheetId}`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-cinzel text-2xl font-bold text-[#F5F0E8] mb-1">{t('step12.heading')}</h2>
        <p className="text-[#A8A09B] text-sm">{t('step12.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[#3D332D] border border-[#B8860B]/30 rounded-lg p-4 space-y-2">
          <h3 className="font-cinzel font-semibold text-[#B8860B]">{t('step12.identity')}</h3>
          <div className="text-sm space-y-1">
            <p><span className="text-[#A8A09B]">{t('step12.labelName')}</span> <span className="text-[#F5F0E8]">{id.character_name ?? '—'}</span></p>
            <p><span className="text-[#A8A09B]">{t('step12.labelLevel')}</span> <span className="text-[#F5F0E8]">{id.level}</span></p>
            <p><span className="text-[#A8A09B]">{t('step12.labelClass')}</span> <span className="text-[#F5F0E8]">{charClass?.name ?? '—'}</span></p>
            <p><span className="text-[#A8A09B]">{t('step12.labelSubclass')}</span> <span className="text-[#F5F0E8]">{subclass?.name ?? (canChooseSubclass(primaryLevel) ? '—' : t('step12.subclassNA'))}</span></p>
            <p><span className="text-[#A8A09B]">{t('step12.labelSpecies')}</span> <span className="text-[#F5F0E8]">{species?.name ?? '—'}</span></p>
            <p><span className="text-[#A8A09B]">{t('step12.labelBackground')}</span> <span className="text-[#F5F0E8]">{backgroundName ?? '—'}</span></p>
            <p>
              <span className="text-[#A8A09B]">{t('step12.labelAlignment')}</span>{' '}
              <span className="text-[#F5F0E8]">
                {id.alignment.ethical === 'Lawful' ? t('common.ethicLawfulAlt') : id.alignment.ethical === 'Neutral' ? t('common.ethicNeutral') : id.alignment.ethical === 'Chaotic' ? t('common.ethicChaotic') : id.alignment.ethical}{' '}
                {id.alignment.moral === 'Good' ? t('common.moralGoodAlt') : id.alignment.moral === 'Neutral' ? t('common.moralNeutral') : id.alignment.moral === 'Evil' ? t('common.moralEvilAlt') : id.alignment.moral}
              </span>
            </p>
          </div>
        </div>

        <div className="bg-[#3D332D] border border-[#B8860B]/30 rounded-lg p-4">
          <h3 className="font-cinzel font-semibold text-[#B8860B] mb-2">{t('step12.sectionAttrs')}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ABILITIES.map(a => {
              const val = sheet.abilities[a].value
              const mod = sheet.abilities[a]._modifier
              return (
                <div key={a} className="text-center">
                  <div className="text-xs text-[#A8A09B]">{abilityName(a, t).slice(0, 3)}</div>
                  <div className="font-cinzel font-bold text-xl text-[#F5F0E8]">{val ?? '—'}</div>
                  <div className={`text-xs font-semibold ${(mod ?? 0) > 0 ? 'text-green-400' : (mod ?? 0) < 0 ? 'text-red-400' : 'text-[#A8A09B]'}`}>
                    {mod !== null ? formatModifier(mod) : ''}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-[#3D332D] border border-[#B8860B]/30 rounded-lg p-4">
          <h3 className="font-cinzel font-semibold text-[#B8860B] mb-2">{t('step12.sectionCombat')}</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <p><span className="text-[#A8A09B]">{t('step12.labelMaxHp')}</span> <span className="text-[#F5F0E8] font-bold">{sheet.combat.hit_points.max ?? '—'}</span></p>
            <p><span className="text-[#A8A09B]">{t('step12.labelAC')}</span> <span className="text-[#F5F0E8] font-bold">{sheet.combat.armor_class.value ?? '—'}</span></p>
            <p><span className="text-[#A8A09B]">{t('step12.labelInit')}</span> <span className="text-[#F5F0E8] font-bold">{sheet.combat.initiative._value !== null ? formatModifier(sheet.combat.initiative._value) : '—'}</span></p>
            <p><span className="text-[#A8A09B]">{t('step12.labelSpeed')}</span> <span className="text-[#F5F0E8] font-bold">{sheet.combat.speed._total_meters ?? '—'}{t('sheet.mUnit')}</span></p>
            <p><span className="text-[#A8A09B]">{t('step12.labelProfBonus')}</span> <span className="text-[#F5F0E8] font-bold">{sheet.combat._proficiency_bonus !== null ? `+${sheet.combat._proficiency_bonus}` : '—'}</span></p>
            <p><span className="text-[#A8A09B]">{t('step12.labelHitDie')}</span> <span className="text-[#F5F0E8] font-bold">{sheet.combat.hit_dice.type ?? '—'}</span></p>
          </div>
        </div>

        <div className="bg-[#3D332D] border border-[#B8860B]/30 rounded-lg p-4">
          <h3 className="font-cinzel font-semibold text-[#B8860B] mb-2">{t('step12.trainedSkills')}</h3>
          <div className="flex flex-wrap gap-1">
            {Object.entries(sheet.skills)
              .filter(([, v]) => v.proficient)
              .map(([skillId]) => {
                const p = gameData.skills.find(p => p.id === skillId)
                return <span key={skillId} className="text-xs bg-[#2D2520] border border-[#B8860B]/20 rounded px-2 py-0.5 text-[#B8860B]">{p?.name ?? skillId}</span>
              })}
          </div>
        </div>
      </div>

      <div className="bg-[#3D332D] border border-[#B8860B]/30 rounded-lg p-4">
        <h3 className="font-cinzel font-semibold text-[#B8860B] mb-2">{t('step12.languages')}</h3>
        <p className="text-sm text-[#F5F0E8]">
          {sheet.proficiencies.languages
            .map(id => [...gameData.languages.common, ...gameData.languages.rare].find(i => i.id === id)?.name ?? id)
            .join(', ') || '—'}
        </p>
      </div>

      <WizardNav
        onBack={() => setStep(12)}
        onNext={create}
        isLast
        nextLabel={t('step12.createChar')}
        nextDisabled={!id.class_id || !id.species_id}
      />
    </div>
  )
}
