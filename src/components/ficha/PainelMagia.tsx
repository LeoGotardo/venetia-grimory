import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useFichaStore } from '../../store/fichaStore'
import { formatModificador } from '../../lib/calculos'
import { resolverMagia, type Magia } from '../../data/magias'
import { dados } from '../../data/dados'
import { SpellCard } from '../ui/SpellCard'
import type { Ficha } from '../../types'

const CIRCULOS: Array<keyof Ficha['magia']['espacos_de_magia']> = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9']

// On-theme: sem Tailwind genérico (gray/blue sem contexto)
const CIRCULO_CORES = [
  '',
  'bg-amber-500',
  'bg-yellow-400',
  'bg-green-500',
  'bg-teal-500',
  'bg-blue-500',
  'bg-violet-500',
  'bg-purple-600',
  'bg-pink-500',
  'bg-rose-600',
]

export function PainelMagia() {
  const { ficha, gastarEspaco, restaurarEspaco } = useFichaStore()
  const { t } = useTranslation()
  const [magiaAberta, setMagiaAberta] = useState<Magia | null>(null)
  const { magia } = ficha

  const totalSelecionadas =
    Object.values(magia.truques_por_classe).flat().length +
    Object.values(magia.magias_por_classe).flat().length

  if (!magia.conjurador) {
    return (
      <div className="text-center py-10 text-[#A8A09B]">
        <div className="mb-3 flex justify-center opacity-40">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="#B8860B"><path d="M12 2l2.4 7.6H22l-6.2 4.5 2.4 7.6L12 17.2l-6.2 4.5 2.4-7.6L2 9.6h7.6z"/></svg>
        </div>
        <p className="font-cinzel text-[#B8860B] mb-1">{t('magic.notCaster')}</p>
        <p className="text-sm">{t('magic.notCasterDesc')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-[#2D2520] border border-[#B8860B]/20 rounded-lg p-3 text-center">
          <div className="text-xs text-[#A8A09B] mb-1">{t('magic.spellDC')}</div>
          <div className="font-cinzel font-bold text-3xl text-[#F5F0E8]">{magia._cd_magia ?? '—'}</div>
        </div>
        <div className="bg-[#2D2520] border border-[#B8860B]/20 rounded-lg p-3 text-center">
          <div className="text-xs text-[#A8A09B] mb-1">{t('magic.spellAttackBonus')}</div>
          <div className="font-cinzel font-bold text-3xl text-[#F5F0E8]">
            {magia._bonus_ataque_magia !== null ? formatModificador(magia._bonus_ataque_magia) : '—'}
          </div>
        </div>
      </div>

      <section aria-label={t('magic.spellSlots')}>
        <h4 className="font-cinzel font-semibold text-[#B8860B] mb-3">{t('magic.spellSlots')}</h4>
        <div className="space-y-2">
          {CIRCULOS.map((c, i) => {
            const espaco = magia.espacos_de_magia[c]
            if (espaco.maximo === 0) return null
            const circulo = i + 1
            return (
              <div key={c} className="flex items-center gap-3">
                <span className="text-xs text-[#A8A09B] w-8 text-right flex-shrink-0">{t('magic.level_n', { n: circulo })}</span>
                <div className="flex gap-1 flex-wrap" role="group" aria-label={t('magic.circleAriaLabel', { n: circulo })}>
                  {Array.from({ length: espaco.maximo }, (_, j) => {
                    const disponivel = j < espaco.maximo - espaco.gastos
                    return (
                      <button
                        key={j}
                        onClick={() => disponivel ? gastarEspaco(c) : restaurarEspaco(c)}
                        className={[
                          'w-5 h-5 rounded-full border-2 transition-all cursor-pointer',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B] focus-visible:ring-offset-1 focus-visible:ring-offset-[#3D332D]',
                          disponivel
                            ? `${CIRCULO_CORES[circulo]} border-transparent opacity-90 hover:opacity-100`
                            : 'border-[#A8A09B]/40 bg-transparent hover:border-[#B8860B]',
                        ].join(' ')}
                        aria-label={disponivel
                          ? t('magic.spendSlot', { slot: j + 1, n: circulo })
                          : t('magic.restoreSlot', { slot: j + 1, n: circulo })}
                        aria-pressed={!disponivel}
                      />
                    )
                  })}
                </div>
                <span className="text-xs text-[#A8A09B]">
                  {espaco.maximo - espaco.gastos}/{espaco.maximo}
                </span>
              </div>
            )
          })}
        </div>
      </section>

      <ListaDeMagias
        titulo={t('magic.cantrips')}
        porClasse={magia.truques_por_classe}
        onAbrir={setMagiaAberta}
      />

      <ListaDeMagias
        titulo={t('magic.preparedSpells')}
        porClasse={magia.magias_por_classe}
        onAbrir={setMagiaAberta}
      />

      {totalSelecionadas === 0 && (
        <p className="text-sm text-[#A8A09B] text-center py-6">{t('magic.noSpellsSelected')}</p>
      )}

      <SpellCard magia={magiaAberta} onClose={() => setMagiaAberta(null)} />
    </div>
  )
}

interface ListaDeMagiasProps {
  titulo: string
  porClasse: Record<string, string[]>
  onAbrir: (magia: Magia) => void
}

/**
 * Lista informativa das magias escolhidas: resolve o nome salvo para o catálogo
 * do idioma atual e mostra círculo, escola e marcadores. Clicar abre a ficha da magia.
 */
function ListaDeMagias({ titulo, porClasse, onAbrir }: ListaDeMagiasProps) {
  const { t } = useTranslation()
  const entradas = Object.entries(porClasse).filter(([, nomes]) => nomes.length > 0)
  if (entradas.length === 0) return null

  const total = entradas.reduce((soma, [, nomes]) => soma + nomes.length, 0)
  const multiclasse = entradas.length > 1

  return (
    <section aria-label={titulo}>
      <div className="flex items-baseline justify-between mb-2">
        <h4 className="font-cinzel font-semibold text-[#B8860B]">{titulo}</h4>
        <span className="text-xs text-[#A8A09B]">{t('magic.selectedCount', { n: total })}</span>
      </div>

      <div className="space-y-3">
        {entradas.map(([classeId, nomes]) => (
          <div key={classeId} className="space-y-1.5">
            {multiclasse && (
              <p className="text-[11px] uppercase tracking-wide text-[#A8A09B]">
                {dados.classes.find(c => c.id === classeId)?.nome ?? classeId}
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {nomes.map(nome => (
                <ItemDeMagia key={`${classeId}-${nome}`} nome={nome} onAbrir={onAbrir} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function ItemDeMagia({ nome, onAbrir }: { nome: string; onAbrir: (magia: Magia) => void }) {
  const { t } = useTranslation()
  const magia = resolverMagia(nome)

  if (!magia) {
    return (
      <div
        className="flex items-center gap-2 bg-[#2D2520] border border-[#B8860B]/10 rounded-lg px-3 py-2 text-sm text-[#A8A09B]"
        title={t('magic.spellNotFound')}
      >
        <span className="truncate">{nome}</span>
        <span className="ml-auto text-xs shrink-0">?</span>
      </div>
    )
  }

  const circulo = magia.circulo === 0 ? t('magic.level_0') : t('magic.level_n', { n: magia.circulo })

  return (
    <button
      type="button"
      onClick={() => onAbrir(magia)}
      aria-label={t('magic.viewDetails', { nome: magia.nome })}
      className="w-full text-left bg-[#2D2520] border border-[#B8860B]/20 rounded-lg px-3 py-2 cursor-pointer transition-colors
        hover:border-[#B8860B]/60 hover:bg-[#3D332D]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B]"
    >
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-[#F5F0E8] truncate">{magia.nome}</span>
        {magia.concentracao && (
          <span title={t('magic.concentration')} className="text-[10px] font-bold text-[#D4A017] shrink-0">C</span>
        )}
        {magia.ritual && (
          <span title={t('magic.ritual')} className="text-[10px] font-bold text-[#B8860B] shrink-0">R</span>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-[#A8A09B] mt-0.5">
        <span className="text-[#D4A017]">{circulo}</span>
        <span>·</span>
        <span>{magia.escola}</span>
        {magia.tempo_conjuracao && (
          <>
            <span>·</span>
            <span>{magia.tempo_conjuracao}</span>
          </>
        )}
        {magia.alcance && (
          <>
            <span>·</span>
            <span>{magia.alcance}</span>
          </>
        )}
        {magia.dano && (
          <>
            <span>·</span>
            <span className="text-[#e0a3a3]">{magia.dano}{magia.tipo_dano ? ` ${magia.tipo_dano}` : ''}</span>
          </>
        )}
      </div>
    </button>
  )
}
