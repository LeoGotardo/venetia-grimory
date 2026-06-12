interface CharacterAvatarProps {
  nome: string | null | undefined
  id?: string
  size?: number
  className?: string
}

function dicebearUrl(nome: string | null | undefined, id?: string) {
  const raw = (nome ?? '').trim()
  const seed = encodeURIComponent(raw || id || 'Aventureiro')
  return `https://api.dicebear.com/10.x/adventurer/svg?seed=${seed}`
}

export function CharacterAvatar({ nome, id, size = 48, className = '' }: CharacterAvatarProps) {
  return (
    <img
      src={dicebearUrl(nome, id)}
      alt={nome ?? 'Personagem'}
      width={size}
      height={size}
      className={className}
      style={{ imageRendering: 'auto' }}
    />
  )
}
