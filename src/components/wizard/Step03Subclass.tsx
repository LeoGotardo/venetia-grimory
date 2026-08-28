import { useTranslation } from 'react-i18next'
import { useSheetStore } from '../../store/sheetStore'
import { WizardNav } from './WizardNav'
import { Card } from '../ui/Card'
import { gameData } from '../../data/rules'

function hasFightingStyle(classId: string, level: number) {
  if (classId === 'guerreiro') return level >= 1
  if (classId === 'guardiao' || classId === 'paladino') return level >= 2
  return false
}

function hasDivineOrder(classId: string) { return classId === 'clerigo' }
function hasPrimalOrder(classId: string) { return classId === 'druida' }
function hasFavoredEnemy(classId: string) { return classId === 'guardiao' }

export function Step03Subclass() {
  const { sheet, setSubclass, setClassChoices, setStep } = useSheetStore()
  const { t } = useTranslation()
  const level = sheet.identity.level
  const classId = sheet.identity.class_id ?? ''
  const subclassId = sheet.identity.subclass_id
  const cc = sheet.class_features
  const charClass = gameData.classes.find(c => c.id === classId)

  const needsSubclass = level >= 3
  const needsFightingStyle = hasFightingStyle(classId, level)
  const needsDivineOrder = hasDivineOrder(classId)
  const needsPrimalOrder = hasPrimalOrder(classId)
  const needsFavoredEnemy = hasFavoredEnemy(classId)

  const hasAnyChoice = needsFightingStyle || needsDivineOrder || needsPrimalOrder || needsFavoredEnemy

  const allOk =
    (!needsSubclass || !!subclassId) &&
    (!needsFightingStyle || !!cc.fighting_style) &&
    (!needsDivineOrder || !!cc.divine_order) &&
    (!needsPrimalOrder || !!cc.primal_order) &&
    (!needsFavoredEnemy || !!cc.favored_enemy)

  if (!needsSubclass && !hasAnyChoice) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-cinzel text-2xl font-bold text-[#F5F0E8] mb-1">{t('step03.heading')}</h2>
        </div>
        <div className="bg-[#3D332D] border border-[#B8860B]/30 rounded-lg p-6 text-center">
          <div className="text-4xl mb-3">🔒</div>
          <h3 className="font-cinzel text-lg text-[#F5F0E8] mb-2">{t('step03.lockedHeading')}</h3>
          <p className="text-[#A8A09B] text-sm">{t('step03.lockedDesc', { n: level })}</p>
        </div>
        <WizardNav onBack={() => setStep(2)} onNext={() => setStep(4)} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-cinzel text-2xl font-bold text-[#F5F0E8] mb-1">{t('step03.heading')}</h2>
        {needsSubclass && <p className="text-[#A8A09B] text-sm">{t('step03.subtitle', { charClass: charClass?.name })}</p>}
      </div>

      {needsSubclass && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {charClass?.subclasses.map(sub => (
            <Card
              key={sub.id}
              selected={subclassId === sub.id}
              hoverable
              onClick={() => setSubclass(sub.id)}
            >
              <h3 className="font-cinzel font-bold text-[#F5F0E8] mb-1">{sub.name}</h3>
              <p className="text-[#A8A09B] text-xs">{sub.description ?? t('step03.subtitle', { charClass: charClass.name })}</p>
            </Card>
          ))}
        </div>
      )}

      {hasAnyChoice && (
        <div className="space-y-6">
          {needsSubclass && <hr className="border-[#B8860B]/20" />}
          <h3 className="font-cinzel text-lg font-semibold text-[#B8860B]">{t('step03.featuresHeading')}</h3>

          {needsFightingStyle && (
            <ChoiceSection
              heading={t('step03.estiloLutaHeading')}
              selected={cc.fighting_style}
              options={(gameData.fighting_styles ?? []).map(e => ({ id: e.id, name: e.name, description: e.description }))}
              onSelect={id => setClassChoices({ fighting_style: id })}
            />
          )}

          {needsDivineOrder && (
            <ChoiceSection
              heading={t('step03.ordemDivinaHeading')}
              selected={cc.divine_order}
              options={(gameData.divine_orders ?? []).map(o => ({ id: o.id, name: o.name, description: o.description }))}
              onSelect={id => setClassChoices({ divine_order: id })}
            />
          )}

          {needsPrimalOrder && (
            <ChoiceSection
              heading={t('step03.ordemPrimalHeading')}
              selected={cc.primal_order}
              options={(gameData.primal_orders ?? []).map(o => ({ id: o.id, name: o.name, description: o.description }))}
              onSelect={id => setClassChoices({ primal_order: id })}
            />
          )}

          {needsFavoredEnemy && (
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-[#F5F0E8]">{t('step03.inimigoFavoritoHeading')}</p>
                <p className="text-xs text-[#A8A09B] mt-1">{t('step03.inimigoFavoritoHint')}</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(gameData.favored_enemies ?? []).map(inf => (
                  <button
                    key={inf.id}
                    onClick={() => setClassChoices({ favored_enemy: inf.id })}
                    className={`px-3 py-2 rounded border text-sm font-medium transition-colors cursor-pointer text-left
                      ${cc.favored_enemy === inf.id
                        ? 'bg-[#4D2020] border-[#7B1D1D] text-[#F5F0E8]'
                        : 'border-[#B8860B]/30 text-[#A8A09B] hover:bg-[#3D332D] hover:text-[#F5F0E8]'}`}
                  >
                    {inf.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <WizardNav onBack={() => setStep(2)} onNext={() => setStep(4)} nextDisabled={!allOk} />
    </div>
  )
}

interface ChoiceSectionProps {
  heading: string
  selected: string | null
  options: { id: string; name: string; description: string }[]
  onSelect: (id: string) => void
}

function ChoiceSection({ heading, selected, options, onSelect }: ChoiceSectionProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-[#F5F0E8]">{heading}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map(op => (
          <Card
            key={op.id}
            selected={selected === op.id}
            hoverable
            onClick={() => onSelect(op.id)}
          >
            <p className="font-cinzel font-bold text-[#F5F0E8] text-sm mb-1">{op.name}</p>
            <p className="text-[#A8A09B] text-xs leading-relaxed">{op.description}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
