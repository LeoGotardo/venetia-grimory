import { Modal } from './Modal'
import { useConfigStore, type Config } from '../../store/configStore'

interface SettingRowProps {
  label: string
  description: string
  value: boolean
  onChange: (v: boolean) => void
}

function SettingRow({ label, description, value, onChange }: SettingRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-[#B8860B]/10 last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-[#F5F0E8]">{label}</p>
        <p className="text-xs text-[#A8A09B] mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={[
          'relative shrink-0 w-10 h-6 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B] cursor-pointer overflow-hidden',
          value ? 'bg-[#B8860B]' : 'bg-[#2D2520] border border-[#A8A09B]/30',
        ].join(' ')}
      >
        <span
          className={[
            'absolute top-1 w-4 h-4 rounded-full bg-[#F5F0E8] shadow transition-all duration-200',
            value ? 'left-[22px]' : 'left-[2px]',
          ].join(' ')}
        />
      </button>
    </div>
  )
}

const SETTINGS: Array<{
  key: keyof Config
  label: string
  description: string
}> = [
  {
    key: 'rastrear_peso',
    label: 'Rastrear Peso',
    description: 'Exibe barras de carga e o peso dos itens no inventário.',
  },
  {
    key: 'gerenciar_ouro',
    label: 'Gerenciar Ouro',
    description: 'Deduz automaticamente o custo ao adicionar itens na criação (Opção B).',
  },
  {
    key: 'reembolso_venda',
    label: 'Reembolso ao Vender',
    description: 'Devolve o valor do item em PO ao usar o botão de venda no inventário.',
  },
  {
    key: 'moedas_simples',
    label: 'Moedas Simplificadas',
    description: 'Exibe apenas o campo de Peças de Ouro (PO) no inventário.',
  },
]

interface ConfigModalProps {
  open: boolean
  onClose: () => void
}

export function ConfigModal({ open, onClose }: ConfigModalProps) {
  const { config, setConfig } = useConfigStore()

  return (
    <Modal open={open} onClose={onClose} title="Configurações">
      <div className="divide-y divide-[#B8860B]/10">
        {SETTINGS.map(s => (
          <SettingRow
            key={s.key}
            label={s.label}
            description={s.description}
            value={config[s.key]}
            onChange={v => setConfig({ [s.key]: v })}
          />
        ))}
      </div>
    </Modal>
  )
}
