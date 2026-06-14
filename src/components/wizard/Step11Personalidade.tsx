import { useFichaStore } from '../../store/fichaStore'
import { WizardNav } from './WizardNav'
import { Input, Textarea } from '../ui/Input'

const ALINHAMENTOS_ETICO = ['Ordeiro', 'Neutro', 'Caótico']
const ALINHAMENTOS_MORAL = ['Bondoso', 'Neutro', 'Mau']

export function Step11Personalidade() {
  const { ficha, setPersonalidade, setIdentidade, setPasso } = useFichaStore()
  const p = ficha.personalidade
  const alin = ficha.identidade.alinhamento

  function setTrait(key: keyof typeof p, idx: number, val: string) {
    const arr = [...(p[key] as string[])]
    arr[idx] = val
    setPersonalidade({ [key]: arr } as never)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-cinzel text-2xl font-bold text-[#F5F0E8] mb-1">Personalidade</h2>
        <p className="text-[#A8A09B] text-sm">Defina a personalidade, crenças e aparência do personagem.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Nome do Personagem"
          value={ficha.identidade.nome_personagem ?? ''}
          onChange={e => setIdentidade({ nome_personagem: e.target.value })}
          placeholder="Ex: Aria Velossombra"
        />
        <Input
          label="Nome do Jogador"
          value={ficha.identidade.nome_jogador ?? ''}
          onChange={e => setIdentidade({ nome_jogador: e.target.value })}
          placeholder="Seu nome"
        />
      </div>

      <div>
        <label className="text-sm text-[#B8860B] font-medium block mb-2">Alinhamento</label>
        <div className="grid grid-cols-3 gap-1 w-full max-w-xs">
          {ALINHAMENTOS_MORAL.map(moral => (
            ALINHAMENTOS_ETICO.map(etico => (
              <button
                key={`${etico}-${moral}`}
                onClick={() => setIdentidade({ alinhamento: { etico, moral } })}
                className={`py-2 px-1 rounded text-xs font-medium border transition-colors cursor-pointer
                  ${alin.etico === etico && alin.moral === moral
                    ? 'bg-[#7B1D1D] border-[#7B1D1D] text-white'
                    : 'border-[#B8860B]/20 text-[#A8A09B] hover:bg-[#3D332D] hover:text-[#F5F0E8]'}`}
              >
                {etico} {moral}
              </button>
            ))
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Textarea
          label="Traços de Personalidade (1)"
          value={p.tracos[0] ?? ''}
          onChange={e => setTrait('tracos', 0, e.target.value)}
          placeholder="Como você se comporta?"
        />
        <Textarea
          label="Traços de Personalidade (2)"
          value={p.tracos[1] ?? ''}
          onChange={e => setTrait('tracos', 1, e.target.value)}
          placeholder="Outro traço marcante."
        />
        <Textarea
          label="Ideais"
          value={p.ideais[0] ?? ''}
          onChange={e => setPersonalidade({ ideais: [e.target.value] })}
          placeholder="O que você acredita acima de tudo?"
        />
        <Textarea
          label="Vínculos"
          value={p.vinculos[0] ?? ''}
          onChange={e => setPersonalidade({ vinculos: [e.target.value] })}
          placeholder="O que te prende ao mundo?"
        />
        <Textarea
          label="Fraquezas"
          value={p.fraquezas[0] ?? ''}
          onChange={e => setPersonalidade({ fraquezas: [e.target.value] })}
          placeholder="Qual o seu defeito?"
        />
        <Textarea
          label="História"
          value={p.historia ?? ''}
          onChange={e => setPersonalidade({ historia: e.target.value })}
          placeholder="Conte a história do personagem..."
          className="min-h-[120px]"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Input label="Idade" value={ficha.identidade.idade ?? ''} onChange={e => setIdentidade({ idade: e.target.value })} placeholder="Ex: 28 anos" />
        <Input label="Altura" value={ficha.identidade.altura ?? ''} onChange={e => setIdentidade({ altura: e.target.value })} placeholder="Ex: 1,72m" />
        <Input label="Peso" value={ficha.identidade.peso ?? ''} onChange={e => setIdentidade({ peso: e.target.value })} placeholder="Ex: 68 kg" />
        <Input label="Olhos" value={ficha.identidade.olhos ?? ''} onChange={e => setIdentidade({ olhos: e.target.value })} placeholder="Ex: Azuis" />
        <Input label="Pele" value={ficha.identidade.pele ?? ''} onChange={e => setIdentidade({ pele: e.target.value })} placeholder="Ex: Bronzeada" />
        <Input label="Cabelo" value={ficha.identidade.cabelo ?? ''} onChange={e => setIdentidade({ cabelo: e.target.value })} placeholder="Ex: Preto" />
      </div>

      <WizardNav onBack={() => setPasso(10)} onNext={() => setPasso(12)} />
    </div>
  )
}
