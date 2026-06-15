import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '../ui/Modal'
import { useFichaStore } from '../../store/fichaStore'
import { calcPVTotal, calcBonusProf, calcModificador, ATRIBUTOS, ATRIBUTO_NOMES } from '../../lib/calculos'
import dadosJson from '../../data/dnd_dados.json'
import type { DadosJogo, AtributoId } from '../../types'

const dados = dadosJson as unknown as DadosJogo

type ModoASI = '+2' | '+1+1'

interface LevelUpModalProps {
  open: boolean
  onClose: () => void
  novoNivel: number
}

export function LevelUpModal({ open, onClose, novoNivel }: LevelUpModalProps) {
  const { ficha, levelUp } = useFichaStore()
  const { t } = useTranslation()
  const [modoASI, setModoASI] = useState<ModoASI>('+2')
  const [asiUm, setAsiUm] = useState<AtributoId | null>(null)
  const [asiDois, setAsiDois] = useState<AtributoId | null>(null)

  const classeId = ficha.identidade.classe_id
  const classe = dados.classes.find(c => c.id === classeId)
  const progEntry = classe?.progressao.find(
    (p: { nivel: number }) => p.nivel === novoNivel
  ) as (Record<string, unknown> & { nivel: number; destaques?: string[]; espacos?: Record<string, number>; magias_preparadas?: number; truques?: number }) | undefined

  const temASI = progEntry?.destaques?.includes('AVA') ?? false
  const ehConjurador = ficha.magia.conjurador

  const modCON = calcModificador(ficha.atributos.CON.valor ?? 10)
  const novoHP = classe ? calcPVTotal(novoNivel, classe.dado_vida, modCON) : null
  const novoProf = calcBonusProf(novoNivel)
  const destaques = (progEntry?.destaques ?? []).filter(d => d !== 'AVA')

  const novosSlots = useMemo(() => {
    if (!ehConjurador || !progEntry?.espacos) return null
    return progEntry.espacos as Record<string, number>
  }, [ehConjurador, progEntry])

  function calcularASI(): Partial<Record<AtributoId, number>> | undefined {
    if (!temASI) return undefined
    if (modoASI === '+2' && asiUm) return { [asiUm]: 2 } as Partial<Record<AtributoId, number>>
    if (modoASI === '+1+1' && asiUm && asiDois && asiUm !== asiDois) {
      return { [asiUm]: 1, [asiDois]: 1 } as Partial<Record<AtributoId, number>>
    }
    return undefined
  }

  function podeConcluir() {
    if (!temASI) return true
    if (modoASI === '+2') return asiUm !== null
    return asiUm !== null && asiDois !== null && asiUm !== asiDois
  }

  function confirmar() {
    levelUp(novoNivel, calcularASI())
    onClose()
  }

  function valorAtributo(attr: AtributoId) {
    return ficha.atributos[attr].valor ?? 10
  }

  function podeSelecionar(attr: AtributoId, slot: 1 | 2) {
    const val = valorAtributo(attr)
    if (val >= 20) return false
    if (modoASI === '+2' && val + 2 > 20) return false
    if (modoASI === '+1+1') {
      if (slot === 2 && attr === asiUm) return false
      if (slot === 1 && attr === asiDois) return false
    }
    return true
  }

  const AtributoBtn = ({ attr, slot }: { attr: AtributoId; slot: 1 | 2 }) => {
    const selecionado = slot === 1 ? asiUm === attr : asiDois === attr
    const bloqueado = !podeSelecionar(attr, slot)
    const val = valorAtributo(attr)
    const bonus = modoASI === '+2' ? 2 : 1
    return (
      <button
        type="button"
        disabled={bloqueado && !selecionado}
        onClick={() => {
          if (slot === 1) setAsiUm(selecionado ? null : attr)
          else setAsiDois(selecionado ? null : attr)
        }}
        className={[
          'flex items-center justify-between px-3 py-2 rounded-lg border text-sm transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B]',
          selecionado
            ? 'border-[#B8860B] bg-[#B8860B]/15 text-[#F5F0E8]'
            : bloqueado
            ? 'border-[#B8860B]/10 bg-[#2D2520] text-[#A8A09B]/40 cursor-not-allowed'
            : 'border-[#B8860B]/20 bg-[#2D2520] text-[#A8A09B] hover:border-[#B8860B]/50 hover:text-[#F5F0E8]',
        ].join(' ')}
      >
        <span className="font-medium">{ATRIBUTO_NOMES[attr]}</span>
        <span className="tabular-nums text-xs">
          {val}
          {selecionado && <span className="text-[#B8860B] font-bold"> +{bonus} → {Math.min(20, val + bonus)}</span>}
          {val >= 20 && <span className="text-[#A8A09B]/50"> {t('levelup.maxLabel')}</span>}
        </span>
      </button>
    )
  }

  return (
    <Modal open={open} onClose={onClose} title={t('levelup.title', { n: novoNivel })}>
      <div className="space-y-5">

        {/* Resumo */}
        <div className="grid grid-cols-2 gap-3">
          {novoHP !== null && (
            <div className="bg-[#2D2520] rounded-lg p-3 text-center">
              <p className="text-xs text-[#A8A09B] mb-1">{t('levelup.hp')}</p>
              <p className="text-2xl font-cinzel font-bold text-green-400">{novoHP}</p>
              <p className="text-xs text-[#A8A09B] mt-0.5">{classe?.dado_vida && `d${classe.dado_vida} + CON`}</p>
            </div>
          )}
          <div className="bg-[#2D2520] rounded-lg p-3 text-center">
            <p className="text-xs text-[#A8A09B] mb-1">{t('levelup.profBonus')}</p>
            <p className="text-2xl font-cinzel font-bold text-[#B8860B]">+{novoProf}</p>
          </div>
        </div>

        {/* Destaques do nível */}
        {destaques.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-[#B8860B] uppercase tracking-wide mb-2">{t('levelup.newHighlights')}</p>
            <div className="flex flex-wrap gap-1.5">
              {destaques.map(d => (
                <span key={d} className="px-2 py-1 bg-[#2D2520] border border-[#B8860B]/20 rounded text-xs text-[#F5F0E8]">
                  {d}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Novos slots de magia */}
        {novosSlots && (
          <div>
            <p className="text-xs font-semibold text-[#B8860B] uppercase tracking-wide mb-2">{t('levelup.spellSlots')}</p>
            <div className="grid grid-cols-5 sm:grid-cols-9 gap-1">
              {(['c1','c2','c3','c4','c5','c6','c7','c8','c9'] as const).map((c, i) => {
                const qtd = novosSlots[c] ?? 0
                return (
                  <div key={c} className={`text-center rounded p-1.5 ${qtd > 0 ? 'bg-[#2D2520] border border-[#B8860B]/20' : 'opacity-30'}`}>
                    <p className="text-[9px] text-[#A8A09B]">{t('magic.level_n', { n: i + 1 })}</p>
                    <p className={`text-sm font-bold ${qtd > 0 ? 'text-[#F5F0E8]' : 'text-[#A8A09B]'}`}>{qtd}</p>
                  </div>
                )
              })}
            </div>
            {progEntry?.magias_preparadas !== undefined && (
              <p className="text-xs text-[#A8A09B] mt-2">
                {t('levelup.preparedSpells', { n: progEntry.magias_preparadas })}
              </p>
            )}
          </div>
        )}

        {/* ASI */}
        {temASI && (
          <div>
            <p className="text-xs font-semibold text-[#B8860B] uppercase tracking-wide mb-2">
              {t('levelup.ava')}
            </p>

            {/* Modo */}
            <div className="flex rounded overflow-hidden border border-[#B8860B]/20 mb-3 w-fit">
              {(['+2', '+1+1'] as ModoASI[]).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setModoASI(m); setAsiUm(null); setAsiDois(null) }}
                  className={[
                    'px-4 py-1.5 text-xs font-medium transition-colors cursor-pointer focus-visible:outline-none',
                    modoASI === m ? 'bg-[#B8860B] text-[#1A1612]' : 'bg-[#2D2520] text-[#A8A09B] hover:text-[#F5F0E8]',
                  ].join(' ')}
                >
                  {m === '+2' ? t('levelup.plus2') : t('levelup.plus1x2')}
                </button>
              ))}
            </div>

            <div className="space-y-1.5">
              <p className="text-xs text-[#A8A09B] mb-1">
                {modoASI === '+2' ? t('levelup.chooseAttr') : t('levelup.chooseFirstAttr')}
              </p>
              {ATRIBUTOS.map(attr => <AtributoBtn key={attr} attr={attr} slot={1} />)}
            </div>

            {modoASI === '+1+1' && (
              <div className="space-y-1.5 mt-3">
                <p className="text-xs text-[#A8A09B] mb-1">{t('levelup.chooseSecondAttr')}</p>
                {ATRIBUTOS.map(attr => <AtributoBtn key={attr} attr={attr} slot={2} />)}
              </div>
            )}
          </div>
        )}

        {/* Confirmar */}
        <button
          type="button"
          disabled={!podeConcluir()}
          onClick={confirmar}
          className="w-full py-2.5 rounded-lg font-cinzel font-semibold text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B] disabled:opacity-40 disabled:cursor-not-allowed bg-[#7B1D1D] hover:bg-[#9B2D2D] text-[#F5F0E8] cursor-pointer"
        >
          {t('levelup.confirm', { n: novoNivel })}
        </button>
      </div>
    </Modal>
  )
}
