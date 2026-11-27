import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ACCESSORIES, BALD_HAIR, DRACONIC_ACCESSORIES, DRACONIC_HIDDEN, PORTRAIT_OPTIONS, PORTRAIT_PALETTES,
  type Accessory, type Portrait, type PortraitColor, type PortraitPart,
} from '../../lib/portrait/options'
import { randomPortrait, withAccessory } from '../../lib/portrait/generate'
import { usePortraitRenderer } from '../../hooks/usePortraitUrl'
import { Modal } from './Modal'

type Field = PortraitPart | PortraitColor | 'accessories'
type TabId = 'face' | 'hair' | 'fantasy' | 'extras'

/** Uma aba por assunto: cada uma cabe na tela. */
const TABS: ReadonlyArray<{ id: TabId; fields: readonly Field[] }> = [
  { id: 'face', fields: ['head', 'skin', 'face', 'ears', 'eyeColor'] },
  { id: 'hair', fields: ['hair', 'hairColor', 'beard', 'beardColor'] },
  { id: 'fantasy', fields: ['horns', 'hornColor', 'tusks', 'markings'] },
  { id: 'extras', fields: ['accessories', 'clothes', 'background'] },
]

/** Muitas opções de desenho: escolhe-se pela miniatura do próprio rosto, não por nome. */
const THUMBNAIL_FIELDS: readonly Field[] = ['hair', 'face', 'beard']

const isPart = (field: Field): field is PortraitPart => field in PORTRAIT_OPTIONS
/** As cores da barba usam os nomes das cores do cabelo (é a mesma paleta). */
const paletteLabels = (field: PortraitColor) => (field === 'beardColor' ? 'hairColor' : field)

/** Campo que não se aplica ao rosto atual (e por isso não aparece). */
function hiddenField(field: Field, p: Portrait): boolean {
  if (field === 'accessories') return false
  if (p.head === 'draconic' && DRACONIC_HIDDEN.includes(field)) return true
  if (field === 'eyeColor') return p.head !== 'draconic'
  if (field === 'hairColor') return BALD_HAIR.includes(p.hair)
  if (field === 'beardColor') return p.beard === 'none'
  if (field === 'hornColor') return p.horns === 'none'
  return false
}

const optionsOf = (field: PortraitPart): readonly string[] => PORTRAIT_OPTIONS[field]
/** Na cabeça dracônica, só o que fica por cima dela. */
const accessoriesFor = (p: Portrait): readonly Accessory[] => (p.head === 'draconic' ? DRACONIC_ACCESSORIES : ACCESSORIES)

const chip = (selected: boolean) =>
  `min-h-[36px] px-3 rounded-[8px] border text-[13px] font-semibold cursor-pointer transition-colors ${
    selected ? 'border-[#D4A017] bg-[rgba(212,160,23,0.16)] text-[#F5F0E8]' : 'border-white/[0.1] bg-[#2D2520] text-[#E8DFD0] hover:bg-[#4D4037]'
  }`

interface PortraitEditorProps {
  open: boolean
  onClose: () => void
  /** Retrato de partida (o salvo, ou o sorteado da ficha). */
  initial: Portrait
  speciesId: string | null
  onSave: (portrait: Portrait) => void
}

