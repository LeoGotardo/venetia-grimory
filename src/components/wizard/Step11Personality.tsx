import { useTranslation } from 'react-i18next'
import { useSheetStore } from '../../store/sheetStore'
import { WizardNav } from './WizardNav'
import { Input, Textarea } from '../ui/Input'

const ETHICAL_ALIGNMENTS = ['Lawful', 'Neutral', 'Chaotic'] as const
const MORAL_ALIGNMENTS = ['Good', 'Neutral', 'Evil'] as const

export function Step11Personality() {
  const { sheet, setPersonality, setIdentity, setStep } = useSheetStore()
  const { t } = useTranslation()
  const p = sheet.personality
  const alignment = sheet.identity.alignment

  function setTrait(key: keyof typeof p, idx: number, val: string) {
    const arr = [...(p[key] as string[])]
    arr[idx] = val
    setPersonality({ [key]: arr } as never)
  }

  const getEthicLabel = (ethical: string) => {
    switch (ethical) {
      case 'Lawful': return t('common.ethicLawful')
      case 'Neutral': return t('common.ethicNeutral')
      case 'Chaotic': return t('common.ethicChaotic')
      default: return ethical
    }
  }

  const getMoralLabel = (moral: string) => {
    switch (moral) {
      case 'Good': return t('common.moralGood')
      case 'Neutral': return t('common.moralNeutral')
      case 'Evil': return t('common.moralEvil')
      default: return moral
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-cinzel text-2xl font-bold text-[#F5F0E8] mb-1">{t('step11.heading')}</h2>
        <p className="text-[#A8A09B] text-sm">{t('step11.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label={t('step11.charName')}
          value={sheet.identity.character_name ?? ''}
          onChange={e => setIdentity({ character_name: e.target.value })}
          placeholder={t('step11.charNamePlaceholder')}
        />
        <Input
          label={t('step11.playerName')}
          value={sheet.identity.player_name ?? ''}
          onChange={e => setIdentity({ player_name: e.target.value })}
          placeholder={t('step11.playerNamePlaceholder')}
        />
      </div>

      <div>
        <label className="text-sm text-[#B8860B] font-medium block mb-2">{t('step11.alignment')}</label>
        <div className="grid grid-cols-3 gap-1 w-full max-w-xs">
          {MORAL_ALIGNMENTS.map(moral => (
            ETHICAL_ALIGNMENTS.map(ethical => (
              <button
                key={`${ethical}-${moral}`}
                onClick={() => setIdentity({ alignment: { ethical, moral } })}
                className={`py-2 px-1 rounded text-xs font-medium border transition-colors cursor-pointer
                  ${alignment.ethical === ethical && alignment.moral === moral
                    ? 'bg-[#7B1D1D] border-[#7B1D1D] text-white'
                    : 'border-[#B8860B]/20 text-[#A8A09B] hover:bg-[#3D332D] hover:text-[#F5F0E8]'}`}
              >
                {getEthicLabel(ethical)} {getMoralLabel(moral)}
              </button>
            ))
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Textarea
          label={t('step11.trait1')}
          value={p.traits[0] ?? ''}
          onChange={e => setTrait('traits', 0, e.target.value)}
          placeholder={t('step11.trait1Placeholder')}
        />
        <Textarea
          label={t('step11.trait2')}
          value={p.traits[1] ?? ''}
          onChange={e => setTrait('traits', 1, e.target.value)}
          placeholder={t('step11.trait2Placeholder')}
        />
        <Textarea
          label={t('step11.ideals')}
          value={p.ideals[0] ?? ''}
          onChange={e => setPersonality({ ideals: [e.target.value] })}
          placeholder={t('step11.idealsPlaceholder')}
        />
        <Textarea
          label={t('step11.bonds')}
          value={p.bonds[0] ?? ''}
          onChange={e => setPersonality({ bonds: [e.target.value] })}
          placeholder={t('step11.bondsPlaceholder')}
        />
        <Textarea
          label={t('step11.flaws')}
          value={p.flaws[0] ?? ''}
          onChange={e => setPersonality({ flaws: [e.target.value] })}
          placeholder={t('step11.flawsPlaceholder')}
        />
        <Textarea
          label={t('step11.backstory')}
          value={p.backstory ?? ''}
          onChange={e => setPersonality({ backstory: e.target.value })}
          placeholder={t('step11.backstoryPlaceholder')}
          className="min-h-[120px]"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Input label={t('step11.age')} value={sheet.identity.age ?? ''} onChange={e => setIdentity({ age: e.target.value })} placeholder={t('step11.agePlaceholder')} />
        <Input label={t('step11.height')} value={sheet.identity.height ?? ''} onChange={e => setIdentity({ height: e.target.value })} placeholder={t('step11.heightPlaceholder')} />
        <Input label={t('step11.weight')} value={sheet.identity.weight ?? ''} onChange={e => setIdentity({ weight: e.target.value })} placeholder={t('step11.weightPlaceholder')} />
        <Input label={t('step11.eyes')} value={sheet.identity.eyes ?? ''} onChange={e => setIdentity({ eyes: e.target.value })} placeholder={t('step11.eyesPlaceholder')} />
        <Input label={t('step11.skin')} value={sheet.identity.skin ?? ''} onChange={e => setIdentity({ skin: e.target.value })} placeholder={t('step11.skinPlaceholder')} />
        <Input label={t('step11.hair')} value={sheet.identity.hair ?? ''} onChange={e => setIdentity({ hair: e.target.value })} placeholder={t('step11.hairPlaceholder')} />
      </div>

      <WizardNav onBack={() => setStep(11)} onNext={() => setStep(13)} />
    </div>
  )
}
