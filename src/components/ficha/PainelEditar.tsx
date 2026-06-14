import { useMemo, useState } from 'react'
import { useFichaStore } from '../../store/fichaStore'
import { calcModificador, formatModificador, ATRIBUTOS, ATRIBUTO_NOMES } from '../../lib/calculos'
import { Input } from '../ui/Input'
import Button from '../ui/Button'
import { Badge } from '../ui/Badge'
import dadosJson from '../../data/dnd_dados.json'
import type { DadosJogo, AtributoId } from '../../types'
import { NIVEL_MINIMO, NIVEL_MAXIMO } from '../../constants'
import { getTruquesPorClasse, getMagiasPorClasseECirculo } from '../../data/magias'
import type { Magia } from '../../data/magias'
import { SpellCard } from '../ui/SpellCard'
import { ItemCard } from '../ui/ItemCard'
import type { ItemDetalhe } from '../ui/ItemCard'
import { MochilaBusca } from '../ui/MochilaBusca'

const dados = dadosJson as unknown as DadosJogo

const ALINHAMENTOS_ETICO = ['Leal', 'Neutro', 'Caótico'] as const
const ALINHAMENTOS_MORAL = ['Bom', 'Neutro', 'Mau'] as const
const ATRIBUTO_MAX = 30

const SELECT_BASE = 'w-full bg-[#2D2520] border border-[#B8860B]/30 rounded px-2 py-2 text-[#F5F0E8] text-sm focus:outline-none focus:ring-1 focus:ring-[#B8860B]'
const SECTION_CARD = 'bg-[#3D332D] border border-[#B8860B]/20 rounded-xl p-4 space-y-4'
const SECTION_TITLE = 'font-cinzel font-semibold text-[#B8860B] pb-2 border-b border-[#B8860B]/20'

