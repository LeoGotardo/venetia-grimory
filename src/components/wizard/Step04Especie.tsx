import { useFichaStore } from '../../store/fichaStore'
import { WizardNav } from './WizardNav'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import dadosJson from '../../data/dnd_dados.json'
import type { DadosJogo } from '../../types'

const dados = dadosJson as unknown as DadosJogo

export function Step04Especie() {
  const { ficha, setEspecie, setPasso } = useFichaStore()
  const especieId = ficha.identidade.especie_id
  const linhagemId = ficha.identidade.linhagem_id
  const especie = dados.especies?.find(e => e.id === especieId)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-cinzel text-2xl font-bold text-[#F5F0E8] mb-1">Espécie</h2>
        <p className="text-[#A8A09B] text-sm">A origem ancestral do seu personagem.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {dados.especies?.map(esp => (
          <Card
            key={esp.id}
            selected={especieId === esp.id}
            hoverable
            onClick={() => setEspecie(esp.id)}
          >
            <h3 className="font-cinzel font-bold text-[#F5F0E8] mb-1">{esp.nome}</h3>
            <div className="flex flex-wrap gap-1 mb-2">
              <Badge variant="default">{esp.tamanho}</Badge>
              <Badge variant="default">{esp.deslocamento}m</Badge>
              {esp.visao_no_escuro && <Badge variant="blue">Visão no Escuro {esp.visao_no_escuro}m</Badge>}
            </div>
            <div className="space-y-1">
              {esp.tracos.slice(0, 3).map(t => (
                <p key={t.nome} className="text-xs text-[#A8A09B]">• {t.nome}</p>
              ))}
              {esp.tracos.length > 3 && <p className="text-xs text-[#B8860B]">+{esp.tracos.length - 3} mais</p>}
            </div>
          </Card>
        ))}
      </div>

      {especie?.linhagens && especie.linhagens.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-cinzel font-semibold text-[#B8860B]">Linhagem de {especie.nome}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {especie.linhagens.map(lin => (
              <Card
                key={lin.id}
                selected={linhagemId === lin.id}
                hoverable
                onClick={() => setEspecie(especieId!, lin.id)}
              >
                <h4 className="font-cinzel font-semibold text-[#F5F0E8] mb-1">{lin.nome}</h4>
                <p className="text-xs text-[#A8A09B]">{lin.descricao ?? `Linhagem ${lin.nome}`}</p>
                {lin.tracos && (
                  <div className="mt-2 space-y-1">
                    {lin.tracos.slice(0, 2).map(t => (
                      <p key={t.nome} className="text-xs text-[#B8860B]">• {t.nome}</p>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      <WizardNav
        onBack={() => setPasso(3)}
        onNext={() => setPasso(5)}
        nextDisabled={!especieId || (!!especie?.linhagens?.length && !linhagemId)}
      />
    </div>
  )
}
