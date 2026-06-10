import { Modal } from './Modal'
import type { Magia } from '../../data/magias'

const CIRCULO_LABEL: Record<number, string> = {
  0: 'Truque',
  1: '1º Círculo',
  2: '2º Círculo',
  3: '3º Círculo',
  4: '4º Círculo',
  5: '5º Círculo',
  6: '6º Círculo',
  7: '7º Círculo',
  8: '8º Círculo',
  9: '9º Círculo',
}

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
  if (!magia) return null

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
            <Tag>{CIRCULO_LABEL[magia.circulo]}</Tag>
            <Tag>{magia.escola}</Tag>
            {magia.concentracao && <Tag>Concentração</Tag>}
            {magia.ritual && <Tag>Ritual</Tag>}
          </div>
        </div>

        <hr className="border-[#B8860B]/20" />

        {/* Stats grid */}
        {hasDetails ? (
          <div className="space-y-2">
            {magia.tempo_conjuracao && (
              <Row label="Tempo de Conjuração" value={magia.tempo_conjuracao} />
            )}
            {magia.alcance && (
              <Row label="Alcance" value={magia.alcance} />
            )}
            {magia.componentes && (
              <Row
                label="Componentes"
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
              <Row label="Duração" value={magia.duracao} />
            )}
            {magia.dano && (
              <Row
                label="Dano"
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
              <Row label="Salvaguarda" value={magia.salvaguarda} />
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <Row label="Escola" value={magia.escola} />
            <Row label="Círculo" value={CIRCULO_LABEL[magia.circulo]} />
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
          <p className="text-xs text-[#A8A09B] italic">Descrição detalhada não disponível.</p>
        )}

        {/* Classes */}
        <hr className="border-[#B8860B]/20" />
        <div>
          <p className="text-xs text-[#A8A09B] mb-1.5">Classes</p>
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
