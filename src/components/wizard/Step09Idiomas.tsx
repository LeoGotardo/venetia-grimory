import { useFichaStore } from '../../store/fichaStore'
import { WizardNav } from './WizardNav'
import { Badge } from '../ui/Badge'
import dadosJson from '../../data/dnd_dados.json'
import type { DadosJogo } from '../../types'

const dados = dadosJson as unknown as DadosJogo

const IDIOMAS_FIXOS_POR_CLASSE: Record<string, string[]> = {
  druida: ['druidico'],
  ladino: ['giria_dos_ladroes'],
}

export function Step09Idiomas() {
  const { ficha, setIdiomas, setPasso } = useFichaStore()
  const classeId = ficha.identidade.classe_id ?? ''
  const idiomasFixos = ['comum', ...(IDIOMAS_FIXOS_POR_CLASSE[classeId] ?? [])]
  const idiomasSelecionados = ficha.proficiencias.idiomas
  const idiomasLivres = idiomasSelecionados.filter(i => !idiomasFixos.includes(i))

  function toggleIdioma(idiomaId: string, tipo: 'comum' | 'raro') {
    if (idiomasFixos.includes(idiomaId)) return
    const novo = idiomasSelecionados.includes(idiomaId)
      ? idiomasSelecionados.filter(i => i !== idiomaId)
      : [...idiomasSelecionados, idiomaId]
    setIdiomas(novo)
  }

  const todos = [...idiomasFixos, ...idiomasLivres]
  const maxLivres = 2

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-cinzel text-2xl font-bold text-[#F5F0E8] mb-1">Idiomas</h2>
        <p className="text-[#A8A09B] text-sm">
          Escolha mais {maxLivres} idiomas.{' '}
          <span className="text-[#B8860B]">{idiomasLivres.length}/{maxLivres} escolhidos</span>
        </p>
      </div>

      <div className="flex flex-wrap gap-2 p-3 bg-[#3D332D] rounded-lg border border-[#B8860B]/20">
        <span className="text-xs text-[#A8A09B] w-full mb-1">Idiomas atuais:</span>
        {todos.map(id => {
          const idioma = [...dados.idiomas.comuns, ...dados.idiomas.raros].find(i => i.id === id)
          return (
            <Badge key={id} variant={idiomasFixos.includes(id) ? 'gold' : 'blue'}>
              {idioma?.nome ?? id}
              {!idiomasFixos.includes(id) && (
                <button onClick={() => toggleIdioma(id, 'comum')} className="ml-1 hover:text-red-400 cursor-pointer">×</button>
              )}
            </Badge>
          )
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <h3 className="font-cinzel font-semibold text-[#B8860B] mb-3">Idiomas Comuns</h3>
          <div className="space-y-1">
            {dados.idiomas.comuns.map(i => {
              const isFixed = idiomasFixos.includes(i.id)
              const isSel = idiomasSelecionados.includes(i.id)
              const bloqueado = isFixed || (!isSel && idiomasLivres.length >= maxLivres)
              return (
                <button
                  key={i.id}
                  onClick={() => !isFixed && toggleIdioma(i.id, 'comum')}
                  disabled={bloqueado && !isSel}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded text-left transition-colors cursor-pointer disabled:cursor-default
                    ${isSel ? 'bg-[#3D332D] border border-[#B8860B]/30' : 'hover:bg-[#3D332D]'}
                    ${bloqueado && !isSel ? 'opacity-40' : ''}`}
                >
                  <span className={`w-3 h-3 rounded-full ${isSel ? 'bg-[#B8860B]' : 'border border-[#6B6560]'}`} />
                  <span className="text-sm text-[#F5F0E8]">{i.nome}</span>
                  <span className="text-xs text-[#A8A09B] ml-auto">{i.origem}</span>
                  {isFixed && <span className="text-xs text-[#B8860B]">Fixo</span>}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <h3 className="font-cinzel font-semibold text-[#B8860B] mb-2">Idiomas Raros</h3>
          <p className="text-xs text-[#A8A09B] mb-3">Incomuns — requer aprovação do mestre.</p>
          <div className="space-y-1">
            {dados.idiomas.raros.map(i => {
              const isSel = idiomasSelecionados.includes(i.id)
              const bloqueado = !isSel && idiomasLivres.length >= maxLivres
              return (
                <button
                  key={i.id}
                  onClick={() => toggleIdioma(i.id, 'raro')}
                  disabled={bloqueado}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded text-left transition-colors cursor-pointer disabled:cursor-default
                    ${isSel ? 'bg-[#4D2020] border border-[#7B1D1D]/30' : 'hover:bg-[#3D332D]'}
                    ${bloqueado ? 'opacity-40' : ''}`}
                >
                  <span className={`w-3 h-3 rounded-full ${isSel ? 'bg-[#7B1D1D]' : 'border border-[#6B6560]'}`} />
                  <span className="text-sm text-[#F5F0E8]">{i.nome}</span>
                  <span className="text-xs text-[#A8A09B] ml-auto">{i.origem}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <WizardNav onBack={() => setPasso(8)} onNext={() => setPasso(10)} nextDisabled={idiomasLivres.length < maxLivres} />
    </div>
  )
}
