import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSheetStore } from '../../store/sheetStore'
import { WizardNav } from './WizardNav'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { SpeciesCard } from '../ui/SpeciesCard'
import type { Species } from '../../types'
import { gameData } from '../../data/rules'
import { SPECIES_WITH_ORIGIN_FEAT, FEAT_SOURCE_SPECIES } from '../../constants'

export function Step04Species() {
  const { sheet, setSpecies, setSpeciesOriginFeat, setStep } = useSheetStore()
  const { t } = useTranslation()
  const speciesId = sheet.identity.species_id
  const lineageId = sheet.identity.lineage_id
  const species = gameData.species?.find(e => e.id === speciesId)
  const [speciesModal, setSpeciesModal] = useState<Species | null>(null)

  // Humano ganha um Talento de Origem à escolha (traço Versátil). É o único jeito
  // de pegar um talento de Origem fora do antecedente — o AVA dá talento Geral.
  const grantsOriginFeat = !!speciesId && SPECIES_WITH_ORIGIN_FEAT.includes(speciesId)
  const chosenOriginFeat = sheet.feats.list.find(f => f.source === FEAT_SOURCE_SPECIES) ?? null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-cinzel text-2xl font-bold text-[#F5F0E8] mb-1">{t('step04.heading')}</h2>
        <p className="text-[#A8A09B] text-sm">{t('step04.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {gameData.species?.map(species => (
          <Card
            key={species.id}
            selected={speciesId === species.id}
            hoverable
            onClick={() => setSpecies(species.id)}
          >
            <h3 className="font-cinzel font-bold text-[#F5F0E8] mb-1">{species.name}</h3>
            <div className="flex flex-wrap gap-1 mb-2">
              <Badge variant="default">{species.size}</Badge>
              <Badge variant="default">{species.speed}{t('sheet.mUnit')}</Badge>
              {species.darkvision && <Badge variant="blue">{t('step04.darkvision', { n: species.darkvision })}</Badge>}
            </div>
            <div className="space-y-1">
              {species.traits.slice(0, 3).map(tr => (
                <p key={tr.name} className="text-xs text-[#A8A09B]">• {tr.name}</p>
              ))}
              {species.traits.length > 3 && <p className="text-xs text-[#B8860B]">{t('step04.moreTraits', { n: species.traits.length - 3 })}</p>}
            </div>
            <div className="flex justify-end mt-3">
              <button
                onClick={e => { e.stopPropagation(); setSpeciesModal(species) }}
                className="text-xs text-[#B8860B] hover:text-[#D4A017] underline cursor-pointer"
              >
                {t('step02.details')}
              </button>
            </div>
          </Card>
        ))}
      </div>

      {species?.lineages && species.lineages.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-cinzel font-semibold text-[#B8860B]">{t('step04.lineageHeading', { name: species.name })}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {species.lineages.map(lineage => (
              <Card
                key={lineage.id}
                selected={lineageId === lineage.id}
                hoverable
                onClick={() => setSpecies(speciesId!, lineage.id)}
              >
                <h4 className="font-cinzel font-semibold text-[#F5F0E8] mb-1">{lineage.name}</h4>
                <p className="text-xs text-[#A8A09B]">{lineage.description ?? `${t('edit.lineage')} ${lineage.name}`}</p>
                {lineage.traits && (
                  <div className="mt-2 space-y-1">
                    {lineage.traits.slice(0, 2).map(tr => (
                      <p key={tr.name} className="text-xs text-[#B8860B]">• {tr.name}</p>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {grantsOriginFeat && (
        <div className="space-y-3">
          <div>
            <h3 className="font-cinzel font-semibold text-[#B8860B]">{t('step04.originFeatHeading')}</h3>
            <p className="text-xs text-[#A8A09B]">{t('step04.originFeatHint')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {gameData.origin_feats?.map(feat => {
              const selected = chosenOriginFeat?.feat_id === feat.id
              return (
                <Card
                  key={feat.id}
                  selected={selected}
                  hoverable
                  onClick={() => setSpeciesOriginFeat(selected ? null : feat.id)}
                >
                  <h4 className="font-cinzel font-semibold text-[#F5F0E8] mb-1">{feat.name}</h4>
                  <p className="text-xs text-[#A8A09B]">{feat.description}</p>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      <SpeciesCard
        species={speciesModal}
        lineageId={speciesModal?.id === speciesId ? lineageId : null}
        onClose={() => setSpeciesModal(null)}
      />

      <WizardNav
        onBack={() => setStep(3)}
        onNext={() => setStep(5)}
        nextDisabled={
          !speciesId ||
          (!!species?.lineages?.length && !lineageId) ||
          (grantsOriginFeat && !chosenOriginFeat)
        }
      />
    </div>
  )
}
