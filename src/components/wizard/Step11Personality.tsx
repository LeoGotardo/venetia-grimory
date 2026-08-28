import { useTranslation } from 'react-i18next'
import { useFichaStore } from '../../store/fichaStore'
import { WizardNav } from './WizardNav'
import { Input, Textarea } from '../ui/Input'

const ALINHAMENTOS_ETICO = ['Lawful', 'Neutral', 'Chaotic'] as const
const ALINHAMENTOS_MORAL = ['Good', 'Neutral', 'Evil'] as const

export function Step11Personalidade() {
  const { ficha, setPersonalidade, setIdentidade, setPasso } = useFichaStore()
  const { t } = useTranslation()
  const p = ficha.personalidade
  const alin = ficha.identidade.alinhamento

  function setTrait(key: keyof typeof p, idx: number, val: string) {
    const arr = [...(p[key] as string[])]
    arr[idx] = val
    setPersonalidade({ [key]: arr } as never)
  }

  const getEthicLabel = (etico: string) => {
    switch (etico) {
      case 'Lawful': return t('common.ethicLawful')
      case 'Neutral': return t('common.ethicNeutral')
      case 'Chaotic': return t('common.ethicChaotic')
      default: return etico
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
          value={ficha.identidade.nome_personagem ?? ''}
          onChange={e => setIdentidade({ nome_personagem: e.target.value })}
          placeholder={t('step11.charNamePlaceholder')}
        />
        <Input
          label={t('step11.playerName')}
          value={ficha.identidade.nome_jogador ?? ''}
          onChange={e => setIdentidade({ nome_jogador: e.target.value })}
          placeholder={t('step11.playerNamePlaceholder')}
        />
      </div>

      <div>
        <label className="text-sm text-[#B8860B] font-medium block mb-2">{t('step11.alignment')}</label>
        <div className="grid grid-cols-3 gap-1 w-full max-w-xs">
          {ALINHAMENTOS_MORAL.map(moral => (
            ALINHAMENTOS_ETICO.map(etico => (
              <button
                key={`${etico}-${moral}`}
                onClick={() => setIdentidade({ alinhamento: { etico, moral } })}
                className={`py-2 px-1 rounded text-xs font-medium border transition-colors cursor-pointer
                  ${alin.etico === etico && alin.moral === moral
                    ? 'bg-[#7B1D1D] border-[#7B1D1D] text-white'
                    : 'border-[#B8860B]/20 text-[#A8A09B] hover:bg-[#3D332D] hover:text-[#F5F0E8]'}`}
              >
                {getEthicLabel(etico)} {getMoralLabel(moral)}
              </button>
            ))
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Textarea
          label={t('step11.trait1')}
          value={p.tracos[0] ?? ''}
          onChange={e => setTrait('tracos', 0, e.target.value)}
          placeholder={t('step11.trait1Placeholder')}
        />
        <Textarea
          label={t('step11.trait2')}
          value={p.tracos[1] ?? ''}
          onChange={e => setTrait('tracos', 1, e.target.value)}
          placeholder={t('step11.trait2Placeholder')}
        />
        <Textarea
          label={t('step11.ideals')}
          value={p.ideais[0] ?? ''}
          onChange={e => setPersonalidade({ ideais: [e.target.value] })}
          placeholder={t('step11.idealsPlaceholder')}
        />
        <Textarea
          label={t('step11.bonds')}
          value={p.vinculos[0] ?? ''}
          onChange={e => setPersonalidade({ vinculos: [e.target.value] })}
          placeholder={t('step11.bondsPlaceholder')}
        />
        <Textarea
          label={t('step11.flaws')}
          value={p.fraquezas[0] ?? ''}
          onChange={e => setPersonalidade({ fraquezas: [e.target.value] })}
          placeholder={t('step11.flawsPlaceholder')}
        />
        <Textarea
          label={t('step11.backstory')}
          value={p.historia ?? ''}
          onChange={e => setPersonalidade({ historia: e.target.value })}
          placeholder={t('step11.backstoryPlaceholder')}
          className="min-h-[120px]"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Input label={t('step11.age')} value={ficha.identidade.idade ?? ''} onChange={e => setIdentidade({ idade: e.target.value })} placeholder={t('step11.agePlaceholder')} />
        <Input label={t('step11.height')} value={ficha.identidade.altura ?? ''} onChange={e => setIdentidade({ altura: e.target.value })} placeholder={t('step11.heightPlaceholder')} />
        <Input label={t('step11.weight')} value={ficha.identidade.peso ?? ''} onChange={e => setIdentidade({ peso: e.target.value })} placeholder={t('step11.weightPlaceholder')} />
        <Input label={t('step11.eyes')} value={ficha.identidade.olhos ?? ''} onChange={e => setIdentidade({ olhos: e.target.value })} placeholder={t('step11.eyesPlaceholder')} />
        <Input label={t('step11.skin')} value={ficha.identidade.pele ?? ''} onChange={e => setIdentidade({ pele: e.target.value })} placeholder={t('step11.skinPlaceholder')} />
        <Input label={t('step11.hair')} value={ficha.identidade.cabelo ?? ''} onChange={e => setIdentidade({ cabelo: e.target.value })} placeholder={t('step11.hairPlaceholder')} />
      </div>

      <WizardNav onBack={() => setPasso(11)} onNext={() => setPasso(13)} />
    </div>
  )
}
