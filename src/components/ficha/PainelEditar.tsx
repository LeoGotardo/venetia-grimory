import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useFichaStore } from '../../store/fichaStore'
import { calcModificador, formatModificador, ATRIBUTOS, ATRIBUTO_NOMES } from '../../lib/calculos'
import { Input } from '../ui/Input'
import Button from '../ui/Button'
import { Badge } from '../ui/Badge'
import dadosJson from '../../data/dnd_dados.json'
import type { DadosJogo, AtributoId } from '../../types'
import { NIVEL_MINIMO, NIVEL_MAXIMO, MULTICLASSE_PREREQUISITOS, TIPO_CONJURADOR } from '../../constants'
import { getTruquesPorClasses, getMagiasPorClassesECirculos } from '../../data/magias'
import { getAntecedentes } from '../../data/antecedentes'
import type { Magia } from '../../data/magias'
import { SpellCard } from '../ui/SpellCard'
import { ItemCard } from '../ui/ItemCard'
import type { ItemDetalhe } from '../ui/ItemCard'
import { MochilaBusca } from '../ui/MochilaBusca'

const dados = dadosJson as unknown as DadosJogo

const ALINHAMENTOS_ETICO = ['Lawful', 'Neutral', 'Chaotic'] as const
const ALINHAMENTOS_MORAL = ['Good', 'Neutral', 'Evil'] as const
const ATRIBUTO_MAX = 30

const SELECT_BASE = 'w-full bg-[#2D2520] border border-[#B8860B]/30 rounded px-2 py-2 text-[#F5F0E8] text-sm focus:outline-none focus:ring-1 focus:ring-[#B8860B]'
const SECTION_CARD = 'bg-[#3D332D] border border-[#B8860B]/20 rounded-xl p-4 space-y-4'
const SECTION_TITLE = 'font-cinzel font-semibold text-[#B8860B] pb-2 border-b border-[#B8860B]/20'

export function PainelEditar() {
  const { t } = useTranslation()
  return (
    <div className="space-y-5 max-w-2xl">
      <p className="flex items-center gap-1.5 text-xs text-[#A8A09B] bg-[#3D332D] border border-[#B8860B]/20 rounded-lg px-3 py-2">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="#B8860B" className="flex-shrink-0"><path d="M12 2l2.4 7.6H22l-6.2 4.5 2.4 7.6L12 17.2l-6.2 4.5 2.4-7.6L2 9.6h7.6z"/></svg>
        {t('edit.autoSave')}
      </p>
      <SecaoInformacoes />
      <SecaoProgressao />
      <SecaoMulticlasse />
      <SecaoAtributos />
      <SecaoArmadura />
      <SecaoPericias />
      <SecaoMagia />
      <SecaoMochila />
    </div>
  )
}

