import { useTranslation } from 'react-i18next'
import { Modal } from './Modal'
import type { Spell } from '../../data/spells'

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#B8860B]/15 border border-[#B8860B]/30 text-[#D4A017]">
      {children}
    </span>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-[#A8A09B] shrink-0 w-36">{label}</span>
      <span className="text-[#F5F0E8]">{value}</span>
    </div>
  )
}

interface SpellCardProps {
  spellcasting: Spell | null
  onClose: () => void
}

export function SpellCard({ spellcasting, onClose }: SpellCardProps) {
  const { t } = useTranslation()
  if (!spellcasting) return null

  const getCircleLabel = (level: number) => {
    if (level === 0) return t('magic.level_0')
    return t('magic.level_n', { n: level })
  }

  const hasDetails =
    spellcasting.description ||
    spellcasting.componentes ||
    spellcasting.casting_time ||
    spellcasting.range ||
    spellcasting.duration

  return (
    <Modal open={!!spellcasting} onClose={onClose}>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="font-cinzel font-bold text-xl text-[#F5F0E8]">{spellcasting.name}</h3>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Tag>{getCircleLabel(spellcasting.level)}</Tag>
            <Tag>{spellcasting.school}</Tag>
            {spellcasting.concentration && <Tag>{t('magic.concentration')}</Tag>}
            {spellcasting.ritual && <Tag>{t('magic.ritual')}</Tag>}
          </div>
        </div>

        <hr className="border-[#B8860B]/20" />

        {/* Stats grid */}
        {hasDetails ? (
          <div className="space-y-2">
            {spellcasting.casting_time && (
              <Row label={t('magic.castingTime')} value={spellcasting.casting_time} />
            )}
            {spellcasting.range && (
              <Row label={t('magic.range')} value={spellcasting.range} />
            )}
            {spellcasting.componentes && (
              <Row
                label={t('magic.components')}
                value={
                  <span className="flex flex-wrap gap-1">
                    {spellcasting.componentes.map(c => (
                      <span
                        key={c}
                        className="inline-flex w-5 h-5 items-center justify-center rounded-full bg-[#2D2520] border border-[#B8860B]/30 text-[#B8860B] text-[10px] font-bold"
                      >
                        {c}
                      </span>
                    ))}
                    {spellcasting.material && (
                      <span className="text-[#A8A09B] text-xs italic ml-1">({spellcasting.material})</span>
                    )}
                  </span>
                }
              />
            )}
            {spellcasting.duration && (
              <Row label={t('magic.duration')} value={spellcasting.duration} />
            )}
            {spellcasting.damage && (
              <Row
                label={t('magic.damage')}
                value={
                  <span>
                    <span className="font-bold text-[#D4A017]">{spellcasting.damage}</span>
                    {spellcasting.damage_type && (
                      <span className="text-[#A8A09B] ml-1">{spellcasting.damage_type}</span>
                    )}
                  </span>
                }
              />
            )}
            {spellcasting.save && (
              <Row label={t('magic.save')} value={spellcasting.save} />
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <Row label={t('magic.school')} value={spellcasting.school} />
            <Row label={t('magic.circle')} value={getCircleLabel(spellcasting.level)} />
          </div>
        )}

        {/* Description */}
        {spellcasting.description && (
          <>
            <hr className="border-[#B8860B]/20" />
            <p className="text-sm text-[#C8C0BA] leading-relaxed">{spellcasting.description}</p>
          </>
        )}

        {!hasDetails && (
          <p className="text-xs text-[#A8A09B] italic">{t('magic.noDescription')}</p>
        )}

        {/* Classes */}
        <hr className="border-[#B8860B]/20" />
        <div>
          <p className="text-xs text-[#A8A09B] mb-1.5">{t('magic.classes')}</p>
          <div className="flex flex-wrap gap-1">
            {spellcasting.classes.map(c => (
              <span
                key={c}
                className="text-xs px-2 py-0.5 rounded bg-[#2D2520] border border-[#B8860B]/20 text-[#A8A09B] capitalize"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}
