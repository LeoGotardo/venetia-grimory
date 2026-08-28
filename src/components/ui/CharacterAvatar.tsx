import { useTranslation } from 'react-i18next'

interface CharacterAvatarProps {
  name: string | null | undefined
  id?: string
  size?: number
  className?: string
}

function dicebearUrl(name: string | null | undefined, id?: string) {
  const raw = (name ?? '').trim()
  const seed = encodeURIComponent(raw || id || 'Adventurer')
  return `https://api.dicebear.com/10.x/adventurer/svg?seed=${seed}`
}

export function CharacterAvatar({ name, id, size = 48, className = '' }: CharacterAvatarProps) {
  const { t } = useTranslation()
  return (
    <img
      src={dicebearUrl(name, id)}
      alt={name ?? t('sheet.character')}
      width={size}
      height={size}
      className={className}
      style={{ imageRendering: 'auto' }}
    />
  )
}
