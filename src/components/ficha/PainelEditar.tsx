import { useState } from 'react'
import { useFichaStore } from '../../store/fichaStore'
import { calcModificador, formatModificador, ATRIBUTOS, ATRIBUTO_NOMES } from '../../lib/calculos'
import { Input } from '../ui/Input'
import Button from '../ui/Button'
import { Badge } from '../ui/Badge'
import dadosJson from '../../data/dnd_dados.json'
import type { DadosJogo, AtributoId } from '../../types'
import { NIVEL_MINIMO, NIVEL_MAXIMO } from '../../constants'

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

      <div className="grid grid-cols-2 gap-3">
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

      <div className="grid grid-cols-2 gap-3">
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
  const armaduraId = ficha.combate.classe_de_armadura.armadura_equipada_id
  const armaduraAtual = dados.armaduras?.find(a => a.id === armaduraId)

  return (
    <section aria-label="Armadura" className={SECTION_CARD}>
      <h3 className={SECTION_TITLE}>Armadura</h3>
      <div className="flex flex-col gap-2">
        <label className="text-sm text-[#B8860B] font-medium">Armadura Equipada</label>
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
          <p className="text-xs text-[#A8A09B]">
            {armaduraAtual.custo_po ? `${armaduraAtual.custo_po} PO · ` : ''}
            {armaduraAtual.peso_kg ? `${armaduraAtual.peso_kg} kg · ` : ''}
            CA {armaduraAtual.ca}
            {armaduraAtual.requisito_for ? ` · FOR mín. ${armaduraAtual.requisito_for}` : ''}
            {armaduraAtual.penalidade_furtividade ? ' · Penalidade Furtividade' : ''}
          </p>
        )}
      </div>
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
  const [novoTruque, setNovoTruque] = useState('')
  const [novaMagia, setNovaMagia] = useState('')

  function addTruque() {
    const nome = novoTruque.trim()
    if (!nome) return
    atualizarMagia({ truques_conhecidos: [...magia.truques_conhecidos, nome] })
    setNovoTruque('')
  }

  function removeTruque(nome: string) {
    atualizarMagia({ truques_conhecidos: magia.truques_conhecidos.filter(t => t !== nome) })
  }

  function addMagia() {
    const nome = novaMagia.trim()
    if (!nome) return
    atualizarMagia({ magias_preparadas: [...magia.magias_preparadas, nome] })
    setNovaMagia('')
  }

  function removeMagia(nome: string) {
    atualizarMagia({ magias_preparadas: magia.magias_preparadas.filter(m => m !== nome) })
  }

  if (!magia.conjurador) {
    return (
      <section aria-label="Magia" className={SECTION_CARD}>
        <h3 className={SECTION_TITLE}>Magia</h3>
        <p className="text-sm text-[#A8A09B]">Este personagem não é um conjurador. Mude a classe para habilitar.</p>
      </section>
    )
  }

  return (
    <section aria-label="Magia" className={SECTION_CARD}>
      <h3 className={SECTION_TITLE}>Magia</h3>

      {/* Truques */}
      <div className="space-y-2">
        <label className="text-sm text-[#B8860B] font-medium">Truques Conhecidos</label>
        <div className="flex flex-wrap gap-1 min-h-[32px]">
          {magia.truques_conhecidos.length === 0 && (
            <span className="text-xs text-[#A8A09B]">Nenhum truque adicionado.</span>
          )}
          {magia.truques_conhecidos.map(t => (
            <span key={t} className="inline-flex items-center gap-1 text-xs bg-[#2D2520] border border-[#B8860B]/20 rounded-full px-2 py-0.5 text-[#F5F0E8]">
              {t}
              <button
                onClick={() => removeTruque(t)}
                aria-label={`Remover truque ${t}`}
                className="text-[#A8A09B] hover:text-red-400 transition-colors cursor-pointer leading-none"
              >×</button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={novoTruque}
            onChange={e => setNovoTruque(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTruque()}
            placeholder="Nome do truque..."
            aria-label="Nome do truque a adicionar"
            className="flex-1 bg-[#2D2520] border border-[#B8860B]/30 rounded px-2 py-1.5 text-[#F5F0E8] text-sm focus:outline-none focus:ring-1 focus:ring-[#B8860B] placeholder:text-[#A8A09B]"
          />
          <Button size="sm" onClick={addTruque} disabled={!novoTruque.trim()}>+ Adicionar</Button>
        </div>
      </div>

      {/* Magias preparadas */}
      <div className="space-y-2">
        <label className="text-sm text-[#B8860B] font-medium">Magias Preparadas</label>
        <div className="flex flex-wrap gap-1 min-h-[32px]">
          {magia.magias_preparadas.length === 0 && (
            <span className="text-xs text-[#A8A09B]">Nenhuma magia preparada.</span>
          )}
          {magia.magias_preparadas.map(m => (
            <span key={m} className="inline-flex items-center gap-1 text-xs bg-[#2D2520] border border-[#7B1D1D]/20 rounded-full px-2 py-0.5 text-[#F5F0E8]">
              {m}
              <button
                onClick={() => removeMagia(m)}
                aria-label={`Remover magia ${m}`}
                className="text-[#A8A09B] hover:text-red-400 transition-colors cursor-pointer leading-none"
              >×</button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={novaMagia}
            onChange={e => setNovaMagia(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addMagia()}
            placeholder="Nome da magia..."
            aria-label="Nome da magia a adicionar"
            className="flex-1 bg-[#2D2520] border border-[#B8860B]/30 rounded px-2 py-1.5 text-[#F5F0E8] text-sm focus:outline-none focus:ring-1 focus:ring-[#B8860B] placeholder:text-[#A8A09B]"
          />
          <Button size="sm" onClick={addMagia} disabled={!novaMagia.trim()}>+ Adicionar</Button>
        </div>
      </div>
    </section>
  )
}

