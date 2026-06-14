import { useNavigate } from 'react-router-dom'
import { useFichaStore } from '../../store/fichaStore'
import { WizardNav } from './WizardNav'
import { formatModificador, ATRIBUTOS, ATRIBUTO_NOMES } from '../../lib/calculos'
import dadosJson from '../../data/dnd_dados.json'
import type { DadosJogo } from '../../types'

const dados = dadosJson as unknown as DadosJogo

export function Step12Revisar() {
  const { ficha, fichaId, setPasso, salvarLocal } = useFichaStore()
  const navigate = useNavigate()
  const id = ficha.identidade

  const classe = dados.classes.find(c => c.id === id.classe_id)
  const especie = dados.especies?.find(e => e.id === id.especie_id)
  const ante = dados.antecedentes?.find(a => a.id === id.antecedente_id)
  const subclasse = classe?.subclasses.find(s => s.id === id.subclasse_id)

  function criar() {
    salvarLocal()
    if (fichaId) navigate(`/ficha/${fichaId}`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-cinzel text-2xl font-bold text-[#F5F0E8] mb-1">Revisar e Concluir</h2>
        <p className="text-[#A8A09B] text-sm">Confira tudo antes de criar o personagem.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[#3D332D] border border-[#B8860B]/30 rounded-lg p-4 space-y-2">
          <h3 className="font-cinzel font-semibold text-[#B8860B]">Identidade</h3>
          <div className="text-sm space-y-1">
            <p><span className="text-[#A8A09B]">Nome:</span> <span className="text-[#F5F0E8]">{id.nome_personagem ?? '—'}</span></p>
            <p><span className="text-[#A8A09B]">Nível:</span> <span className="text-[#F5F0E8]">{id.nivel}</span></p>
            <p><span className="text-[#A8A09B]">Classe:</span> <span className="text-[#F5F0E8]">{classe?.nome ?? '—'}</span></p>
            <p><span className="text-[#A8A09B]">Subclasse:</span> <span className="text-[#F5F0E8]">{subclasse?.nome ?? (id.nivel < 3 ? 'N/A (nível < 3)' : '—')}</span></p>
            <p><span className="text-[#A8A09B]">Espécie:</span> <span className="text-[#F5F0E8]">{especie?.nome ?? '—'}</span></p>
            <p><span className="text-[#A8A09B]">Antecedente:</span> <span className="text-[#F5F0E8]">{ante?.nome ?? '—'}</span></p>
            <p><span className="text-[#A8A09B]">Alinhamento:</span> <span className="text-[#F5F0E8]">{id.alinhamento.etico} {id.alinhamento.moral}</span></p>
          </div>
        </div>

        <div className="bg-[#3D332D] border border-[#B8860B]/30 rounded-lg p-4">
          <h3 className="font-cinzel font-semibold text-[#B8860B] mb-2">Atributos</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ATRIBUTOS.map(a => {
              const val = ficha.atributos[a].valor
              const mod = ficha.atributos[a]._modificador
              return (
                <div key={a} className="text-center">
                  <div className="text-xs text-[#A8A09B]">{ATRIBUTO_NOMES[a].slice(0, 3)}</div>
                  <div className="font-cinzel font-bold text-xl text-[#F5F0E8]">{val ?? '—'}</div>
                  <div className={`text-xs font-semibold ${(mod ?? 0) > 0 ? 'text-green-400' : (mod ?? 0) < 0 ? 'text-red-400' : 'text-[#A8A09B]'}`}>
                    {mod !== null ? formatModificador(mod) : ''}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-[#3D332D] border border-[#B8860B]/30 rounded-lg p-4">
          <h3 className="font-cinzel font-semibold text-[#B8860B] mb-2">Combate</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <p><span className="text-[#A8A09B]">PV máximo:</span> <span className="text-[#F5F0E8] font-bold">{ficha.combate.pontos_de_vida.maximo ?? '—'}</span></p>
            <p><span className="text-[#A8A09B]">CA:</span> <span className="text-[#F5F0E8] font-bold">{ficha.combate.classe_de_armadura.valor ?? '—'}</span></p>
            <p><span className="text-[#A8A09B]">Iniciativa:</span> <span className="text-[#F5F0E8] font-bold">{ficha.combate.iniciativa._valor !== null ? formatModificador(ficha.combate.iniciativa._valor) : '—'}</span></p>
            <p><span className="text-[#A8A09B]">Deslocamento:</span> <span className="text-[#F5F0E8] font-bold">{ficha.combate.deslocamento._total_metros ?? '—'}m</span></p>
            <p><span className="text-[#A8A09B]">Bônus Prof.:</span> <span className="text-[#F5F0E8] font-bold">{ficha.combate._bonus_proficiencia !== null ? `+${ficha.combate._bonus_proficiencia}` : '—'}</span></p>
            <p><span className="text-[#A8A09B]">Dado de vida:</span> <span className="text-[#F5F0E8] font-bold">{ficha.combate.dados_de_vida.tipo ?? '—'}</span></p>
          </div>
        </div>

        <div className="bg-[#3D332D] border border-[#B8860B]/30 rounded-lg p-4">
          <h3 className="font-cinzel font-semibold text-[#B8860B] mb-2">Perícias Treinadas</h3>
          <div className="flex flex-wrap gap-1">
            {Object.entries(ficha.pericias)
              .filter(([, v]) => v.proficiente)
              .map(([id]) => {
                const p = dados.pericias.find(p => p.id === id)
                return <span key={id} className="text-xs bg-[#2D2520] border border-[#B8860B]/20 rounded px-2 py-0.5 text-[#B8860B]">{p?.nome ?? id}</span>
              })}
          </div>
        </div>
      </div>

      <div className="bg-[#3D332D] border border-[#B8860B]/30 rounded-lg p-4">
        <h3 className="font-cinzel font-semibold text-[#B8860B] mb-2">Idiomas</h3>
        <p className="text-sm text-[#F5F0E8]">{ficha.proficiencias.idiomas.join(', ') || '—'}</p>
      </div>

      <WizardNav
        onBack={() => setPasso(11)}
        onNext={criar}
        isLast
        nextLabel="Criar Personagem"
        nextDisabled={!id.classe_id || !id.especie_id}
      />
    </div>
  )
}
