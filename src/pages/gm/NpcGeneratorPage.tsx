import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Monster, NpcProfile, StatBlock } from '../../types'
import { useGmStore } from '../../store/gmStore'
import { GmHeader, gmPrimaryButton, gmSecondaryButton, gmContainer } from '../../components/gm/GmHeader'
import { AppFooter } from '../../components/ui/AppFooter'
import { StatBlockCard } from '../../components/gm/StatBlockCard'
import { NpcPortrait } from '../../components/gm/NpcPortrait'
import { NpcProfileFields, type ProfileField } from '../../components/gm/NpcProfileFields'
import { DiceIcon, SectionTitle } from '../../components/gm/ornaments'
import { NPC_ARCHETYPES, NPC_SPECIES, PC_CLASS_OCCUPATION, type NpcArchetypeId, type NpcSpecies } from '../../data/npcTables'
import { gameData } from '../../data/rules'
import { getBackgrounds } from '../../data/backgrounds'
import { SelectField } from '../../components/gm/fields'
import { createBlankStatBlock } from '../../lib/gm/statblock'
import { buildPcSheet, resolvePcBuild, sheetToStatBlock, type PcBuild } from '../../lib/gm/pcNpc'
import {
  archetypeById, generateNpc, randomName, rerollField, resolveArchetype, varyStatBlock, type NpcDraft,
} from '../../lib/gm/npcGenerator'
import { NotFound } from '../NotFound'

const TIERS = ['common', 'veteran', 'elite'] as const

/**
 * `/mestre/campanha/:id/npc/gerar` — gera um NPC a partir de um arquétipo do SRD
 * ou montado como personagem (classe, nível, antecedente) com as regras do jogador.
 */
export function NpcGeneratorPage() {
  const { t, i18n } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const { campaign, openedId, openCampaign, srd, loadSrd } = useGmStore()

  useEffect(() => {
    if (id) openCampaign(id)
  }, [id, openCampaign])
  useEffect(() => {
    void loadSrd(i18n.language)
  }, [i18n.language, loadSrd])

  if (openedId === id && !campaign) return <NotFound />
  if (!campaign || campaign.id !== id) return null

  const backTo = `/mestre/campanha/${campaign.id}?aba=npcs`
  if (srd?.language !== i18n.language) {
    return (
      <div className="min-h-screen flex flex-col gm-page font-[Manrope,system-ui]">
        <GmHeader title={t('gm.npcGen.title')} backTo={backTo} />
        <p className="text-center text-[#A8A09B] py-16">{t('gm.npcGen.loading')}</p>
        <AppFooter containerClassName={gmContainer} />
      </div>
    )
  }
  return <Generator backTo={backTo} catalog={srd.monsters} language={i18n.language === 'en' ? 'en' : 'pt'} />
}

type Mode = 'srd' | 'pc'

/** Escolhas do modo personagem; `''`/`0` = sorteado a cada rolagem. */
interface PcChoice {
  classId: string
  level: number
  subclassId: string
  backgroundId: string
}

const ANY_PC: PcChoice = { classId: '', level: 0, subclassId: '', backgroundId: '' }

interface GeneratorState {
  mode: Mode
  /** Escolha do mestre; `''` = qualquer um, sorteado a cada rolagem. */
  choice: NpcArchetypeId | ''
  archetype: NpcArchetypeId
  pcChoice: PcChoice
  /** O personagem resolvido (o que foi escolhido + o que o dado decidiu). Só no modo personagem. */
  pcBuild: PcBuild | null
  name: string
  profile: NpcProfile
  statblock: StatBlock
  locked: ReadonlySet<ProfileField>
}

const pick = <T,>(list: readonly T[]): T => list[Math.floor(Math.random() * list.length)]

/** Arquétipo cujo grupo de ocupação combina com a classe: é de onde sai a ocupação do NPC-personagem. */
function occupationArchetype(classId: string): NpcArchetypeId {
  const group = PC_CLASS_OCCUPATION[classId] ?? 'common'
  return (NPC_ARCHETYPES.find(a => a.group === group) ?? NPC_ARCHETYPES[0]).id
}

function draftFromLocks(prev: Pick<GeneratorState, 'name' | 'profile'> | null, locked: ReadonlySet<ProfileField>): NpcDraft {
  const draft: NpcDraft = {}
  if (!prev) return draft
  for (const field of locked) {
    if (field === 'name') draft.name = prev.name
    else if (field === 'gender') draft.gender = prev.profile.gender
    else draft[field] = prev.profile[field]
  }
  return draft
}

