import { useTranslation } from 'react-i18next'
import { Modal } from './Modal'
import { DieBadge } from './Badge'
import { LockIcon } from './LockIcon'
import type { CharClass } from '../../types'

interface ClassCardProps {
  charClass: CharClass | null
  /** Nível do personagem: linhas de progressão acima dele aparecem trancadas. */
  level: number
  onClose: () => void
}

/**
 * Ficha detalhada da classe — mesma função que a `SpellCard` cumpre para magias.
 * Usada no passo de escolha de classe e na aba Editar da ficha em jogo.
 */
export function ClassCard({ charClass, level, onClose }: ClassCardProps) {
  const { t } = useTranslation()
  if (!charClass) return null

  return (
    <Modal open={!!charClass} onClose={onClose} title={charClass.name} wide>
      <div className="space-y-4 text-sm">
        <p className="text-[#A8A09B]">{charClass.description}</p>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#2D2520] rounded p-3">
            <div className="text-[#B8860B] font-semibold mb-1">{t('step02.hitDieSection')}</div>
            <DieBadge type={`d${charClass.hit_die}`} />
          </div>
          <div className="bg-[#2D2520] rounded p-3">
            <div className="text-[#B8860B] font-semibold mb-1">{t('step02.primaryAttrs')}</div>
            <div className="text-[#F5F0E8]">{charClass.primary_abilities.join(', ')}</div>
          </div>
          <div className="bg-[#2D2520] rounded p-3">
            <div className="text-[#B8860B] font-semibold mb-1">{t('step02.savesSection')}</div>
            <div className="text-[#F5F0E8]">{charClass.saves.join(', ')}</div>
          </div>
          <div className="bg-[#2D2520] rounded p-3">
            <div className="text-[#B8860B] font-semibold mb-1">{t('step02.profs')}</div>
            <div className="text-[#F5F0E8]">{[...charClass.armors, ...charClass.weapons].join(', ')}</div>
          </div>
        </div>

        <div>
          <div className="text-[#B8860B] font-semibold mb-2">{t('step02.subclassesSection')}</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {charClass.subclasses.map(s => (
              <div key={s.id} className="bg-[#2D2520] rounded p-2">
                <div className="text-[#F5F0E8] text-sm font-semibold">{s.name}</div>
                {s.description && <p className="text-[#A8A09B] text-xs mt-0.5 leading-relaxed">{s.description}</p>}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="text-[#B8860B] font-semibold mb-2">{t('step02.progressionSection')}</div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#B8860B]/20">
                  <th className="py-1 px-2 text-left text-[#B8860B]">{t('step02.colLevel')}</th>
                  <th className="py-1 px-2 text-left text-[#B8860B]">{t('step02.colProfBonus')}</th>
                  <th className="py-1 px-2 text-left text-[#B8860B]">{t('step02.colHighlights')}</th>
                </tr>
              </thead>
              <tbody>
                {charClass.progression.map(p => {
                  const locked = p.level > level
                  return (
                    <tr key={p.level} className={`border-b border-[#3D332D] ${locked ? 'opacity-45' : ''}`}>
                      <td className="py-1 px-2 text-[#F5F0E8] whitespace-nowrap">
                        {locked && <LockIcon />} {p.level}
                      </td>
                      <td className="py-1 px-2 text-[#F5F0E8]">+{p.prof_bonus}</td>
                      <td className="py-1 px-2 text-[#A8A09B]">{p.highlights.join(', ')}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Modal>
  )
}