/** Editor do rosto: prévia, partes por aba, "Sortear" com o jeito da espécie e salvar. */
export function PortraitEditor({ open, onClose, initial, speciesId, onSave }: PortraitEditorProps) {
  const { t } = useTranslation()
  const renderer = usePortraitRenderer()
  const [draft, setDraft] = useState(initial)
  const [tab, setTab] = useState<TabId>('face')
  const tabs = TABS
    .map(tb => ({ ...tb, fields: tb.fields.filter(f => !hiddenField(f, draft)) }))
    .filter(tb => tb.fields.length > 0)
  const current = tabs.find(tb => tb.id === tab) ?? tabs[0]
  const set = (field: Field, value: string) => setDraft(d => ({ ...d, [field]: value }))
  // Liga ou desliga; ligar troca o que estava no mesmo lugar (outro óculos, o tapa-olho).
  const toggleAccessory = (item: Accessory) => setDraft(d => ({
    ...d,
    accessories: d.accessories.includes(item) ? d.accessories.filter(a => a !== item) : withAccessory(d.accessories, item),
  }))
  const url = (p: Portrait) => renderer?.portraitDataUrl(p) ?? undefined

  return (
    <Modal open={open} onClose={onClose} title={t('portrait.title')} wide>
      {!renderer ? (
        <p className="py-10 text-center text-[#A8A09B] animate-pulse">{t('loading.loading')}</p>
      ) : (
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex flex-shrink-0 flex-row items-center gap-3 sm:flex-col sm:items-stretch">
            <img src={url(draft)} alt={t('portrait.preview')} width={160} height={160} className="h-28 w-28 rounded-[16px] border border-[rgba(212,160,23,0.35)] sm:h-40 sm:w-40" />
            <div className="flex flex-1 flex-col gap-2">
              <button type="button" onClick={() => setDraft(randomPortrait(speciesId))} className="min-h-[40px] rounded-[10px] border border-[rgba(212,160,23,0.3)] bg-white/5 px-3 text-[14px] font-semibold text-[#E8DFD0] hover:bg-white/10 cursor-pointer">
                {t('portrait.randomize')}
              </button>
              <button type="button" onClick={() => { onSave(draft); onClose() }} className="min-h-[40px] rounded-[10px] bg-[#D4A017] px-3 text-[14px] font-bold text-[#131110] hover:bg-[#E8C25A] cursor-pointer">
                {t('portrait.save')}
              </button>
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div role="tablist" aria-label={t('portrait.title')} className="flex gap-1 overflow-x-auto no-scrollbar rounded-[10px] border border-white/[0.08] bg-[#131110] p-1">
              {tabs.map(tb => (
                <button
                  key={tb.id}
                  role="tab"
                  aria-selected={current.id === tb.id}
                  onClick={() => setTab(tb.id)}
                  className={`flex-shrink-0 min-h-[34px] px-3 rounded-[8px] text-[13px] font-semibold cursor-pointer transition-colors ${
                    current.id === tb.id ? 'bg-[#D4A017] text-[#131110]' : 'text-[#E8DFD0] hover:bg-white/10'
                  }`}
                >
                  {t(`portrait.tab.${tb.id}`)}
                </button>
              ))}
            </div>

            <div role="tabpanel" className="flex max-h-[60dvh] flex-col gap-3 overflow-y-auto pr-1">
              {current.fields.map(field => (
                <fieldset key={field} className="flex flex-col gap-1.5">
                  <legend className="mb-1 text-[13px] font-semibold text-[#E8DFD0]">{t(`portrait.field.${field}`)}</legend>
                  {field === 'accessories' ? (
                    <>
                      <p className="text-[12px] text-[#A8A09B]">{t('portrait.accessoriesHint')}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {accessoriesFor(draft).map(id => (
                          <button key={id} type="button" aria-pressed={draft.accessories.includes(id)} onClick={() => toggleAccessory(id)} className={chip(draft.accessories.includes(id))}>
                            {t(`portrait.option.accessories.${id}`)}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : isPart(field) && THUMBNAIL_FIELDS.includes(field) ? (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(56px,1fr))] gap-1.5">
                      {optionsOf(field).map((id, i, all) => {
                        const selected = draft[field] === id
                        // Numeradas a partir de 1; "sem" (barba) tem nome próprio.
                        const n = all[0] === 'none' ? i : i + 1
                        const label = id === 'none' ? t('portrait.none') : t('portrait.optionN', { field: t(`portrait.field.${field}`), n })
                        return (
                          <button key={id} type="button" aria-label={label} title={label} aria-pressed={selected} onClick={() => set(field, id)}
                            className={`overflow-hidden rounded-[10px] border-2 cursor-pointer ${selected ? 'border-[#D4A017]' : 'border-transparent hover:border-white/30'}`}>
                            <img src={url({ ...draft, [field]: id })} alt="" width={56} height={56} className="block h-full w-full" />
                          </button>
                        )
                      })}
                    </div>
                  ) : isPart(field) ? (
                    <div className="flex flex-wrap gap-1.5">
                      {optionsOf(field).map(id => (
                        <button key={id} type="button" aria-pressed={draft[field] === id} onClick={() => set(field, id)} className={chip(draft[field] === id)}>
                          {t(`portrait.option.${field}.${id}`)}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(PORTRAIT_PALETTES[field]).map(([id, hex]) => {
                        const label = t(`portrait.color.${paletteLabels(field)}.${id}`)
                        const selected = draft[field] === id
                        return (
                          <button key={id} type="button" aria-label={label} aria-pressed={selected} title={label} onClick={() => set(field, id)}
                            className={`h-8 w-8 rounded-full border-2 cursor-pointer ${selected ? 'border-[#F5F0E8] ring-2 ring-[#D4A017]' : 'border-white/20'}`}
                            style={{ background: hex }} />
                        )
                      })}
                    </div>
                  )}
                </fieldset>
              ))}
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}
