import { useTranslation } from 'react-i18next'
import { Modal } from './Modal'
import type { Magia } from '../../data/magias'

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
  magia: Magia | null
  onClose: () => void
}

export function SpellCard({ magia, onClose }: SpellCardProps) {
  const { t } = useTranslation()
  if (!magia) return null

  const getCircleLabel = (circulo: number) => {
    if (circulo === 0) return t('magic.level_0')
    return t('magic.level_n', { n: circulo })
  }

  const hasDetails =
    magia.descricao ||
    magia.componentes ||
    magia.tempo_conjuracao ||
    magia.alcance ||
    magia.duracao

  return (
    <Modal open={!!magia} onClose={onClose}>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="font-cinzel font-bold text-xl text-[#F5F0E8]">{magia.nome}</h3>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Tag>{getCircleLabel(magia.circulo)}</Tag>
            <Tag>{magia.escola}</Tag>
            {magia.concentracao && <Tag>{t('magic.concentration')}</Tag>}
            {magia.ritual && <Tag>{t('magic.ritual')}</Tag>}
          </div>
        </div>

        <hr className="border-[#B8860B]/20" />

        {/* Stats grid */}
        {hasDetails ? (
          <div className="space-y-2">
            {magia.tempo_conjuracao && (
              <Row label={t('magic.castingTime')} value={magia.tempo_conjuracao} />
            )}
            {magia.alcance && (
              <Row label={t('magic.range')} value={magia.alcance} />
            )}
            {magia.componentes && (
              <Row
                label={t('magic.components')}
                value={
                  <span className="flex flex-wrap gap-1">
                    {magia.componentes.map(c => (
                      <span
                        key={c}
                        className="inline-flex w-5 h-5 items-center justify-center rounded-full bg-[#2D2520] border border-[#B8860B]/30 text-[#B8860B] text-[10px] font-bold"
                      >
                        {c}
                      </span>
                    ))}
                    {magia.material && (
                      <span className="text-[#A8A09B] text-xs italic ml-1">({magia.material})</span>
                    )}
                  </span>
                }
              />
            )}
            {magia.duracao && (
              <Row label={t('magic.duration')} value={magia.duracao} />
            )}
            {magia.dano && (
              <Row
                label={t('magic.damage')}
                value={
                  <span>
                    <span className="font-bold text-[#D4A017]">{magia.dano}</span>
                    {magia.tipo_dano && (
                      <span className="text-[#A8A09B] ml-1">{magia.tipo_dano}</span>
                    )}
                  </span>
                }
              />
            )}
            {magia.salvaguarda && (
              <Row label={t('magic.save')} value={magia.salvaguarda} />
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <Row label={t('magic.school')} value={magia.escola} />
            <Row label={t('magic.circle')} value={getCircleLabel(magia.circulo)} />
          </div>
        )}

        {/* Description */}
        {magia.descricao && (
          <>
            <hr className="border-[#B8860B]/20" />
            <p className="text-sm text-[#C8C0BA] leading-relaxed">{magia.descricao}</p>
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
            {magia.classes.map(c => (
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
