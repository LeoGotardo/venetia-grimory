import { useTranslation } from 'react-i18next'
import { Modal } from './Modal'
import { Badge } from './Badge'
import type { Species, Trait } from '../../types'

function TraitList({ traits }: { traits: Trait[] }) {
  const { t } = useTranslation()
  return (
    <div className="space-y-2">
      {traits.map(tr => (
        <div key={tr.name} className="bg-[#2D2520] rounded p-3">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[#F5F0E8] text-sm font-semibold">{tr.name}</span>
            {tr.max_uses != null && (
              <span className="text-[10px] text-[#B8860B] shrink-0">{t('species.uses', { n: tr.max_uses })}</span>
            )}
          </div>
          {tr.description && (
            <p className="text-[#A8A09B] text-xs mt-1 leading-relaxed">{tr.description}</p>
          )}
        </div>
      ))}
    </div>
  )
}

interface SpeciesCardProps {
  species: Species | null
  /** Destaca a linhagem escolhida, quando houver. */
  lineageId?: string | null
  onClose: () => void
}

/**
 * Ficha detalhada da espécie — traços completos com descrição, no mesmo molde
 * da `SpellCard` e da `ClassCard`.
 */
export function SpeciesCard({ species, lineageId, onClose }: SpeciesCardProps) {
  const { t } = useTranslation()
  if (!species) return null

  return (
    <Modal open={!!species} onClose={onClose} title={species.name} wide>
      <div className="space-y-4 text-sm">
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="default">{species.size}</Badge>
          <Badge variant="default">{species.speed}{t('sheet.mUnit')}</Badge>
          {species.darkvision && (
            <Badge variant="blue">{t('step04.darkvision', { n: species.darkvision })}</Badge>
          )}
        </div>

        <div>
          <div className="text-[#B8860B] font-semibold mb-2">{t('species.traits')}</div>
          <TraitList traits={species.traits} />
        </div>

        {species.lineages && species.lineages.length > 0 && (
          <div>
            <div className="text-[#B8860B] font-semibold mb-2">
              {t('step04.lineageHeading', { name: species.name })}
            </div>
            <div className="space-y-3">
              {species.lineages.map(l => (
                <div
                  key={l.id}
                  className={[
                    'rounded p-3 border',
                    l.id === lineageId
                      ? 'border-[#B8860B]/60 bg-[#B8860B]/10'
                      : 'border-[#B8860B]/15 bg-[#2D2520]/50',
                  ].join(' ')}
                >
                  <div className="flex items-baseline gap-2">
                    <span className="font-cinzel font-semibold text-[#F5F0E8]">{l.name}</span>
                    {l.id === lineageId && (
                      <span className="text-[10px] text-[#D4A017]">{t('species.chosen')}</span>
                    )}
                  </div>
                  {l.description && (
                    <p className="text-[#A8A09B] text-xs mt-1 leading-relaxed">{l.description}</p>
                  )}
                  {l.traits && l.traits.length > 0 && (
                    <div className="mt-2">
                      <TraitList traits={l.traits} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
