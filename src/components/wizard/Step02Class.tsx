import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSheetStore } from '../../store/sheetStore'
import { WizardNav } from './WizardNav'
import { Card } from '../ui/Card'
import { Badge, DieBadge } from '../ui/Badge'
import { ClassCard } from '../ui/ClassCard'
import { LockIcon } from '../ui/LockIcon'
import type { CharClass } from '../../types'
import { gameData } from '../../data/rules'

const complexityColor: Record<string, string> = {
  Low: 'green',
  Medium: 'gold',
  High: 'crimson',
  Baixa: 'green',
  Média: 'gold',
  Alta: 'crimson',
}

export function Step02Class() {
  const { sheet, setCharClass, setStep } = useSheetStore()
  const { t } = useTranslation()
  const classId = sheet.identity.class_id
  const [classModal, setClassModal] = useState<CharClass | null>(null)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-cinzel text-2xl font-bold text-[#F5F0E8] mb-1">{t('step02.heading')}</h2>
        <p className="text-[#A8A09B] text-sm">{t('step02.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {gameData.classes.map(charClass => (
          <Card
            key={charClass.id}
            selected={classId === charClass.id}
            hoverable
            onClick={() => setCharClass(charClass.id)}
            className="relative"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-cinzel font-bold text-[#F5F0E8]">{charClass.name}</h3>
                <p className="text-[#A8A09B] text-xs">{charClass.appeal}</p>
              </div>
              <DieBadge type={`d${charClass.hit_die}`} />
            </div>
            <p className="text-[#B8860B] text-xs mb-2">{charClass.primary_abilities.join(', ')}</p>
            <p className="text-[#A8A09B] text-xs line-clamp-2 mb-3">{charClass.description}</p>
            <div className="flex items-center justify-between">
              <Badge variant={complexityColor[charClass.complexity] as 'green' | 'gold' | 'crimson'}>
                {charClass.complexity === 'Baixa' ? 'Low' : charClass.complexity === 'Média' ? 'Medium' : charClass.complexity === 'Alta' ? 'High' : charClass.complexity}
              </Badge>
              <button
                onClick={e => { e.stopPropagation(); setClassModal(charClass) }}
                className="text-xs text-[#B8860B] hover:text-[#D4A017] underline cursor-pointer"
              >
                {t('step02.details')}
              </button>
            </div>
          </Card>
        ))}
      </div>

      {classId && (() => {
        const c = gameData.classes.find(c => c.id === classId)
        if (!c) return null
        return (
          <div className="bg-[#3D332D] border border-[#B8860B]/30 rounded-lg p-4 space-y-2">
            <h3 className="font-cinzel font-semibold text-[#B8860B]">{c.name} — {t('step02.summary')}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div><span className="text-[#A8A09B]">{t('step02.hitDie')}</span> <span className="text-[#F5F0E8] font-semibold">d{c.hit_die}</span></div>
              <div><span className="text-[#A8A09B]">{t('step02.saves')}</span> <span className="text-[#F5F0E8]">{c.saves.join(', ')}</span></div>
              <div><span className="text-[#A8A09B]">{t('step02.armors')}</span> <span className="text-[#F5F0E8]">{c.armors.join(', ') || t('step02.noArmor')}</span></div>
              <div><span className="text-[#A8A09B]">{t('step02.skills')}</span> <span className="text-[#F5F0E8]">{t('step02.skillChoice', { n: c.num_skills })}</span></div>
            </div>

            <ClassFeatures charClass={c} level={sheet.identity.level} />
          </div>
        )
      })()}

      <ClassCard
        charClass={classModal}
        level={sheet.identity.level}
        onClose={() => setClassModal(null)}
      />

      <WizardNav onBack={() => setStep(1)} onNext={() => setStep(3)} nextDisabled={!classId} />
    </div>
  )
}

interface ClassFeaturesProps {
  charClass: CharClass
  level: number
}

/**
 * Características de classe por nível: as já desbloqueadas no nível escolhido
 * aparecem destacadas; as de níveis acima ficam esmaecidas com cadeado.
 */
function ClassFeatures({ charClass, level }: ClassFeaturesProps) {
  const { t } = useTranslation()
  const lines = charClass.progression.filter(p => p.highlights.length > 0)
  const unlocked = lines
    .filter(p => p.level <= level)
    .reduce((sum, p) => sum + p.highlights.length, 0)

  return (
    <div className="pt-3 border-t border-[#B8860B]/20 space-y-2">
      <div className="flex items-baseline justify-between">
        <h4 className="font-cinzel font-semibold text-[#B8860B] text-sm">{t('step02.featuresHeading')}</h4>
        <span className="text-xs text-[#A8A09B]">
          {t('step02.featuresUnlocked', { n: unlocked, level })}
        </span>
      </div>

      <div className="max-h-56 overflow-y-auto pr-1 space-y-1.5">
        {lines.map(p => {
          const locked = p.level > level
          return (
            <div key={p.level} className="flex items-start gap-2">
              <span
                title={locked ? t('step02.lockedAtLevel', { n: p.level }) : undefined}
                className={[
                  'shrink-0 w-9 text-center text-[11px] font-bold rounded px-1 py-0.5 border',
                  locked
                    ? 'border-[#A8A09B]/25 text-[#A8A09B]/60'
                    : 'border-[#B8860B]/50 bg-[#B8860B]/15 text-[#D4A017]',
                ].join(' ')}
              >
                {p.level}
              </span>
              <div className="flex flex-wrap gap-1">
                {p.highlights.map(d => (
                  <span
                    key={d}
                    className={[
                      'inline-flex items-center gap-1 text-xs rounded px-2 py-0.5 border',
                      locked
                        ? 'bg-transparent border-[#A8A09B]/20 text-[#A8A09B]/60'
                        : 'bg-[#2D2520] border-[#B8860B]/25 text-[#F5F0E8]',
                    ].join(' ')}
                  >
                    {locked && <LockIcon />}
                    {d}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
