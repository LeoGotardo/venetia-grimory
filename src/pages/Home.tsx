import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFichaStore } from '../store/fichaStore'
import { useFichaExport } from '../hooks/useFichaExport'
import Button from '../components/ui/Button'
import type { FichaListItem } from '../store/fichaStore'
import dadosJson from '../data/dnd_dados.json'
import type { DadosJogo } from '../types'

const dados = dadosJson as unknown as DadosJogo

export function Home() {
  const navigate = useNavigate()
  const { fichasSalvas, novaFicha, carregarFicha, deletarFicha, carregarListaSalvas } = useFichaStore()
  const { exportarPorId, importar } = useFichaExport()

  useEffect(() => {
    carregarListaSalvas()
  }, [carregarListaSalvas])

  const fichasOrdenadas = useMemo(
    () => [...fichasSalvas].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [fichasSalvas],
  )

  function handleNova() {
    novaFicha()
    navigate('/novo')
  }

  function handleCarregar(id: string) {
    carregarFicha(id)
    navigate(`/ficha/${id}`)
  }

  function handleDeletar(ficha: FichaListItem) {
    if (!confirm(`Deletar "${ficha.nome}"? Esta ação não pode ser desfeita.`)) return
    deletarFicha(ficha.id)
  }

  return (
    <div className="min-h-screen bg-[#2D2520]">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Header />

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
          <Button size="lg" onClick={handleNova} className="font-cinzel text-lg">
            ✦ Criar Personagem
          </Button>
          <Button size="lg" variant="secondary" onClick={importar}>
            📥 Importar JSON
          </Button>
        </div>

        {fichasOrdenadas.length > 0 ? (
          <section aria-label="Personagens salvos">
            <h2 className="font-cinzel text-xl font-semibold text-[#B8860B] mb-4">
              Personagens Salvos
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {fichasOrdenadas.map(f => (
                <FichaCard
                  key={f.id}
                  ficha={f}
                  onCarregar={() => handleCarregar(f.id)}
                  onExportar={() => exportarPorId(f.id, f.nome)}
                  onDeletar={() => handleDeletar(f)}
                />
              ))}
            </div>
          </section>
        ) : (
          <ListaVazia />
        )}
      </div>
    </div>
  )
}

function Header() {
  return (
    <div className="text-center mb-12">
      <div className="text-6xl mb-4">⚔️</div>
      <h1 className="font-cinzel text-5xl font-bold text-[#F5F0E8] mb-2">
        Grimório de Venetia
      </h1>
      <p className="text-[#B8860B] text-lg font-cinzel">
        Criador de Personagens D&D 5.5 (2024)
      </p>
      <p className="text-[#A8A09B] text-sm mt-2">
        {dados.meta.fonte} · {dados.meta.traducao}
      </p>
    </div>
  )
}

interface FichaCardProps {
  ficha: FichaListItem
  onCarregar: () => void
  onExportar: () => void
  onDeletar: () => void
}

function FichaCard({ ficha, onCarregar, onExportar, onDeletar }: FichaCardProps) {
  const classe = dados.classes.find(c => c.id === ficha.classe)
  const especie = dados.especies?.find(e => e.id === ficha.especie)
  const dataFormatada = new Date(ficha.updatedAt).toLocaleDateString('pt-BR')

  return (
    <div className="bg-[#3D332D] border border-[#B8860B]/30 rounded-lg p-4 hover:border-[#B8860B]/60 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-cinzel font-bold text-[#F5F0E8]">{ficha.nome}</h3>
          <p className="text-[#A8A09B] text-sm">
            Nível {ficha.nivel} {classe?.nome ?? ficha.classe} · {especie?.nome ?? ficha.especie}
          </p>
        </div>
        <span className="text-xs text-[#A8A09B]">{dataFormatada}</span>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={onCarregar}>Continuar</Button>
        <Button size="sm" variant="secondary" onClick={onExportar}>📤 Exportar</Button>
        <Button size="sm" variant="danger" onClick={onDeletar} aria-label={`Deletar ${ficha.nome}`}>
          🗑
        </Button>
      </div>
    </div>
  )
}

function ListaVazia() {
  return (
    <div className="text-center py-12 border border-dashed border-[#B8860B]/20 rounded-xl">
      <p className="text-[#A8A09B]">Nenhum personagem salvo ainda.</p>
      <p className="text-[#A8A09B] text-sm">Crie seu primeiro aventureiro acima!</p>
    </div>
  )
}