function SecaoInformacoes() {
  const { ficha, setIdentidade } = useFichaStore()
  const { t } = useTranslation()
  const id = ficha.identidade

  return (
    <section aria-label={t('edit.basicInfo')} className={SECTION_CARD}>
      <h3 className={SECTION_TITLE}>{t('edit.basicInfo')}</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label={t('edit.charName')}
          value={id.nome_personagem ?? ''}
          onChange={e => setIdentidade({ nome_personagem: e.target.value })}
          placeholder={t('edit.charNamePlaceholder')}
        />
        <Input
          label={t('edit.playerName')}
          value={id.nome_jogador ?? ''}
          onChange={e => setIdentidade({ nome_jogador: e.target.value })}
          placeholder={t('edit.playerNamePlaceholder')}
        />
        <Input
          label={t('edit.campaign')}
          value={id.campanha ?? ''}
          onChange={e => setIdentidade({ campanha: e.target.value })}
          placeholder={t('edit.campaignPlaceholder')}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-[#B8860B] font-medium">{t('edit.ethicalAlignment')}</label>
          <select
            value={id.alinhamento.etico ?? ''}
            onChange={e => setIdentidade({ alinhamento: { ...id.alinhamento, etico: e.target.value || null } })}
            className={SELECT_BASE}
          >
            <option value="">{t('edit.selectDefault')}</option>
            {ALINHAMENTOS_ETICO.map(a => (
              <option key={a} value={a}>
                {a === 'Lawful' ? t('common.ethicLawfulAlt') : a === 'Neutral' ? t('common.ethicNeutral') : t('common.ethicChaotic')}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-[#B8860B] font-medium">{t('edit.moralAlignment')}</label>
          <select
            value={id.alinhamento.moral ?? ''}
            onChange={e => setIdentidade({ alinhamento: { ...id.alinhamento, moral: e.target.value || null } })}
            className={SELECT_BASE}
          >
            <option value="">{t('edit.selectDefault')}</option>
            {ALINHAMENTOS_MORAL.map(a => (
              <option key={a} value={a}>
                {a === 'Good' ? t('common.moralGoodAlt') : a === 'Neutral' ? t('common.moralNeutral') : t('common.moralEvilAlt')}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  )
}

function SecaoProgressao() {
  const { ficha, setNivel, setIdentidade, setClasse, setSubclasse, setEspecie, setAntecedenteId } = useFichaStore()
  const { t } = useTranslation()
  const id = ficha.identidade
  const nivel = id.nivel
  const classe = dados.classes.find(c => c.id === id.classe_id)
  const especie = dados.especies?.find(e => e.id === id.especie_id)

  return (
    <section aria-label={t('edit.progression')} className={SECTION_CARD}>
      <h3 className={SECTION_TITLE}>{t('edit.progression')}</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Nível */}
        <div className="flex flex-col gap-1">
          <label htmlFor="edit-nivel" className="text-sm text-[#B8860B] font-medium">{t('edit.level')}</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setNivel(Math.max(NIVEL_MINIMO, nivel - 1))}
              className="w-8 h-8 rounded bg-[#2D2520] border border-[#B8860B]/30 text-[#F5F0E8] font-bold hover:bg-[#4D4037] transition-colors cursor-pointer"
              aria-label={t('edit.decreaseLevel')}
            >−</button>
            <input
              id="edit-nivel"
              type="number"
              min={NIVEL_MINIMO}
              max={NIVEL_MAXIMO}
              value={nivel}
              onChange={e => setNivel(Math.max(NIVEL_MINIMO, Math.min(NIVEL_MAXIMO, Number(e.target.value))))}
              className="w-16 text-center bg-[#2D2520] border border-[#B8860B]/50 rounded py-1 text-[#F5F0E8] font-cinzel font-bold text-xl focus:outline-none focus:ring-1 focus:ring-[#B8860B]"
            />
            <button
              onClick={() => setNivel(Math.min(NIVEL_MAXIMO, nivel + 1))}
              className="w-8 h-8 rounded bg-[#2D2520] border border-[#B8860B]/30 text-[#F5F0E8] font-bold hover:bg-[#4D4037] transition-colors cursor-pointer"
              aria-label={t('edit.increaseLevel')}
            >+</button>
          </div>
        </div>

        {/* XP */}
        <div className="flex flex-col gap-1">
          <label htmlFor="edit-xp" className="text-sm text-[#B8860B] font-medium">{t('edit.xp')}</label>
          <input
            id="edit-xp"
            type="number"
            min={0}
            value={id.xp}
            onChange={e => setIdentidade({ xp: Math.max(0, Number(e.target.value)) })}
            className="bg-[#2D2520] border border-[#B8860B]/30 rounded px-3 py-2 text-[#F5F0E8] text-sm focus:outline-none focus:ring-1 focus:ring-[#B8860B]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Classe */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-[#B8860B] font-medium">{t('edit.class')}</label>
          <select
            value={id.classe_id ?? ''}
            onChange={e => setClasse(e.target.value)}
            className={SELECT_BASE}
          >
            <option value="">{t('edit.selectClass')}</option>
            {dados.classes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </div>

        {/* Subclasse (somente nível ≥ 3) */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-[#B8860B] font-medium">
            {t('edit.subclass')} {nivel < 3 && <span className="text-[#A8A09B] text-xs">({t('edit.subclassSuffix')})</span>}
          </label>
          <select
            value={id.subclasse_id ?? ''}
            onChange={e => setSubclasse(e.target.value || null)}
            disabled={!id.classe_id || nivel < 3}
            className={`${SELECT_BASE} disabled:opacity-40`}
          >
            <option value="">{t('edit.selectClass')}</option>
            {classe?.subclasses.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
          </select>
        </div>

        {/* Espécie */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-[#B8860B] font-medium">{t('edit.species')}</label>
          <select
            value={id.especie_id ?? ''}
            onChange={e => setEspecie(e.target.value)}
            className={SELECT_BASE}
          >
            <option value="">{t('edit.selectClass')}</option>
            {dados.especies?.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
          </select>
        </div>

        {/* Linhagem (se espécie tem linhagens) */}
        {especie?.linhagens && especie.linhagens.length > 0 && (
          <div className="flex flex-col gap-1">
            <label className="text-sm text-[#B8860B] font-medium">{t('edit.lineage')}</label>
            <select
              value={id.linhagem_id ?? ''}
              onChange={e => setEspecie(id.especie_id!, e.target.value || undefined)}
              className={SELECT_BASE}
            >
              <option value="">{t('edit.selectClass')}</option>
              {especie.linhagens.map(l => <option key={l.id} value={l.id}>{l.nome}</option>)}
            </select>
          </div>
        )}

        {/* Antecedente */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-[#B8860B] font-medium">{t('edit.background')}</label>
          <select
            value={id.antecedente_id ?? ''}
            onChange={e => setAntecedenteId(e.target.value)}
            className={SELECT_BASE}
          >
            <option value="">{t('edit.selectClass')}</option>
            {getAntecedentes().map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
          </select>
        </div>
      </div>
    </section>
  )
}

function SecaoMulticlasse() {
  const { ficha, addMulticlasse, removeMulticlasse, setMulticlasseNivel, setSubclasseMulticlasse } = useFichaStore()
  const { t } = useTranslation()
  const id = ficha.identidade
  const multiclasses = id.multiclasses ?? []
  const nivelTotal = id.nivel
  const nivelPrimaria = nivelTotal - multiclasses.reduce((s, m) => s + m.nivel, 0)
  const [addingClass, setAddingClass] = useState(false)

  function checarPrerequisito(classeId: string): boolean {
    const prereq = MULTICLASSE_PREREQUISITOS[classeId]
    if (!prereq) return true
    const vals = prereq.atributos.map(a => ficha.atributos[a].valor ?? 0)
    return prereq.modo === 'ou' ? vals.some(v => v >= 13) : vals.every(v => v >= 13)
  }

  const classesDisponiveis = dados.classes.filter(c =>
    c.id !== id.classe_id && !multiclasses.some(m => m.classe_id === c.id)
  )

  return (
    <section aria-label={t('multiclass.title')} className={SECTION_CARD}>
      <div className="flex items-center justify-between pb-2 border-b border-[#B8860B]/20">
        <h3 className="font-cinzel font-semibold text-[#B8860B]">{t('multiclass.title')}</h3>
        {nivelTotal > 1 && !addingClass && (
          <button
            type="button"
            onClick={() => setAddingClass(true)}
            className="text-xs text-[#B8860B] border border-[#B8860B]/40 rounded px-2 py-1 hover:bg-[#B8860B]/10 transition-colors cursor-pointer"
          >
            + {t('multiclass.addClass')}
          </button>
        )}
      </div>

      {/* Classe primária */}
      <div className="flex items-center gap-3 text-sm">
        <span className="text-[#A8A09B] text-xs uppercase tracking-wide min-w-[70px]">{t('multiclass.primaryClass')}</span>
        <span className="text-[#F5F0E8] font-medium flex-1">{dados.classes.find(c => c.id === id.classe_id)?.nome ?? '—'}</span>
        <span className="text-[#B8860B] font-cinzel font-bold">{t('multiclass.levelIn', { n: nivelPrimaria })}</span>
      </div>

      {/* Classes secundárias */}
      {multiclasses.map(m => {
        const c = dados.classes.find(cc => cc.id === m.classe_id)
        const maxNivel = nivelTotal - multiclasses.filter(x => x.classe_id !== m.classe_id).reduce((s, x) => s + x.nivel, 0) - 1
        return (
          <div key={m.classe_id} className="space-y-2 pt-2 border-t border-[#B8860B]/10">
            <div className="flex items-center gap-2">
              <span className="text-[#F5F0E8] font-medium flex-1 text-sm">{c?.nome ?? m.classe_id}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setMulticlasseNivel(m.classe_id, m.nivel - 1)}
                  disabled={m.nivel <= 1}
                  className="w-6 h-6 rounded bg-[#2D2520] border border-[#B8860B]/20 text-[#F5F0E8] text-xs hover:bg-[#3D332D] disabled:opacity-30 cursor-pointer disabled:cursor-default"
                >−</button>
                <span className="w-6 text-center text-sm font-cinzel font-bold text-[#F5F0E8]">{m.nivel}</span>
                <button
                  type="button"
                  onClick={() => setMulticlasseNivel(m.classe_id, m.nivel + 1)}
                  disabled={m.nivel >= maxNivel}
                  className="w-6 h-6 rounded bg-[#2D2520] border border-[#B8860B]/20 text-[#F5F0E8] text-xs hover:bg-[#3D332D] disabled:opacity-30 cursor-pointer disabled:cursor-default"
                >+</button>
              </div>
              <button
                type="button"
                onClick={() => removeMulticlasse(m.classe_id)}
                className="text-[#A8A09B] hover:text-red-400 transition-colors text-sm px-1 cursor-pointer"
                aria-label={t('multiclass.remove')}
              >×</button>
            </div>
            {m.nivel >= 3 && (
              <select
                value={m.subclasse_id ?? ''}
                onChange={e => setSubclasseMulticlasse(m.classe_id, e.target.value || null)}
                className={`${SELECT_BASE} text-xs`}
              >
                <option value="">{t('edit.selectClass')}</option>
                {c?.subclasses.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
              </select>
            )}
          </div>
        )
      })}

      {/* Seletor para adicionar nova classe */}
      {addingClass && (
        <div className="space-y-2 pt-2 border-t border-[#B8860B]/10">
          <p className="text-xs text-[#A8A09B]">{t('multiclass.selectSecondary')}</p>
          <div className="flex flex-wrap gap-2">
            {classesDisponiveis.map(c => {
              const ok = checarPrerequisito(c.id)
              const prereq = MULTICLASSE_PREREQUISITOS[c.id]
              return (
                <div key={c.id} className="flex flex-col items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => { addMulticlasse(c.id); setAddingClass(false) }}
                    className={[
                      'px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer',
                      ok
                        ? 'border-[#B8860B]/40 text-[#F5F0E8] hover:bg-[#B8860B]/10 hover:border-[#B8860B]'
                        : 'border-red-800/40 text-[#A8A09B]',
                    ].join(' ')}
                  >
                    {c.nome}
                  </button>
                  {!ok && prereq && (
                    <span className="text-[9px] text-red-400">
                      {prereq.atributos.join(prereq.modo === 'ou' ? '/' : '+')} 13+
                    </span>
                  )}
                </div>
              )
            })}
          </div>
          <button
            type="button"
            onClick={() => setAddingClass(false)}
            className="text-xs text-[#A8A09B] hover:text-[#F5F0E8] transition-colors cursor-pointer"
          >
            {t('multiclass.cancel')}
          </button>
        </div>
      )}

      {multiclasses.length === 0 && !addingClass && (
        <p className="text-xs text-[#A8A09B]">
          {nivelTotal > 1 ? t('multiclass.noSecondary') : t('multiclass.needLevel2')}
        </p>
      )}
    </section>
  )
}

function SecaoAtributos() {
  const { ficha, setAtributos } = useFichaStore()
  const { t } = useTranslation()

  function setAttr(attr: AtributoId, novoVal: number) {
    const val = Math.max(1, Math.min(ATRIBUTO_MAX, novoVal))
    const current = ATRIBUTOS.reduce(
      (acc, a) => ({ ...acc, [a]: ficha.atributos[a].valor ?? 10 }),
      {} as Record<AtributoId, number>,
    )
    setAtributos({ ...current, [attr]: val })
  }

  return (
    <section aria-label={t('edit.attrs')} className={SECTION_CARD}>
      <h3 className={SECTION_TITLE}>{t('edit.attrs')}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {ATRIBUTOS.map(attr => {
          const val = ficha.atributos[attr].valor ?? 10
          const mod = calcModificador(val)
          const modPos = mod > 0
          const modNeg = mod < 0

          return (
            <div key={attr} className="flex flex-col gap-1">
              <label htmlFor={`edit-attr-${attr}`} className="text-sm text-[#B8860B] font-medium">
                {ATRIBUTO_NOMES[attr]}
              </label>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setAttr(attr, val - 1)}
                  disabled={val <= 1}
                  aria-label={t('edit.decreaseAttr', { attr: ATRIBUTO_NOMES[attr] })}
                  className="w-7 h-9 rounded-l bg-[#2D2520] border border-[#B8860B]/30 text-[#F5F0E8] font-bold hover:bg-[#4D4037] disabled:opacity-30 transition-colors cursor-pointer disabled:cursor-default"
                >−</button>
                <input
                  id={`edit-attr-${attr}`}
                  type="number"
                  min={1}
                  max={ATRIBUTO_MAX}
                  value={val}
                  onChange={e => setAttr(attr, Number(e.target.value))}
                  className="w-12 text-center bg-[#2D2520] border-y border-[#B8860B]/30 py-1.5 text-[#F5F0E8] font-cinzel font-bold text-lg focus:outline-none focus:ring-1 focus:ring-[#B8860B]"
                  aria-label={t('edit.attrValue', { attr: ATRIBUTO_NOMES[attr] })}
                />
                <button
                  onClick={() => setAttr(attr, val + 1)}
                  disabled={val >= ATRIBUTO_MAX}
                  aria-label={t('edit.increaseAttr', { attr: ATRIBUTO_NOMES[attr] })}
                  className="w-7 h-9 rounded-r bg-[#2D2520] border border-[#B8860B]/30 text-[#F5F0E8] font-bold hover:bg-[#4D4037] disabled:opacity-30 transition-colors cursor-pointer disabled:cursor-default"
                >+</button>
                <span
                  className={`ml-1 text-sm font-bold font-cinzel w-9 text-center ${modPos ? 'text-green-400' : modNeg ? 'text-red-400' : 'text-[#A8A09B]'}`}
                  aria-label={t('edit.modifier', { n: formatModificador(mod) })}
                >
                  {formatModificador(mod)}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function SecaoArmadura() {
  const { ficha, setArmadura } = useFichaStore()
  const { t } = useTranslation()
  const [itemInfo, setItemInfo] = useState<ItemDetalhe | null>(null)
  const armaduraId = ficha.combate.classe_de_armadura.armadura_equipada_id
  const armaduraAtual = dados.armaduras?.find(a => a.id === armaduraId)

  return (
    <section aria-label={t('edit.armor')} className={SECTION_CARD}>
      <h3 className={SECTION_TITLE}>{t('edit.armor')}</h3>
      <div className="flex flex-col gap-2">
        <label className="text-sm text-[#B8860B] font-medium">{t('edit.equippedArmor')}</label>
        <div className="flex gap-2 items-center">
          <select
            value={armaduraId ?? ''}
            onChange={e => setArmadura(e.target.value || null)}
            className={SELECT_BASE}
            aria-label={t('edit.equippedArmor')}
          >
            <option value="">{t('edit.noArmorOption')}</option>
            {dados.armaduras?.map(a => (
              <option key={a.id} value={a.id}>
                {a.nome} ({a.categoria} · CA {a.ca})
              </option>
            ))}
          </select>
          {armaduraAtual && (
            <button
              type="button"
              onClick={() => setItemInfo({ ...armaduraAtual, _tipo: 'armadura' })}
              aria-label={t('edit.viewDetails', { nome: armaduraAtual.nome })}
              className="w-8 h-8 shrink-0 flex items-center justify-center text-xs text-[#A8A09B] hover:text-[#F5F0E8] border border-[#B8860B]/20 hover:border-[#B8860B]/50 rounded-full transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B]"
            >
              ℹ
            </button>
          )}
        </div>
        {armaduraAtual && (
          <p className="text-xs text-[#A8A09B]">
            {armaduraAtual.custo_po ? `${armaduraAtual.custo_po} ${t('bag.gp')} · ` : ''}
            {armaduraAtual.peso_kg ? `${armaduraAtual.peso_kg} kg · ` : ''}
            CA {armaduraAtual.ca}
            {armaduraAtual.requisito_for ? ` · FOR mín. ${armaduraAtual.requisito_for}` : ''}
            {armaduraAtual.penalidade_furtividade ? ` · ${t('edit.forceStealthPenalty')}` : ''}
          </p>
        )}
      </div>

      {/* Lista de todas as armaduras */}
      <div className="space-y-1 pt-2">
        <p className="text-xs text-[#A8A09B] font-medium uppercase tracking-wide">{t('edit.reference')}</p>
        {dados.armaduras?.map(a => (
          <div key={a.id} className="flex items-center justify-between py-1 border-b border-[#B8860B]/10 last:border-0">
            <div>
              <span className="text-sm text-[#F5F0E8]">{a.nome}</span>
              <span className="text-xs text-[#A8A09B] ml-2">CA {a.ca} · {a.categoria}</span>
            </div>
            <button
              type="button"
              onClick={() => setItemInfo({ ...a, _tipo: 'armadura' })}
              aria-label={t('edit.viewDetails', { nome: a.nome })}
              className="w-6 h-6 shrink-0 flex items-center justify-center text-[10px] text-[#A8A09B] hover:text-[#F5F0E8] border border-[#B8860B]/20 hover:border-[#B8860B]/50 rounded-full transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B]"
            >
              ℹ
            </button>
          </div>
        ))}
      </div>

      <ItemCard item={itemInfo} onClose={() => setItemInfo(null)} />
    </section>
  )
}

function SecaoPericias() {
  const { ficha, setPericias } = useFichaStore()
  const { t } = useTranslation()
  const anteId = ficha.identidade.antecedente_id
  const ante = getAntecedentes().find(a => a.id === anteId)
  const antePerics = ante?.pericias ?? []

  function togglePericia(periciaId: string) {
    if (antePerics.includes(periciaId)) return
    const atual = dados.pericias
      .filter(p => ficha.pericias[p.id]?.proficiente)
      .map(p => p.id)
    const novaLista = atual.includes(periciaId)
      ? atual.filter(p => p !== periciaId)
      : [...atual, periciaId]
    setPericias(novaLista)
  }

  // Agrupar por atributo para facilitar leitura
  const atributosUnicos = [...new Set(dados.pericias.map(p => p.atributo))]

  return (
    <section aria-label={t('edit.skills')} className={SECTION_CARD}>
      <h3 className={SECTION_TITLE}>
        {t('edit.skills')}
        <span className="ml-2 text-xs font-normal text-[#A8A09B]">
          {t('edit.trainedCount', { n: dados.pericias.filter(p => ficha.pericias[p.id]?.proficiente).length })}
        </span>
      </h3>

      <div className="space-y-3">
        {atributosUnicos.map(atributo => (
          <div key={atributo}>
            <div className="text-xs text-[#A8A09B] font-semibold mb-1 uppercase tracking-wide">{atributo}</div>
            <div className="space-y-0.5">
              {dados.pericias.filter(p => p.atributo === atributo).map(p => {
                const fichaP = ficha.pericias[p.id]
                const proficiente = fichaP?.proficiente ?? false
                const expertise = fichaP?.expertise ?? false
                const isAnte = antePerics.includes(p.id)

                return (
                  <label
                    key={p.id}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer select-none transition-colors
                      ${proficiente ? 'bg-[#2D2520]' : 'hover:bg-[#2D2520]/50'}
                      ${isAnte ? 'opacity-70' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={proficiente}
                      onChange={() => togglePericia(p.id)}
                      disabled={isAnte}
                      className="w-3.5 h-3.5 accent-[#B8860B] cursor-pointer disabled:cursor-default"
                      aria-label={t('edit.skillProfAriaLabel', { attr: p.nome })}
                    />
                    <span className={`text-sm flex-1 ${proficiente ? 'text-[#F5F0E8]' : 'text-[#A8A09B]'}`}>
                      {p.nome}
                    </span>
                    {isAnte && <Badge variant="gold" className="text-[9px]">{t('edit.backgroundBadge')}</Badge>}
                    {expertise && <Badge variant="crimson" className="text-[9px]">{t('edit.expertiseBadge')}</Badge>}
                    {fichaP?._valor !== null && fichaP?._valor !== undefined && (
                      <span className={`text-xs font-bold min-w-[2rem] text-right ${(fichaP._valor) > 0 ? 'text-green-400' : 'text-[#A8A09B]'}`}>
                        {fichaP._valor >= 0 ? `+${fichaP._valor}` : fichaP._valor}
                      </span>
                    )}
                  </label>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function getMaxCirculoNaClasse(classeData: { progressao: unknown[] } | undefined, nivel: number): number {
  if (!classeData?.progressao) return 0
  const idx = Math.max(0, Math.min(nivel - 1, classeData.progressao.length - 1))
  const prog = classeData.progressao[idx] as Record<string, unknown>
  const espacos = prog?.espacos as Record<string, number> | undefined
  if (!espacos) return 0
  return Object.entries(espacos)
    .filter(([, v]) => v > 0)
    .reduce((acc, [k]) => Math.max(acc, parseInt(k.replace('c', ''))), 0)
}

function SecaoMagia() {
  const { ficha, atualizarMagia } = useFichaStore()
  const { t } = useTranslation()
  const { magia } = ficha
  const [circuloAtivo, setCirculoAtivo] = useState(1)
  const [busca, setBusca] = useState('')
  const [spellInfo, setSpellInfo] = useState<Magia | null>(null)

  const classeId = ficha.identidade.classe_id ?? ''
  const nivelTotal = ficha.identidade.nivel
  const multiclasses = ficha.identidade.multiclasses ?? []
  const nivelPrimaria = nivelTotal - multiclasses.reduce((s, m) => s + m.nivel, 0)

  const classe = dados.classes.find(c => c.id === classeId)

  // Para cada classe conjuradora do personagem, determina o máximo de círculo acessível
  // (baseado no nível NAQUELA classe, não no total — regra do D&D multiclasse)
  const classesParaMagias = useMemo<Array<{ classeId: string; maxCirculo: number }>>(() => {
    if (multiclasses.length === 0) {
      const mc = getMaxCirculoNaClasse(classe, nivelTotal)
      return [{ classeId, maxCirculo: mc > 0 ? mc : 9 }]
    }
    const result: Array<{ classeId: string; maxCirculo: number }> = []
    if (TIPO_CONJURADOR[classeId] != null) {
      const mc = getMaxCirculoNaClasse(classe, Math.max(1, nivelPrimaria))
      result.push({ classeId, maxCirculo: mc > 0 ? mc : 9 })
    }
    for (const m of multiclasses) {
      if (TIPO_CONJURADOR[m.classe_id] != null) {
        const mc2 = dados.classes.find(c => c.id === m.classe_id)
        const max = getMaxCirculoNaClasse(mc2, m.nivel)
        if (max > 0) result.push({ classeId: m.classe_id, maxCirculo: max })
      }
    }
    if (result.length === 0) result.push({ classeId, maxCirculo: 9 })
    return result
  }, [classeId, classe, nivelTotal, nivelPrimaria, multiclasses])

  const allClasseIds = useMemo(() => classesParaMagias.map(c => c.classeId), [classesParaMagias])

  // Progressão da classe primária no nível relevante (para exibir limites de truques/magias)
  const nivel = multiclasses.length === 0 ? nivelTotal : Math.max(1, nivelPrimaria)
  const prog = useMemo(() => {
    if (!classe?.progressao) return null
    return (classe.progressao[Math.max(0, nivel - 1)] ?? classe.progressao[0]) as Record<string, unknown> | null
  }, [classe, nivel])

  const truquesDisponiveis = useMemo(() => getTruquesPorClasses(allClasseIds), [allClasseIds])
  const magiasDisponiveis = useMemo(
    () => getMagiasPorClassesECirculos(classesParaMagias),
    [classesParaMagias],
  )

  const circulosDisponiveis = useMemo(() => {
    const circs = new Set(magiasDisponiveis.map(m => m.circulo))
    return Array.from(circs).sort((a, b) => a - b) as number[]
  }, [magiasDisponiveis])

  const truquesFiltrados = useMemo(
    () => truquesDisponiveis.filter(tr => !busca || tr.nome.toLowerCase().includes(busca.toLowerCase())),
    [truquesDisponiveis, busca],
  )

  const magiasDoCirculo = useMemo(
    () => magiasDisponiveis
      .filter(m => m.circulo === circuloAtivo)
      .filter(m => !busca || m.nome.toLowerCase().includes(busca.toLowerCase())),
    [magiasDisponiveis, circuloAtivo, busca],
  )

  function toggleTruque(nome: string) {
    const atual = magia.truques_conhecidos
    atualizarMagia({
      truques_conhecidos: atual.includes(nome)
        ? atual.filter(t => t !== nome)
        : [...atual, nome],
    })
  }

  function toggleMagia(nome: string) {
    const atual = magia.magias_preparadas
    atualizarMagia({
      magias_preparadas: atual.includes(nome)
        ? atual.filter(m => m !== nome)
        : [...atual, nome],
    })
  }

  if (!magia.conjurador) {
    return (
      <section aria-label={t('edit.magic')} className={SECTION_CARD}>
        <h3 className={SECTION_TITLE}>{t('edit.magic')}</h3>
        <p className="text-sm text-[#A8A09B]">{t('edit.notCaster')}</p>
      </section>
    )
  }

  const maxTruques = (prog?.truques as number | undefined) ?? 0
  const maxMagias = (prog?.magias_preparadas as number | undefined) ?? 0

  return (
    <section aria-label={t('edit.magic')} className={SECTION_CARD}>
      <h3 className={SECTION_TITLE}>{t('edit.magic')}</h3>

      <input
        type="text"
        value={busca}
        onChange={e => setBusca(e.target.value)}
        placeholder={t('edit.searchSpellsPlaceholder')}
        className="w-full bg-[#2D2520] border border-[#B8860B]/30 rounded-lg px-3 py-2 text-[#F5F0E8] text-sm placeholder:text-[#A8A09B] focus:outline-none focus:ring-1 focus:ring-[#B8860B]"
        aria-label={t('edit.searchSpellsAriaLabel')}
      />

      {/* Truques */}
      {truquesDisponiveis.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#B8860B] font-medium">{t('edit.cantrips')}</span>
            {maxTruques > 0 && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${magia.truques_conhecidos.length >= maxTruques ? 'bg-[#B8860B]/20 text-[#D4A017]' : 'bg-[#2D2520] text-[#A8A09B]'}`}>
                {magia.truques_conhecidos.length}/{maxTruques}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {truquesFiltrados.map(tr => {
              const sel = magia.truques_conhecidos.includes(tr.nome)
              return (
                <div key={tr.id} className="inline-flex items-center">
                  <button
                    type="button"
                    onClick={() => toggleTruque(tr.nome)}
                    aria-pressed={sel}
                    className={[
                      'pl-3 pr-2 py-1.5 rounded-l-full border-y border-l text-xs font-medium transition-colors cursor-pointer',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B]',
                      sel
                        ? 'bg-[#B8860B]/20 border-[#B8860B] text-[#D4A017]'
                        : 'border-[#B8860B]/30 text-[#A8A09B] hover:border-[#B8860B]/60 hover:text-[#F5F0E8]',
                    ].join(' ')}
                  >
                    {tr.nome}
                    {tr.concentracao && <span className="ml-1 opacity-60">C</span>}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpellInfo(tr)}
                    aria-label={t('edit.viewDetails', { nome: tr.nome })}
                    className={[
                      'inline-flex items-center justify-center w-6 py-1.5 rounded-r-full border-y border-r text-[10px] transition-colors cursor-pointer',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B]',
                      sel
                        ? 'bg-[#B8860B]/20 border-[#B8860B] text-[#D4A017] hover:bg-[#B8860B]/30'
                        : 'border-[#B8860B]/30 text-[#A8A09B] hover:border-[#B8860B]/60 hover:text-[#F5F0E8]',
                    ].join(' ')}
                  >
                    ℹ
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Magias por círculo */}
      {circulosDisponiveis.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#B8860B] font-medium">{t('edit.preparedSpells')}</span>
            {maxMagias > 0 && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${magia.magias_preparadas.length >= maxMagias ? 'bg-[#B8860B]/20 text-[#D4A017]' : 'bg-[#2D2520] text-[#A8A09B]'}`}>
                {magia.magias_preparadas.length}/{maxMagias}
              </span>
            )}
          </div>
          <div className="flex gap-1 overflow-x-auto pb-1" role="tablist">
            {circulosDisponiveis.map(c => (
              <button
                key={c}
                role="tab"
                aria-selected={circuloAtivo === c}
                onClick={() => setCirculoAtivo(c)}
                className={[
                  'px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B]',
                  circuloAtivo === c ? 'bg-[#B8860B] text-[#1A1612]' : 'bg-[#2D2520] text-[#A8A09B] hover:text-[#F5F0E8]',
                ].join(' ')}
              >
                {c}º
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2" role="tabpanel">
            {magiasDoCirculo.length === 0
              ? <p className="text-xs text-[#A8A09B]">{busca ? t('edit.noSpellsFound') : t('edit.noSpellsAvailable')}</p>
              : magiasDoCirculo.map(m => {
                  const sel = magia.magias_preparadas.includes(m.nome)
                  return (
                    <div key={m.id} className="inline-flex items-center">
                      <button
                        type="button"
                        onClick={() => toggleMagia(m.nome)}
                        aria-pressed={sel}
                        className={[
                          'pl-3 pr-2 py-1.5 rounded-l-full border-y border-l text-xs font-medium transition-colors cursor-pointer',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B]',
                          sel
                            ? 'bg-[#7B1D1D]/30 border-[#7B1D1D] text-[#F5F0E8]'
                            : 'border-[#B8860B]/20 text-[#A8A09B] hover:border-[#B8860B]/40 hover:text-[#F5F0E8]',
                        ].join(' ')}
                      >
                        {m.nome}
                        {m.concentracao && <span className="ml-1 opacity-60">C</span>}
                        {m.ritual && <span className="ml-1 opacity-60">R</span>}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSpellInfo(m)}
                        aria-label={t('edit.viewDetails', { nome: m.nome })}
                        className={[
                          'inline-flex items-center justify-center w-6 py-1.5 rounded-r-full border-y border-r text-[10px] transition-colors cursor-pointer',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B]',
                          sel
                            ? 'bg-[#7B1D1D]/30 border-[#7B1D1D] text-[#F5F0E8] hover:bg-[#7B1D1D]/50'
                            : 'border-[#B8860B]/20 text-[#A8A09B] hover:border-[#B8860B]/40 hover:text-[#F5F0E8]',
                        ].join(' ')}
                      >
                        ℹ
                      </button>
                    </div>
                  )
                })
            }
          </div>
        </div>
      )}

      <SpellCard magia={spellInfo} onClose={() => setSpellInfo(null)} />
    </section>
  )
}

function SecaoMochila() {
  const { t } = useTranslation()
  return (
    <section aria-label={t('edit.bag')} className={SECTION_CARD}>
      <h3 className={SECTION_TITLE}>{t('edit.bag')}</h3>
      <MochilaBusca />
    </section>
  )
}

