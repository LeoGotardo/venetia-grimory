import { useTranslation } from 'react-i18next'
import { Modal } from './Modal'
import { useConfigStore, type Config } from '../../store/configStore'
import i18n from '../../i18n/index'

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

interface ConfigModalProps {
  open: boolean
  onClose: () => void
}

export function ConfigModal({ open, onClose }: ConfigModalProps) {
  const { config, setConfig } = useConfigStore()
  const { t } = useTranslation()

  const SETTINGS: Array<{
    key: keyof Config
    label: string
    description: string
  }> = [
    {
      key: 'rastrear_peso',
      label: t('config.weightTracking'),
      description: t('config.weightTrackingDesc'),
    },
    {
      key: 'gerenciar_ouro',
      label: t('config.goldManagement'),
      description: t('config.goldManagementDesc'),
    },
    {
      key: 'reembolso_venda',
      label: t('config.sellRefund'),
      description: t('config.sellRefundDesc'),
    },
    {
      key: 'moedas_simples',
      label: t('config.simpleCoins'),
      description: t('config.simpleCoinsDesc'),
    },
  ]

  return (
    <Modal open={open} onClose={onClose} title={t('config.title')}>
      <div className="divide-y divide-[#B8860B]/10">
        <div className="flex items-center justify-between gap-4 py-3 border-b border-[#B8860B]/10">
          <p className="text-sm font-medium text-[#F5F0E8]">{t('config.language')}</p>
          <div className="flex gap-2">
            {(['pt', 'en'] as const).map(lang => (
              <button
                key={lang}
                onClick={() => { i18n.changeLanguage(lang); localStorage.setItem('venetia-lang', lang) }}
                className={[
                  'px-3 py-1 text-xs rounded font-medium transition-colors',
                  i18n.language === lang
                    ? 'bg-[#B8860B] text-[#1A1208]'
                    : 'border border-[#B8860B]/40 text-[#A8A09B] hover:border-[#B8860B]',
                ].join(' ')}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
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