function Generator({ backTo, catalog, language }: { backTo: string; catalog: Monster[]; language: 'pt' | 'en' }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const addNpc = useGmStore(s => s.addNpc)
  const baseOf = (archetype: NpcArchetypeId) => catalog.find(m => m.id === archetypeById(archetype)!.srd)!.statblock
  const pcBlock = (build: PcBuild, name: string) => sheetToStatBlock(buildPcSheet(build), name, language, t)

  /** Monta o personagem com o que já está resolvido; a espécie é sempre a do perfil. */
  function rebuildPc(s: GeneratorState, build: Omit<PcBuild, 'speciesId' | 'lineageId'>): GeneratorState {
    const resolved = resolvePcBuild({ ...build, subclassId: build.subclassId ?? undefined, speciesId: s.profile.species })
    return { ...s, pcBuild: resolved, statblock: pcBlock(resolved, s.name) }
  }

  /** Rola tudo que não está travado nem escolhido. */
  function roll(prev: GeneratorState | null, mode: Mode, choice: NpcArchetypeId | '', pcChoice: PcChoice): GeneratorState {
    const locked = prev?.locked ?? new Set<ProfileField>()
    const draft = draftFromLocks(prev, locked)

    if (mode === 'srd') {
      const archetype = resolveArchetype({ archetype: choice })
      const { statblock, profile } = generateNpc(draft, archetype, baseOf(archetype), language)
      return { mode, choice, archetype, pcChoice, pcBuild: null, name: statblock.name, profile, statblock, locked }
    }

    // A classe sai primeiro: a ocupação sorteada depende dela.
    const classId = resolvePcBuild({ classId: pcChoice.classId }).classId
    const { statblock: rolled, profile } = generateNpc(draft, occupationArchetype(classId), createBlankStatBlock(), language)
    const pcBuild = resolvePcBuild({
      classId,
      level: pcChoice.level,
      subclassId: pcChoice.subclassId,
      backgroundId: pcChoice.backgroundId,
      speciesId: profile.species,
    })
    return {
      mode,
      choice,
      archetype: prev?.archetype ?? resolveArchetype({}),
      pcChoice,
      pcBuild,
      name: rolled.name,
      profile: { ...profile, archetype: '' },
      statblock: pcBlock(pcBuild, rolled.name),
      locked,
    }
  }

  const [state, setState] = useState<GeneratorState>(() => roll(null, 'srd', '', ANY_PC))
  const { mode, archetype, pcBuild, pcChoice, name, profile, statblock, locked } = state

  function lock(current: ReadonlySet<ProfileField>, field: ProfileField, on: boolean) {
    const next = new Set(current)
    if (on) next.add(field)
    else next.delete(field)
    return next
  }

  /** No modo personagem, trocar a espécie refaz a ficha (deslocamento, traços, tamanho). */
  function afterProfile(s: GeneratorState, speciesChanged: boolean): GeneratorState {
    return speciesChanged && s.mode === 'pc' && s.pcBuild ? rebuildPc(s, s.pcBuild) : s
  }

  /** O mestre digitou: o campo fica travado. Espécie e gênero puxam um nome novo se o nome está livre. */
  function change(field: ProfileField, value: string) {
    setState(s => {
      if (field === 'name') return { ...s, name: value, locked: lock(s.locked, 'name', true) }
      const nextProfile = { ...s.profile, [field]: value } as NpcProfile
      const renamed = (field === 'species' || field === 'gender') && !s.locked.has('name')
      return afterProfile({
        ...s,
        profile: nextProfile,
        name: renamed ? randomName(nextProfile.species as NpcSpecies, nextProfile.gender) : s.name,
        locked: lock(s.locked, field, true),
      }, field === 'species')
    })
  }

  function reroll(field: ProfileField) {
    setState(s => {
      const p = s.profile
      const occArchetype = s.mode === 'pc' && s.pcBuild ? occupationArchetype(s.pcBuild.classId) : s.archetype
      if (field === 'name') return { ...s, name: randomName(p.species as NpcSpecies, p.gender) }
      if (field === 'species') return afterProfile({ ...s, profile: { ...p, species: pick(NPC_SPECIES) } }, true)
      if (field === 'gender') return { ...s, profile: { ...p, gender: pick(['f', 'm', 'x'] as const) } }
      return { ...s, profile: { ...p, [field]: rerollField(field, occArchetype, language, p.gender) } }
    })
  }

  /** Trocar o arquétipo troca os números e a ocupação (se livre); o resto do perfil fica. */
  function chooseArchetype(choice: NpcArchetypeId | '') {
    setState(s => {
      const next = resolveArchetype({ archetype: choice })
      return {
        ...s,
        choice,
        archetype: next,
        statblock: varyStatBlock(baseOf(next)),
        profile: {
          ...s.profile,
          archetype: next,
          occupation: s.locked.has('occupation') ? s.profile.occupation : rerollField('occupation', next, language, s.profile.gender),
        },
      }
    })
  }

  /**
   * Mudar uma escolha do personagem mantém o que o dado já tinha decidido nas
   * outras (trocar só o nível não sorteia outra classe). Trocar de classe
   * descarta a subclasse e, se a ocupação estiver livre, sorteia uma que combine.
   */
  function choosePc(change: Partial<PcChoice>) {
    setState(s => {
      if (!s.pcBuild) return s
      const pcChoice = { ...s.pcChoice, ...change }
      const classChanged = 'classId' in change
      const classId = pcChoice.classId || (classChanged ? resolvePcBuild({}).classId : s.pcBuild.classId)
      const next = rebuildPc({ ...s, pcChoice }, {
        classId,
        level: pcChoice.level || s.pcBuild.level,
        subclassId: pcChoice.subclassId || (classChanged || 'level' in change ? null : s.pcBuild.subclassId),
        backgroundId: pcChoice.backgroundId || s.pcBuild.backgroundId,
      })
      if (!classChanged || s.locked.has('occupation')) return next
      return { ...next, profile: { ...next.profile, occupation: rerollField('occupation', occupationArchetype(classId), language, s.profile.gender) } }
    })
  }

  function save() {
    addNpc({ ...statblock, name: name.trim() || statblock.name }, null, { profile })
    navigate(backTo)
  }

  const chip = (active: boolean) =>
    `min-h-[40px] px-3.5 rounded-full text-[13px] font-semibold border cursor-pointer transition-colors ${
      active
        ? 'bg-[#D4A017] border-[#D4A017] text-[#131110]'
        : 'bg-white/[0.03] border-white/[0.1] text-[#E8DFD0] hover:border-[rgba(212,160,23,0.5)]'
    }`

  const pcClass = pcBuild ? gameData.classes.find(c => c.id === pcBuild.classId) : null
  const backgrounds = getBackgrounds()
  const subclassName = pcClass?.subclasses.find(sc => sc.id === pcBuild?.subclassId)?.name
  const backgroundName = backgrounds.find(b => b.id === pcBuild?.backgroundId)?.name
  const buildLabel = pcClass && pcBuild
    ? `${pcClass.name} ${pcBuild.level}${subclassName ? ` (${subclassName})` : ''}${backgroundName ? `, ${backgroundName}` : ''}`
    : ''

  return (
    <div className="min-h-screen flex flex-col gm-page font-[Manrope,system-ui]">
      <GmHeader
        title={t('gm.npcGen.title')}
        backTo={backTo}
        actions={
          <>
            <button
              data-testid="npc-gerar-sortear"
              onClick={() => setState(s => roll(s, s.mode, s.choice, s.pcChoice))}
              title={t('gm.npcGen.rollAllHint')}
              className={gmSecondaryButton}
            >
              <DiceIcon size={16} />
              <span className="hidden sm:inline">{t('gm.npcGen.rollAll')}</span>
            </button>
            <button data-testid="npc-gerar-salvar" onClick={save} className={gmPrimaryButton}>
              {t('gm.npcGen.save')}
            </button>
          </>
        }
      />

      <div className={`${gmContainer} py-6 pb-20`}>
        <p className="text-[15px] text-[#A8A09B] mb-5">
          {t('gm.npcGen.intro')} <span className="whitespace-nowrap">{t('gm.npcGen.rollAllHint')}</span>
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(400px,480px)] gap-8 items-start">
          <div className="flex flex-col gap-7 min-w-0">
            <section>
              <SectionTitle align="start">{t('gm.npcGen.start')}</SectionTitle>

              <div role="radiogroup" aria-label={t('gm.npcGen.start')} className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
                {(['srd', 'pc'] as const).map(m => (
                  <button
                    key={m}
                    role="radio"
                    aria-checked={mode === m}
                    data-testid={`npc-modo-${m}`}
                    onClick={() => mode !== m && setState(s => roll(s, m, s.choice, s.pcChoice))}
                    className={`text-left rounded-[12px] border px-4 py-3 cursor-pointer transition-colors ${
                      mode === m ? 'border-[#D4A017] bg-[rgba(212,160,23,0.1)]' : 'border-white/[0.1] bg-[#1A1714] hover:border-[rgba(212,160,23,0.4)]'
                    }`}
                  >
                    <span className={`block font-bold text-[15px] ${mode === m ? 'text-[#EAD9B0]' : 'text-[#F5F0E8]'}`}>
                      {t(m === 'srd' ? 'gm.npcGen.modeSrd' : 'gm.npcGen.modePc')}
                    </span>
                    <span className="block text-[13px] text-[#A8A09B] mt-0.5 leading-snug">
                      {t(m === 'srd' ? 'gm.npcGen.modeSrdHint' : 'gm.npcGen.modePcHint')}
                    </span>
                  </button>
                ))}
              </div>

              {mode === 'srd' ? (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap gap-2">
                    <button aria-pressed={state.choice === ''} onClick={() => chooseArchetype('')} className={chip(state.choice === '')}>
                      <span className="inline-flex items-center gap-1.5"><DiceIcon size={14} />{t('gm.npcGen.anyArchetype')}</span>
                    </button>
                  </div>
                  {TIERS.map(tier => (
                    <div key={tier}>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-[#A8A09B] mb-1.5">{t(`gm.npcGen.tiers.${tier}`)}</div>
                      <div className="flex flex-wrap gap-2">
                        {NPC_ARCHETYPES.filter(a => a.tier === tier).map(a => (
                          <button
                            key={a.id}
                            data-testid={`arquetipo-${a.id}`}
                            aria-pressed={state.choice === a.id}
                            onClick={() => chooseArchetype(a.id)}
                            className={chip(state.choice === a.id)}
                          >
                            {t(`gm.npcGen.archetypes.${a.id}`)}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : pcBuild && pcClass && (
                <div className="flex flex-col gap-4">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-[#A8A09B] mb-1.5">{t('gm.npcGen.charClass')}</div>
                    <div className="flex flex-wrap gap-2">
                      <button aria-pressed={pcChoice.classId === ''} onClick={() => choosePc({ classId: '' })} className={chip(pcChoice.classId === '')}>
                        <span className="inline-flex items-center gap-1.5"><DiceIcon size={14} />{t('gm.npcGen.anyClass')}</span>
                      </button>
                      {gameData.classes.map(c => (
                        <button
                          key={c.id}
                          data-testid={`classe-${c.id}`}
                          aria-pressed={pcChoice.classId === c.id}
                          onClick={() => choosePc({ classId: c.id })}
                          className={chip(pcChoice.classId === c.id)}
                        >
                          {c.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <SelectField
                      label={t('gm.npcGen.level')}
                      value={String(pcChoice.level)}
                      onChange={v => choosePc({ level: Number(v) })}
                      options={[
                        { value: '0', label: `${t('gm.npcGen.random')} (${pcBuild.level})` },
                        ...Array.from({ length: 20 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) })),
                      ]}
                    />
                    <SelectField
                      label={t('gm.npcGen.subclass')}
                      value={pcChoice.subclassId}
                      onChange={v => choosePc({ subclassId: v })}
                      options={pcBuild.level < (pcClass.subclass_level ?? 3)
                        ? [{ value: '', label: t('gm.npcGen.subclassFrom', { n: pcClass.subclass_level ?? 3 }) }]
                        : [
                            { value: '', label: `${t('gm.npcGen.random')}${subclassName ? ` (${subclassName})` : ''}` },
                            ...pcClass.subclasses.map(sc => ({ value: sc.id, label: sc.name })),
                          ]}
                    />
                    <SelectField
                      label={t('gm.npcGen.background')}
                      value={pcChoice.backgroundId}
                      onChange={v => choosePc({ backgroundId: v })}
                      options={[
                        { value: '', label: `${t('gm.npcGen.random')}${backgroundName ? ` (${backgroundName})` : ''}` },
                        ...backgrounds.map(b => ({ value: b.id, label: b.name })),
                      ]}
                    />
                  </div>
                </div>
              )}
            </section>

            <NpcProfileFields
              profile={profile}
              name={name}
              onChange={change}
              onReroll={reroll}
              locked={locked}
              onToggleLock={field => setState(s => ({ ...s, locked: lock(s.locked, field, !s.locked.has(field)) }))}
            />
          </div>

          <aside className="lg:sticky lg:top-[88px] lg:max-h-[calc(100dvh-108px)] lg:overflow-y-auto lg:pr-1 flex flex-col gap-3">
            <NpcPortrait name={name} profile={profile} />
            <StatBlockCard block={{ ...statblock, name: name || statblock.name }} />
            <p className="text-[13px] text-[#A8A09B]">
              {mode === 'pc'
                ? t('gm.npcGen.statsNotePc', { build: buildLabel, cr: statblock.cr })
                : t('gm.npcGen.statsNote', { archetype: t(`gm.npcGen.archetypes.${archetype}`) })}
            </p>
          </aside>
        </div>
      </div>
      <AppFooter containerClassName={gmContainer} />
    </div>
  )
}
