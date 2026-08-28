import { useTranslation } from 'react-i18next'
import { useSheetStore } from '../../store/sheetStore'
import { WizardNav } from './WizardNav'
import { formatModifier } from '../../lib/calculations'
import { gameData } from '../../data/rules'

function expertiseSlots(classId: string | null, level: number): number {
  if (classId === 'ladino') return level >= 6 ? 4 : 2
  if (classId === 'bardo') {
    if (level >= 9) return 4
    if (level >= 2) return 2
  }
  return 0
}

export function Step07Skills() {
  const { sheet, setSkills, setExpertise, setStep } = useSheetStore()
  const { t } = useTranslation()
  const classId = sheet.identity.class_id
  const charClass = gameData.classes.find(c => c.id === classId)
  const backgroundId = sheet.identity.background_id
  const background = gameData.backgrounds?.find(a => a.id === backgroundId)
  const backgroundSkills = background?.skills ?? []

  const maxNum = charClass?.num_skills ?? 2
  const availableForClass = charClass?.available_skills === 'qualquer'
    ? gameData.skills.map(p => p.id)
    : (charClass?.available_skills ?? [])

  const selectedForClass = gameData.skills
    .filter(p => sheet.skills[p.id]?.proficient && !backgroundSkills.includes(p.id))
    .map(p => p.id)

  const expertiseCount = expertiseSlots(classId, sheet.identity.level)
  const proficientIds = gameData.skills
    .filter(p => sheet.skills[p.id]?.proficient)
    .map(p => p.id)
  const expertiseIds = gameData.skills
    .filter(p => sheet.skills[p.id]?.expertise)
    .map(p => p.id)

  function toggleSkill(skillId: string) {
    if (backgroundSkills.includes(skillId)) return
    if (!availableForClass.includes(skillId)) return
    const alreadySelected = selectedForClass.includes(skillId)
    if (!alreadySelected && selectedForClass.length >= maxNum) return
    const newList = alreadySelected
      ? selectedForClass.filter(p => p !== skillId)
      : [...selectedForClass, skillId]
    setSkills([...backgroundSkills, ...newList])
  }

  function toggleExpertise(skillId: string) {
    if (!sheet.skills[skillId]?.proficient) return
    const alreadyExpertise = expertiseIds.includes(skillId)
    if (!alreadyExpertise && expertiseIds.length >= expertiseCount) return
    const nova = alreadyExpertise ? expertiseIds.filter(p => p !== skillId) : [...expertiseIds, skillId]
    setExpertise(nova)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-cinzel text-2xl font-bold text-[#F5F0E8] mb-1">{t('step07.heading')}</h2>
        <p className="text-[#A8A09B] text-sm">
          {t('step07.chooseN', { n: maxNum })}
          {' '}<span className="text-[#B8860B]">{t('step07.selected', { n: selectedForClass.length, max: maxNum })}</span>
        </p>
      </div>

      <div className="space-y-1">
        {gameData.skills.map(p => {
          const partialSheet = sheet.skills[p.id]
          const fromBackground = backgroundSkills.includes(p.id)
          const fromClass = availableForClass.includes(p.id)
          const selected = partialSheet?.proficient
          const mod = partialSheet?._value
          const locked = fromBackground || (!fromClass && !selected)

          return (
            <button
              key={p.id}
              onClick={() => toggleSkill(p.id)}
              disabled={locked}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded text-left transition-all cursor-pointer disabled:cursor-default
                ${selected ? 'bg-[#4D2020] border border-[#7B1D1D]/60' : 'hover:bg-[#3D332D]'}
                ${locked ? 'opacity-50' : ''}`}
            >
              <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${selected ? 'bg-[#7B1D1D] border-[#7B1D1D]' : 'border-[#6B6560]'}`} />
              <div className="flex-1">
                <span className={`text-sm font-medium ${selected ? 'text-[#F5F0E8]' : 'text-[#B8860B]'}`}>{p.name}</span>
                <span className="text-xs text-[#A8A09B] ml-2">({p.ability})</span>
                {fromBackground && <span className="text-xs text-[#B8860B] ml-2">{t('step07.backgroundBadge')}</span>}
              </div>
              <span className={`text-sm font-bold min-w-[3rem] text-right ${(mod ?? 0) >= 3 ? 'text-green-400' : mod && mod > 0 ? 'text-[#F5F0E8]' : 'text-[#A8A09B]'}`}>
                {mod !== null && mod !== undefined ? formatModifier(mod) : '—'}
              </span>
            </button>
          )
        })}
      </div>

      {expertiseCount > 0 && (
        <div className="space-y-3 pt-2 border-t border-[#B8860B]/20">
          <div>
            <p className="text-sm font-semibold text-[#F5F0E8]">{t('step07.especializacaoHeading')}</p>
            <p className="text-xs text-[#A8A09B] mt-1">{t('step07.especializacaoHint', { n: expertiseCount })}</p>
            <p className="text-xs text-[#B8860B] mt-1">{t('step07.especializacaoSelected', { n: expertiseIds.length, max: expertiseCount })}</p>
          </div>
          <div className="space-y-1">
            {proficientIds.map(skillId => {
              const p = gameData.skills.find(x => x.id === skillId)
              if (!p) return null
              const isExpertise = expertiseIds.includes(skillId)
              const locked = !isExpertise && expertiseIds.length >= expertiseCount
              return (
                <button
                  key={skillId}
                  onClick={() => toggleExpertise(skillId)}
                  disabled={locked}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded text-left transition-all cursor-pointer disabled:cursor-default
                    ${isExpertise ? 'bg-[#1a3d2b] border border-green-700/60' : 'hover:bg-[#3D332D]'}
                    ${locked ? 'opacity-40' : ''}`}
                >
                  <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${isExpertise ? 'bg-green-700 border-green-700' : 'border-[#6B6560]'}`} />
                  <span className={`text-sm font-medium ${isExpertise ? 'text-green-300' : 'text-[#B8860B]'}`}>{p.name}</span>
                  {isExpertise && <span className="text-xs text-green-400 ml-auto">{t('step07.expertiseBadge')}</span>}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <WizardNav
        onBack={() => setStep(7)}
        onNext={() => setStep(9)}
        nextDisabled={selectedForClass.length < maxNum || (expertiseCount > 0 && expertiseIds.length < expertiseCount)}
      />
    </div>
  )
}