export function PainelEditar() {
  return (
    <div className="space-y-5 max-w-2xl">
      <p className="text-xs text-[#A8A09B] bg-[#3D332D] border border-[#B8860B]/20 rounded-lg px-3 py-2">
        ✦ Todas as alterações são salvas automaticamente.
      </p>
      <SecaoInformacoes />
      <SecaoProgressao />
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
  const id = ficha.identidade

  return (
    <section aria-label="Informações básicas" className={SECTION_CARD}>
      <h3 className={SECTION_TITLE}>Informações Básicas</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Nome do Personagem"
          value={id.nome_personagem ?? ''}
          onChange={e => setIdentidade({ nome_personagem: e.target.value })}
          placeholder="Nome do herói..."
        />
        <Input
          label="Nome do Jogador"
          value={id.nome_jogador ?? ''}
          onChange={e => setIdentidade({ nome_jogador: e.target.value })}
          placeholder="Seu nome..."
        />
        <Input
          label="Campanha"
          value={id.campanha ?? ''}
          onChange={e => setIdentidade({ campanha: e.target.value })}
          placeholder="Nome da campanha..."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-[#B8860B] font-medium">Alinhamento Ético</label>
          <select
            value={id.alinhamento.etico ?? ''}
            onChange={e => setIdentidade({ alinhamento: { ...id.alinhamento, etico: e.target.value || null } })}
            className={SELECT_BASE}
          >
            <option value="">—</option>
            {ALINHAMENTOS_ETICO.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-[#B8860B] font-medium">Alinhamento Moral</label>
          <select
            value={id.alinhamento.moral ?? ''}
            onChange={e => setIdentidade({ alinhamento: { ...id.alinhamento, moral: e.target.value || null } })}
            className={SELECT_BASE}
          >
            <option value="">—</option>
            {ALINHAMENTOS_MORAL.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>
    </section>
  )
}

function SecaoProgressao() {
  const { ficha, setNivel, setIdentidade, setClasse, setSubclasse, setEspecie, setAntecedenteId } = useFichaStore()
  const id = ficha.identidade
  const nivel = id.nivel
  const classe = dados.classes.find(c => c.id === id.classe_id)
  const especie = dados.especies?.find(e => e.id === id.especie_id)

  return (
    <section aria-label="Progressão" className={SECTION_CARD}>
      <h3 className={SECTION_TITLE}>Progressão</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Nível */}
        <div className="flex flex-col gap-1">
          <label htmlFor="edit-nivel" className="text-sm text-[#B8860B] font-medium">Nível</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setNivel(Math.max(NIVEL_MINIMO, nivel - 1))}
              className="w-8 h-8 rounded bg-[#2D2520] border border-[#B8860B]/30 text-[#F5F0E8] font-bold hover:bg-[#4D4037] transition-colors cursor-pointer"
              aria-label="Diminuir nível"
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
              aria-label="Aumentar nível"
            >+</button>
          </div>
        </div>

        {/* XP */}
        <div className="flex flex-col gap-1">
          <label htmlFor="edit-xp" className="text-sm text-[#B8860B] font-medium">XP</label>
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
          <label className="text-sm text-[#B8860B] font-medium">Classe</label>
          <select
            value={id.classe_id ?? ''}
            onChange={e => setClasse(e.target.value)}
            className={SELECT_BASE}
          >
            <option value="">— Selecionar —</option>
            {dados.classes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </div>

        {/* Subclasse (somente nível ≥ 3) */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-[#B8860B] font-medium">
            Subclasse {nivel < 3 && <span className="text-[#A8A09B] text-xs">(nível 3+)</span>}
          </label>
          <select
            value={id.subclasse_id ?? ''}
            onChange={e => setSubclasse(e.target.value || null)}
            disabled={!id.classe_id || nivel < 3}
            className={`${SELECT_BASE} disabled:opacity-40`}
          >
            <option value="">— Selecionar —</option>
            {classe?.subclasses.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
          </select>
        </div>

        {/* Espécie */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-[#B8860B] font-medium">Espécie</label>
          <select
            value={id.especie_id ?? ''}
            onChange={e => setEspecie(e.target.value)}
            className={SELECT_BASE}
          >
            <option value="">— Selecionar —</option>
            {dados.especies?.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
          </select>
        </div>

        {/* Linhagem (se espécie tem linhagens) */}
        {especie?.linhagens && especie.linhagens.length > 0 && (
          <div className="flex flex-col gap-1">
            <label className="text-sm text-[#B8860B] font-medium">Linhagem</label>
            <select
              value={id.linhagem_id ?? ''}
              onChange={e => setEspecie(id.especie_id!, e.target.value || undefined)}
              className={SELECT_BASE}
            >
              <option value="">— Selecionar —</option>
              {especie.linhagens.map(l => <option key={l.id} value={l.id}>{l.nome}</option>)}
            </select>
          </div>
        )}

        {/* Antecedente */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-[#B8860B] font-medium">Antecedente</label>
          <select
            value={id.antecedente_id ?? ''}
            onChange={e => setAntecedenteId(e.target.value)}
            className={SELECT_BASE}
          >
            <option value="">— Selecionar —</option>
            {dados.antecedentes?.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
          </select>
        </div>
      </div>
    </section>
  )
}

function SecaoAtributos() {
  const { ficha, setAtributos } = useFichaStore()

  function setAttr(attr: AtributoId, novoVal: number) {
    const val = Math.max(1, Math.min(ATRIBUTO_MAX, novoVal))
    const current = ATRIBUTOS.reduce(
      (acc, a) => ({ ...acc, [a]: ficha.atributos[a].valor ?? 10 }),
      {} as Record<AtributoId, number>,
    )
    setAtributos({ ...current, [attr]: val })
  }

  return (
    <section aria-label="Atributos" className={SECTION_CARD}>
      <h3 className={SECTION_TITLE}>Atributos</h3>
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
                  aria-label={`Diminuir ${ATRIBUTO_NOMES[attr]}`}
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
                  aria-label={`Valor de ${ATRIBUTO_NOMES[attr]}`}
                />
                <button
                  onClick={() => setAttr(attr, val + 1)}
                  disabled={val >= ATRIBUTO_MAX}
                  aria-label={`Aumentar ${ATRIBUTO_NOMES[attr]}`}
                  className="w-7 h-9 rounded-r bg-[#2D2520] border border-[#B8860B]/30 text-[#F5F0E8] font-bold hover:bg-[#4D4037] disabled:opacity-30 transition-colors cursor-pointer disabled:cursor-default"
                >+</button>
                <span
                  className={`ml-1 text-sm font-bold font-cinzel w-9 text-center ${modPos ? 'text-green-400' : modNeg ? 'text-red-400' : 'text-[#A8A09B]'}`}
                  aria-label={`Modificador: ${formatModificador(mod)}`}
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
  const [itemInfo, setItemInfo] = useState<ItemDetalhe | null>(null)
  const armaduraId = ficha.combate.classe_de_armadura.armadura_equipada_id
  const armaduraAtual = dados.armaduras?.find(a => a.id === armaduraId)

  return (
    <section aria-label="Armadura" className={SECTION_CARD}>
      <h3 className={SECTION_TITLE}>Armadura</h3>
      <div className="flex flex-col gap-2">
        <label className="text-sm text-[#B8860B] font-medium">Armadura Equipada</label>
        <div className="flex gap-2 items-center">
          <select
            value={armaduraId ?? ''}
            onChange={e => setArmadura(e.target.value || null)}
            className={SELECT_BASE}
            aria-label="Selecionar armadura"
          >
            <option value="">Sem armadura (CA = 10 + mod DES)</option>
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
              aria-label={`Ver detalhes de ${armaduraAtual.nome}`}
              className="w-8 h-8 shrink-0 flex items-center justify-center text-xs text-[#A8A09B] hover:text-[#F5F0E8] border border-[#B8860B]/20 hover:border-[#B8860B]/50 rounded-full transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B]"
            >
              ℹ
            </button>
          )}
        </div>
        {armaduraAtual && (
          <p className="text-xs text-[#A8A09B]">
            {armaduraAtual.custo_po ? `${armaduraAtual.custo_po} PO · ` : ''}
            {armaduraAtual.peso_kg ? `${armaduraAtual.peso_kg} kg · ` : ''}
            CA {armaduraAtual.ca}
            {armaduraAtual.requisito_for ? ` · FOR mín. ${armaduraAtual.requisito_for}` : ''}
            {armaduraAtual.penalidade_furtividade ? ' · Penalidade Furtividade' : ''}
          </p>
        )}
      </div>

      {/* Lista de todas as armaduras */}
      <div className="space-y-1 pt-2">
        <p className="text-xs text-[#A8A09B] font-medium uppercase tracking-wide">Referência</p>
        {dados.armaduras?.map(a => (
          <div key={a.id} className="flex items-center justify-between py-1 border-b border-[#B8860B]/10 last:border-0">
            <div>
              <span className="text-sm text-[#F5F0E8]">{a.nome}</span>
              <span className="text-xs text-[#A8A09B] ml-2">CA {a.ca} · {a.categoria}</span>
            </div>
            <button
              type="button"
              onClick={() => setItemInfo({ ...a, _tipo: 'armadura' })}
              aria-label={`Ver detalhes de ${a.nome}`}
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
  const anteId = ficha.identidade.antecedente_id
  const classeId = ficha.identidade.classe_id
  const ante = dados.antecedentes?.find(a => a.id === anteId)
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
    <section aria-label="Perícias" className={SECTION_CARD}>
      <h3 className={SECTION_TITLE}>
        Perícias
        <span className="ml-2 text-xs font-normal text-[#A8A09B]">
          {dados.pericias.filter(p => ficha.pericias[p.id]?.proficiente).length} treinadas
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
                      aria-label={`${p.nome} proficiente`}
                    />
                    <span className={`text-sm flex-1 ${proficiente ? 'text-[#F5F0E8]' : 'text-[#A8A09B]'}`}>
                      {p.nome}
                    </span>
                    {isAnte && <Badge variant="gold" className="text-[9px]">Ante.</Badge>}
                    {expertise && <Badge variant="crimson" className="text-[9px]">Expert.</Badge>}
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

function SecaoMagia() {
  const { ficha, atualizarMagia } = useFichaStore()
  const { magia } = ficha
  const [circuloAtivo, setCirculoAtivo] = useState(1)
  const [busca, setBusca] = useState('')
  const [spellInfo, setSpellInfo] = useState<Magia | null>(null)

  const classeId = ficha.identidade.classe_id ?? ''
  const nivel = ficha.identidade.nivel

  const classe = dados.classes.find(c => c.id === classeId)
  const prog = useMemo(() => {
    if (!classe?.progressao) return null
    return classe.progressao[nivel - 1] ?? classe.progressao[0]
  }, [classe, nivel])

  const maxCirculo = useMemo(() => {
    const espacos = (prog as Record<string, unknown> | null)?.espacos as Record<string, number> | undefined
    if (!espacos) return 9
    const max = Object.entries(espacos)
      .filter(([, v]) => v > 0)
      .reduce((acc, [k]) => Math.max(acc, parseInt(k.replace('c', ''))), 0)
    return max > 0 ? max : 9
  }, [prog])

  const truquesDisponiveis = useMemo(() => getTruquesPorClasse(classeId), [classeId])
  const magiasDisponiveis = useMemo(
    () => getMagiasPorClasseECirculo(classeId, maxCirculo),
    [classeId, maxCirculo],
  )

  const circulosDisponiveis = useMemo(() => {
    const circs = new Set(magiasDisponiveis.map(m => m.circulo))
    return Array.from(circs).sort((a, b) => a - b) as number[]
  }, [magiasDisponiveis])

  const truquesFiltrados = useMemo(
    () => truquesDisponiveis.filter(t => !busca || t.nome.toLowerCase().includes(busca.toLowerCase())),
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
      <section aria-label="Magia" className={SECTION_CARD}>
        <h3 className={SECTION_TITLE}>Magia</h3>
        <p className="text-sm text-[#A8A09B]">Este personagem não é um conjurador. Mude a classe para habilitar.</p>
      </section>
    )
  }

  const progRaw = prog as Record<string, unknown> | null
  const maxTruques = (progRaw?.truques as number | undefined) ?? 0
  const maxMagias = (progRaw?.magias_preparadas as number | undefined) ?? 0

  return (
    <section aria-label="Magia" className={SECTION_CARD}>
      <h3 className={SECTION_TITLE}>Magia</h3>

      <input
        type="text"
        value={busca}
        onChange={e => setBusca(e.target.value)}
        placeholder="Buscar magia ou truque..."
        className="w-full bg-[#2D2520] border border-[#B8860B]/30 rounded-lg px-3 py-2 text-[#F5F0E8] text-sm placeholder:text-[#A8A09B] focus:outline-none focus:ring-1 focus:ring-[#B8860B]"
        aria-label="Buscar magia ou truque"
      />

      {/* Truques */}
      {truquesDisponiveis.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#B8860B] font-medium">Truques</span>
            {maxTruques > 0 && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${magia.truques_conhecidos.length >= maxTruques ? 'bg-[#B8860B]/20 text-[#D4A017]' : 'bg-[#2D2520] text-[#A8A09B]'}`}>
                {magia.truques_conhecidos.length}/{maxTruques}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {truquesFiltrados.map(t => {
              const sel = magia.truques_conhecidos.includes(t.nome)
              return (
                <div key={t.id} className="inline-flex items-center">
                  <button
                    type="button"
                    onClick={() => toggleTruque(t.nome)}
                    aria-pressed={sel}
                    className={[
                      'pl-3 pr-2 py-1.5 rounded-l-full border-y border-l text-xs font-medium transition-colors cursor-pointer',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B]',
                      sel
                        ? 'bg-[#B8860B]/20 border-[#B8860B] text-[#D4A017]'
                        : 'border-[#B8860B]/30 text-[#A8A09B] hover:border-[#B8860B]/60 hover:text-[#F5F0E8]',
                    ].join(' ')}
                  >
                    {t.nome}
                    {t.concentracao && <span className="ml-1 opacity-60">C</span>}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpellInfo(t)}
                    aria-label={`Ver detalhes de ${t.nome}`}
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
            <span className="text-sm text-[#B8860B] font-medium">Magias Preparadas</span>
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
              ? <p className="text-xs text-[#A8A09B]">{busca ? 'Nenhuma magia encontrada.' : 'Nenhuma magia disponível.'}</p>
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
                        aria-label={`Ver detalhes de ${m.nome}`}
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
  return (
    <section aria-label="Mochila" className={SECTION_CARD}>
      <h3 className={SECTION_TITLE}>Mochila</h3>
      <MochilaBusca />
    </section>
  )
}

