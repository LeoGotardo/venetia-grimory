# Product

## Register

product

## Users

Brazilian D&D 5.5 (2024) tables. Two roles share the app:

- **Players** create and play their own character sheet, mostly on a phone.
- **Game masters** use the GM area for two jobs in equal measure: preparing sessions on a
  notebook or desktop (campaigns, NPCs, bestiary, maps), and running them at the table on a
  tablet or phone, alternating between consulting the encounter and turning the screen to the
  players to show the map. Ambient light is a living room or a game shop table in the evening.

The app is offline-first (localStorage, Android via Capacitor) and bilingual (PT-BR first, EN).

## Product Purpose

Replace the GM's paper notes, stat block books and battle mat with one tool that is fast enough
to use mid-combat: who acts next, how many HP are left, what the monster can do, where everyone
stands. Success is a GM who never has to leave the app to run a fight, and who can prepare an
encounter in minutes, including NPCs they did not plan for.

## Brand Personality

A well-kept grimoire: old-book warmth, gold leaf on dark leather, confident and quiet. Three words:
**arcane, legible, trustworthy**. Ornament is allowed where it frames (titles, section dividers,
the map), never where it slows reading (numbers, buttons, lists in combat).

## Anti-references

- Corporate SaaS dashboards: identical card grids, big-number hero metrics, gradient accents.
- Dense virtual-tabletop chrome (rows of toolbars and floating panels).
- Heavy medieval fantasy cliché: blackletter fonts, stone and wood textures, thick frames.

## Design Principles

1. **Combat first.** Anything used during a fight (initiative, HP, conditions, actions) reads at a
   glance on a tablet at arm's length and is one tap away.
2. **The book frames, the data speaks.** Grimoire styling lives in headings, dividers and empty
   states; numbers and controls stay plain, aligned and consistent.
3. **Teach in place.** Empty states and first steps show what to do next, with the action right
   there, not a paragraph about it.
4. **Same affordance, same look.** One button vocabulary, one way to add things, across campaigns,
   NPCs, bestiary, encounters and maps.
5. **Generate, then edit.** The app fills in what the GM didn't decide (names, stats, details), and
   everything it generates stays editable.

## Accessibility & Inclusion

WCAG 2.1 AA. Secondary text uses `#A8A09B` on the dark surfaces (the older `#6B6560` fails AA and
must not return). Touch targets at least 40px on the GM screens used at the table. Never rely on
color alone: terrain types carry a pattern or glyph, combatant kinds carry a label. Respect
reduced motion. All text goes through i18n (PT and EN).
