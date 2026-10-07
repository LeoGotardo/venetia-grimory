import type { CreatureType } from '../../types'

/** Um glifo de traço por tipo de criatura, para a lista do bestiário não depender só do texto. */
const PATHS: Record<CreatureType, string> = {
  aberration: 'M3 12s3.5-5 9-5 9 5 9 5-3.5 5-9 5-9-5-9-5zM12 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM7 17c-1 2-.5 3.5 1 4M17 17c1 2 .5 3.5-1 4M12 17v4',
  beast: 'M12 21c-3 0-5-1.6-5-3.6 0-2.3 2.5-4.4 5-4.4s5 2.1 5 4.4c0 2-2 3.6-5 3.6zM6 11.5a1.8 2.2 0 1 0 0-.1zM18 11.5a1.8 2.2 0 1 0 0-.1zM9.5 7.5a1.8 2.3 0 1 0 0-.1zM14.5 7.5a1.8 2.3 0 1 0 0-.1z',
  celestial: 'M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  construct: 'M6 4h12v16H6zM9 9h.01M15 9h.01M9 15h6M4 8h2M18 8h2M4 16h2M18 16h2',
  dragon: 'M3 20c4-1 6-4 6-8 0-3 2-6 6-7-1 2-1 3 0 4 2-1 4-1 6 0-2 1-3 2-3 4 0 5-5 8-9 8M9 12c-2-1-4-1-6 0',
  elemental: 'M12 3c1 4 6 6 6 11a6 6 0 0 1-12 0c0-3 2-4 3-6 0 2 1 3 2 3 0-3 0-5 1-8z',
  fey: 'M12 12c-2-5-7-7-8-5s2 6 8 5zM12 12c2-5 7-7 8-5s-2 6-8 5zM12 12c-1.5 3-4.5 5-6 4s.5-4 6-4zM12 12c1.5 3 4.5 5 6 4s-.5-4-6-4zM12 9v10',
  fiend: 'M5 3c0 4 2 6 4 7M19 3c0 4-2 6-4 7M7 13a5 5 0 0 0 10 0c0-2-2-3-5-3s-5 1-5 3zM10 13.5h.01M14 13.5h.01M10.5 16.5h3',
  giant: 'M2 21l6-10 4 5 3-4 7 9zM8 11l1.5-3L11 11',
  humanoid: 'M12 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 21v-5a6 6 0 0 1 12 0v5M9 21v-4M15 21v-4',
  monstrosity: 'M5 4c3 4 4 9 3 16M11 3c2 5 2 11 0 18M17 4c2 4 3 9 1 16',
  ooze: 'M4 18c0-6 3-11 8-13 5 2 8 7 8 13 0 2-2 3-4 2-1 1-3 1-4 0-1 1-3 1-4 0-2 1-4 0-4-2zM10 12h.01M14 12h.01',
  plant: 'M12 21V11M12 11C12 6 8 3 4 3c0 5 3 8 8 8zM12 14c0-4 3-7 8-7 0 4-3 7-8 7z',
  undead: 'M5 11a7 7 0 1 1 14 0c0 2.4-1 3.8-2 4.6V19h-3v-2h-4v2H7v-3.4C6 14.8 5 13.4 5 11zM9 11h.01M15 11h.01',
}

export function CreatureTypeIcon({ type, size = 18 }: { type: CreatureType; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[type]} />
    </svg>
  )
}
