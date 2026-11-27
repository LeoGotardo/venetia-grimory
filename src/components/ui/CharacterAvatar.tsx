import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { defaultPortrait, normalizePortrait } from '../../lib/portrait/generate'
import { PORTRAIT_PALETTES } from '../../lib/portrait/options'
import { usePortraitUrl } from '../../hooks/usePortraitUrl'

interface CharacterAvatarProps {
  name: string | null | undefined
  /** Retrato salvo na ficha (ou na lista); passa de novo pelo `normalizePortrait`. */
  portrait?: unknown
  speciesId?: string | null
  /** Semente do rosto sorteado quando não há retrato: o id da ficha, para renomear não mudar o rosto. */
  seed: string
  size?: number
  className?: string
}

/**
 * Rosto do personagem, desenhado no aparelho (sem rede, nada sai daqui): o retrato
 * do editor, ou um sorteado pela espécie com a semente da ficha. Enquanto o desenho
 * carrega, fica só a cor de fundo do retrato.
 */
export function CharacterAvatar({ name, portrait, speciesId, seed, size = 48, className = '' }: CharacterAvatarProps) {
  const { t } = useTranslation()
  const face = useMemo(() => normalizePortrait(portrait) ?? defaultPortrait(speciesId, seed), [portrait, speciesId, seed])
  const src = usePortraitUrl(face)
  const alt = name || t('sheet.character')
  if (!src) {
    return <span role="img" aria-label={alt} className={`block ${className}`} style={{ width: size, height: size, background: PORTRAIT_PALETTES.background[face.background] }} />
  }
  return <img src={src} alt={alt} width={size} height={size} className={className} />
}
