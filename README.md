# Grimório de Venetia

A D&D 5.5 (2024 edition) character creator and play sheet — single-page app, no backend.
Create a character through a guided wizard, then track combat, resources, spells, and inventory
during play. Also packaged as an Android app via Capacitor.

## Stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · Zustand · React Router v7 · Framer Motion · Zod ·
i18next

## Getting started

```bash
npm install
npm run dev       # Vite dev server
```

```bash
npm run build      # tsc -b (typecheck) && vite build — the correctness gate for this repo
npm run lint        # eslint .
npm run preview      # serve the production build locally
```

There is no test runner configured. `npm run build` runs the full TypeScript project-reference
build before bundling, so a clean build is the closest thing to "tests pass" in this repo —
always run it after non-trivial changes.

### Android (Capacitor)

```bash
npm run build && npx cap sync
```

## Features

- **Guided wizard** — 13-step character creation (level, species, class, attributes, skills,
  multiclass, spells, equipment, background, review).
- **Play sheet** — tabbed panels for combat, attributes, skills, class resources, spellcasting,
  inventory, and notes, with level-up (including ASI and multiclass) handled in place.
- **Multiclassing** — full support for secondary classes, prerequisites, granted proficiencies,
  and multiclass spell slot/spellcaster-level calculation.
- **Official sheet export** — fill the official D&D 5.5 (2024) character sheet as a PDF, in
  Portuguese or English, either complete (flattened, ready to archive) or blank of everything
  that changes during play (current HP, XP, spent slots, coins) for printing and filling in by
  hand. Printing opens the browser's print dialog directly.
- **Local-first** — every character is stored in `localStorage`; no account, no server, no
  network dependency.
- **i18n** — UI available in Portuguese and English.

## Architecture

- `src/store/fichaStore.ts` — the single Zustand store (`useFichaStore`) that all character
  mutations go through. Actions that touch attributes, class, species, level, armor, or spell
  slots run the result through `recalcular` before returning state, so derived fields are never
  hand-patched.
- `src/lib/recalcular.ts` — a pipeline of pure functions
  (`recalcularModificadores → recalcularCombate → recalcularPericias → recalcularMagia`) that
  compute every derived (`_`-prefixed) field on a `Ficha`.
- `src/lib/calculos.ts` — the actual D&D rules math (modifiers, proficiency bonus, AC, HP, saves,
  skills, spell DC) as standalone pure functions.
- `src/data/dnd_dados.json` — the static rules dataset (classes, species, backgrounds, feats,
  progression tables, armors), intentionally left untranslated. Items, spells, and backgrounds
  live in `src/data/{itens,spells,antecedentes}/` with parallel `pt/`/`en/` modules, exposed
  through `getXxx()` getters that pick a language at call time.
- `src/store/configStore.ts` — a second, independent persisted store for user preferences
  (language, weight/gold tracking, etc.); it never touches `recalcular`.
- `src/pages/` — `Home` (saved characters), `Wizard` (creation flow), `Ficha` (play sheet),
  routed in `src/App.tsx`.

See `CLAUDE.md` for the full architecture notes, data-model gotchas, and conventions used across
the codebase.

## Project structure

```
src/
  components/    UI components (wizard steps, ficha panels, shared)
  constants/     pool sizes, level caps, storage keys, point-buy costs, etc.
  data/          static rules data + localized items/spells/backgrounds
  hooks/         useAtributosWizard, useFichaExport, useFichaPdf, ...
  i18n/          UI translation strings (pt/en)
  lib/           recalcular.ts, calculos.ts (rules math)
  lib/pdf/       official-sheet export (generated field map + filler)
  pages/         Home, Wizard, Ficha
  services/      fichaStorage.ts (localStorage persistence)
  store/         fichaStore.ts, configStore.ts
  types/         Ficha, DadosJogo, and related types
android/         Capacitor Android project
public/          static assets, including the two blank sheet models (~4.5 MB each)
scripts/         one-off node tools that build those models and generate the field map
```

The PDF pipeline (how the blank models and `src/lib/pdf/camposFicha.ts` are produced) is
documented in `scripts/README.md`.
