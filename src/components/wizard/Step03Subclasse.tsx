import { useFichaStore } from '../../store/fichaStore'
import { WizardNav } from './WizardNav'
import { Card } from '../ui/Card'
import dadosJson from '../../data/dnd_dados.json'
import type { DadosJogo } from '../../types'

const dados = dadosJson as unknown as DadosJogo

export function Step03Subclasse() {
  const { ficha, setSubclasse, setPasso } = useFichaStore()
  const nivel = ficha.identidade.nivel
  const classeId = ficha.identidade.classe_id
  const subclasseId = ficha.identidade.subclasse_id
  const classe = dados.classes.find(c => c.id === classeId)

  if (nivel < 3) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-cinzel text-2xl font-bold text-[#F5F0E8] mb-1">Subclasse</h2>
        </div>
        <div className="bg-[#3D332D] border border-[#B8860B]/30 rounded-lg p-6 text-center">
          <div className="text-4xl mb-3">🔒</div>
          <h3 className="font-cinzel text-lg text-[#F5F0E8] mb-2">Subclasse desbloqueada no Nível 3</h3>
          <p className="text-[#A8A09B] text-sm">
            Você escolheu o nível {nivel}. A subclasse será selecionada quando o personagem atingir o nível 3.
          </p>
        </div>
        <WizardNav onBack={() => setPasso(2)} onNext={() => setPasso(4)} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-cinzel text-2xl font-bold text-[#F5F0E8] mb-1">Subclasse</h2>
        <p className="text-[#A8A09B] text-sm">Especialização de {classe?.nome}.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {classe?.subclasses.map(sub => (
          <Card
            key={sub.id}
            selected={subclasseId === sub.id}
            hoverable
            onClick={() => setSubclasse(sub.id)}
          >
            <h3 className="font-cinzel font-bold text-[#F5F0E8] mb-1">{sub.nome}</h3>
            <p className="text-[#A8A09B] text-xs">{sub.descricao ?? `Especialização de ${classe.nome}`}</p>
          </Card>
        ))}
      </div>

      <WizardNav onBack={() => setPasso(2)} onNext={() => setPasso(4)} nextDisabled={!subclasseId} />
    </div>
  )
}
