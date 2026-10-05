import { useTranslation } from 'react-i18next'
import { useSheetStore } from '../../store/sheetStore'
import { WizardNav } from './WizardNav'
import { Badge } from '../ui/Badge'
import { gameData } from '../../data/rules'
import { FIXED_LANGUAGES_BY_CLASS, INITIAL_FREE_LANGUAGES } from '../../constants'

export function Step09Languages() {
  const { sheet, setLanguages, setStep } = useSheetStore()
  const { t } = useTranslation()
  const classId = sheet.identity.class_id ?? ''
  const fixedLanguages = ['comum', ...(FIXED_LANGUAGES_BY_CLASS[classId] ?? [])]
  const selectedLanguages = sheet.proficiencies.languages
  const freeLanguages = selectedLanguages.filter(i => !fixedLanguages.includes(i))

  function toggleLanguage(languageId: string, type: 'comum' | 'raro') {
    if (fixedLanguages.includes(languageId)) return
    const newValue = selectedLanguages.includes(languageId)
      ? selectedLanguages.filter(i => i !== languageId)
      : [...selectedLanguages, languageId]
    setLanguages(newValue)
  }

  const all = [...fixedLanguages, ...freeLanguages]
  const maxFree = INITIAL_FREE_LANGUAGES

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-cinzel text-2xl font-bold text-[#F5F0E8] mb-1">{t('step09.heading')}</h2>
        <p className="text-[#A8A09B] text-sm">
          {t('step09.chooseN', { n: maxFree })}{' '}
          <span className="text-[#B8860B]">{t('step09.chosen', { n: freeLanguages.length, max: maxFree })}</span>
        </p>
      </div>

      <div className="flex flex-wrap gap-2 p-3 bg-[#3D332D] rounded-lg border border-[#B8860B]/20">
        <span className="text-xs text-[#A8A09B] w-full mb-1">{t('step09.currentLangs')}</span>
        {all.map(id => {
          const language = [...gameData.languages.common, ...gameData.languages.rare].find(i => i.id === id)
          return (
            <Badge key={id} variant={fixedLanguages.includes(id) ? 'gold' : 'blue'}>
              {language?.name ?? id}
              {!fixedLanguages.includes(id) && (
                <button onClick={() => toggleLanguage(id, 'comum')} className="ml-1 hover:text-red-400 cursor-pointer">×</button>
              )}
            </Badge>
          )
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <h3 className="font-cinzel font-semibold text-[#B8860B] mb-3">{t('step09.commonLangs')}</h3>
          <div className="space-y-1">
            {gameData.languages.common.map(i => {
              const isFixed = fixedLanguages.includes(i.id)
              const isSelected = selectedLanguages.includes(i.id)
              const locked = isFixed || (!isSelected && freeLanguages.length >= maxFree)
              return (
                <button
                  key={i.id}
                  onClick={() => !isFixed && toggleLanguage(i.id, 'comum')}
                  disabled={locked && !isSelected}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded text-left transition-colors cursor-pointer disabled:cursor-default
                    ${isSelected ? 'bg-[#3D332D] border border-[#B8860B]/30' : 'hover:bg-[#3D332D]'}
                    ${locked && !isSelected ? 'opacity-40' : ''}`}
                >
                  <span className={`w-3 h-3 rounded-full ${isSelected ? 'bg-[#B8860B]' : 'border border-[#6B6560]'}`} />
                  <span className="text-sm text-[#F5F0E8]">{i.name}</span>
                  <span className="text-xs text-[#A8A09B] ml-auto">{i.source}</span>
                  {isFixed && <span className="text-xs text-[#B8860B]">{t('step09.fixed')}</span>}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <h3 className="font-cinzel font-semibold text-[#B8860B] mb-2">{t('step09.rareLangs')}</h3>
          <p className="text-xs text-[#A8A09B] mb-3">{t('step09.rareWarning')}</p>
          <div className="space-y-1">
            {gameData.languages.rare.map(i => {
              const isSelected = selectedLanguages.includes(i.id)
              const locked = !isSelected && freeLanguages.length >= maxFree
              return (
                <button
                  key={i.id}
                  onClick={() => toggleLanguage(i.id, 'raro')}
                  disabled={locked}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded text-left transition-colors cursor-pointer disabled:cursor-default
                    ${isSelected ? 'bg-[#4D2020] border border-[#7B1D1D]/30' : 'hover:bg-[#3D332D]'}
                    ${locked ? 'opacity-40' : ''}`}
                >
                  <span className={`w-3 h-3 rounded-full ${isSelected ? 'bg-[#7B1D1D]' : 'border border-[#6B6560]'}`} />
                  <span className="text-sm text-[#F5F0E8]">{i.name}</span>
                  <span className="text-xs text-[#A8A09B] ml-auto">{i.source}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <WizardNav onBack={() => setStep(9)} onNext={() => setStep(11)} nextDisabled={freeLanguages.length < maxFree} />
    </div>
  )
}
