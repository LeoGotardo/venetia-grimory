import { lazy, Suspense, useId, useRef, useState, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from './Modal'
import { PreferencesPanel } from './settings/PreferencesPanel'
import { AboutPanel } from './settings/AboutPanel'
import { isCloudAvailable } from '../../lib/cloud/config'
import { useCloudStore } from '../../store/cloudStore'

// A conta traz o Firebase consigo: só carrega quando a aba abre.
const AccountPanel = lazy(() => import('./AccountPanel').then(m => ({ default: m.AccountPanel })))

export type SettingsTab = 'preferences' | 'account' | 'about'

interface ConfigModalProps {
  open: boolean
  onClose: () => void
  /** Aba ao abrir; a engrenagem abre na conta quando ela pede atenção. */
  initialTab?: SettingsTab
}

/**
 * Configurações em abas: preferências, conta (só com o Firebase configurado —
 * some em forks, no CI e no APK sem o client ID) e sobre. Setas esquerda/direita
 * trocam de aba, como pede o padrão de abas da WAI-ARIA.
 */
export function ConfigModal({ open, onClose, initialTab = 'preferences' }: ConfigModalProps) {
  const { t } = useTranslation()
  const baseId = useId()
  const tabRefs = useRef<Partial<Record<SettingsTab, HTMLButtonElement | null>>>({})
  const accountAttention = useCloudStore(s => s.sessionExpired || s.phase === 'error')
  const [tab, setTab] = useState<SettingsTab>(initialTab)

  const tabs: Array<{ id: SettingsTab; label: string }> = [
    { id: 'preferences', label: t('config.tabPreferences') },
    ...(isCloudAvailable() ? [{ id: 'account' as const, label: t('config.tabAccount') }] : []),
    { id: 'about', label: t('config.tabAbout') },
  ]
  const active = tabs.some(item => item.id === tab) ? tab : 'preferences'

  function select(next: SettingsTab) {
    setTab(next)
    tabRefs.current[next]?.focus()
  }

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const index = tabs.findIndex(item => item.id === active)
    const step = e.key === 'ArrowRight' ? 1 : -1
    select(tabs[(index + step + tabs.length) % tabs.length].id)
  }

  return (
    <Modal open={open} onClose={onClose} title={t('config.title')}>
      <div role="tablist" aria-label={t('config.title')} onKeyDown={handleKeyDown} className="flex gap-1 mb-4 border-b border-white/[0.08]">
        {tabs.map(item => {
          const selected = item.id === active
          return (
            <button
              key={item.id}
              ref={el => { tabRefs.current[item.id] = el }}
              id={`${baseId}-tab-${item.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`${baseId}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setTab(item.id)}
              className={`relative min-h-[44px] px-3 text-[13px] font-semibold border-b-2 -mb-px cursor-pointer transition-colors ${
                selected ? 'border-[#D4A017] text-[#F5F0E8]' : 'border-transparent text-[#A8A09B] hover:text-[#E8DFD0]'
              }`}
            >
              {item.label}
              {item.id === 'account' && accountAttention && (
                <span aria-hidden="true" className="absolute top-2 right-0.5 w-1.5 h-1.5 rounded-full bg-[#D4A017]" />
              )}
            </button>
          )
        })}
      </div>

      {/* Altura mínima ~ a da aba Preferências: o modal é centralizado e pularia a cada troca de aba. */}
      <div role="tabpanel" id={`${baseId}-panel`} aria-labelledby={`${baseId}-tab-${active}`} className="min-h-[22rem]">
        {active === 'preferences' && <PreferencesPanel />}
        {active === 'account' && (
          <Suspense fallback={<p className="py-6 text-center text-sm text-[#A8A09B]">{t('loading.loading')}</p>}>
            <AccountPanel />
          </Suspense>
        )}
        {active === 'about' && <AboutPanel />}
      </div>
    </Modal>
  )
}
