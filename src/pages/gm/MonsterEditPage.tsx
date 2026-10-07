import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useGmStore } from '../../store/gmStore'
import { StatBlockEditLayout } from '../../components/gm/StatBlockEditLayout'
import { createBlankStatBlock } from '../../lib/gm/statblock'
import { NotFound } from '../NotFound'

/** `/mestre/bestiario/:monsterId` — `novo` cria um monstro. */
export function MonsterEditPage() {
  const { t } = useTranslation()
  const { monsterId } = useParams<{ monsterId: string }>()
  const { bestiary, saveMonster } = useGmStore()

  const isNew = monsterId === 'novo'
  const monster = bestiary.find(m => m.id === monsterId)
  if (!isNew && !monster) return <NotFound />

  return (
    <StatBlockEditLayout
      key={monsterId}
      title={isNew ? t('gm.newMonster') : t('gm.editMonster')}
      backTo="/mestre/bestiario"
      initial={monster ? structuredClone(monster.statblock) : createBlankStatBlock()}
      onSave={statblock => saveMonster(statblock, monster?.id)}
    />
  )
}
