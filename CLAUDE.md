# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Grimório de Venetia** — a D&D 5.5 (2024 edition) character creator SPA. No backend; all
persistence is `localStorage`. Stack: React 19 + TypeScript + Vite + Tailwind CSS v4 + Zustand +
React Router v7 + Framer Motion + Zod + uuid + i18next. Also packaged as an Android app via
Capacitor (`/android`).

## Commands

```bash
npm run dev       # Vite dev server
npm run build      # tsc -b (typecheck, project references) && vite build — treat this as the test suite
npm run lint        # eslint .
npm run preview      # serve the production build locally
```

There is no test runner configured (no `*.test.*` files, no vitest/jest). **`npm run build` is
the correctness gate** — it runs the full TypeScript project-reference build before bundling, so
a clean build is the closest thing to "tests pass" in this repo. Always run it after non-trivial
changes.

Android (Capacitor), only relevant when touching native packaging:
```bash
npm run build && npx cap sync
```

## Architecture

### Data flow: one Zustand store, a pure recalculation pipeline, debounced persistence

- `src/store/fichaStore.ts` is the single source of truth (`useFichaStore`). Every mutation
  (wizard steps, in-play actions like damage/rest/level-up) goes through an action here. Most
  actions that touch attributes, class, species, level, armor, or spell slots call
  `recalcular(ficha)` before returning the new state — derived fields are never hand-patched.
- `src/lib/recalcular.ts` is a pipeline of pure functions
  (`recalcularModificadores → recalcularCombate → recalcularPericias → recalcularMagia`), each
  taking and returning a `Ficha`. Derived/computed fields on `Ficha` are prefixed with `_`
  (e.g. `_modificador`, `_valor`, `_cd_magia`, `_bonus_ataque_magia`) to distinguish them from
  user-editable fields — never set a `_`-prefixed field directly, only through `recalcular`.
- `src/lib/calculos.ts` holds the actual D&D rules math (modifiers, proficiency bonus, AC, HP,
  saves, skills, spell DC) as standalone pure functions — this is where rules logic should live,
  not inline in the store or components.
- The store subscribes to itself (bottom of `fichaStore.ts`) and debounce-saves
  (`DEBOUNCE_SAVE_MS`, in `src/constants`) to `localStorage` via `src/services/fichaStorage.ts`
  any time `fichaId` is set — components never call storage directly.
- `src/lib/fichaInicial.ts` is the factory for a brand-new blank `Ficha`.

### Game data: static rules data vs. localized content are separate systems

- `src/data/dnd_dados.json` (~180KB) is the single static rules dataset — classes, species,
  backgrounds, feats, progression tables, armors. It is imported and cast via
  `dadosJson as unknown as DadosJogo` (see `src/types/dados.ts`) in both the store and
  `recalcular.ts`. This file is **not localized** — game data strings (spell/item/class names,
  descriptions) are intentionally left untranslated per an explicit product decision.
- Items (`src/data/itens/`) and spells (`src/data/spells/`) are the exception: each has parallel
  `pt/` and `en/` subfolders with identically-shaped modules. `src/data/itens.ts` and
  `src/data/magias.ts` re-export `getXxx()` functions that pick the PT or EN array based on
  `i18n.language` at call time — always read item/spell data through these getters, never import
  the `pt/`/`en/` modules directly from components.
- Types for items/spells live in `src/data/itens/types.ts` and `src/data/spells/types.ts`; types
  for the rules dataset and the in-progress character live in `src/types/dados.ts` and
  `src/types/ficha.ts` respectively (both re-exported from `src/types/index.ts`).

### i18n: two independent translation layers

- UI strings: `i18next` + `react-i18next`, initialized in `src/i18n/index.ts`. Language is read
  from the persisted `useConfigStore` (`venetia-config` in localStorage, key `lingua`), and
  `i18n/index.ts` subscribes to that store to call `i18n.changeLanguage` on change. UI strings
  live in `src/i18n/pt.ts` / `src/i18n/en.ts`; components use `useTranslation()` + `t('ns.key')`.
- Game data strings (items/spells): handled separately via the `getXxx()` pattern above, driven
  directly by `i18n.language`, not by a `t()` call.
- When adding a component that renders any user-facing text, use `useTranslation` — don't
  hardcode strings. When adding new item/spell data, add entries to both `pt/` and `en/`.

### Routing & pages

- `src/App.tsx`: three lazy-loaded routes — `/` (`Home`, the saved-character list), `/novo`
  (`Wizard`, character creation), `/ficha/:id` (`Ficha`, the play sheet). Wrapped in an
  `ErrorBoundary` (`src/pages/ServerError.tsx`) and a `Suspense` fallback.
- `src/pages/Wizard.tsx` drives `src/components/wizard/Step01…Step12*.tsx` in sequence, tracked by
  `passoAtual`/`setPasso` in the store; each step calls the corresponding store setter
  (`setNivel`, `setClasse`, `setEspecie`, …) which internally triggers `recalcular`.
- `src/pages/Ficha.tsx` is the in-play sheet: tabs render `src/components/ficha/PainelXxx.tsx`
  panels (Combate, Atributos, Perícias, Recursos, Magia, Inventário, Anotações, Editar). Edits in
  any panel go through store actions, not local component state that bypasses the store.

### Known data-model gotchas (read before touching combat/resources code)

- `Armadura` fields are `id, nome, categoria, ca, requisito_for?, penalidade_furtividade?,
  custo_po?, peso_kg?` — there is no `ca_base`, `tipo_ca`, or `forca_minima` on the in-store
  combat armor type (don't confuse with `src/data/itens/types.ts`'s `Armadura`, which is a
  different, item-catalog shape with `forca_minima`/`desvantagem_furtividade`).
- `recursos_de_classe.surto_de_acao` is tracked via `.usos`, not `.maximo`.
- `atualizarRecurso` in the store casts through `as typeof r` because `recursos_de_classe` is a
  union of differently-shaped class resources — keep that cast if you extend it.
- WCAG AA contrast: use `text-[#A8A09B]` (6.59:1 on the `#2D2520` background), not the older
  `#6B6560` (2.98:1, fails AA) — this was a deliberate global fix, don't reintroduce the old color.

## Conventions

- Path alias `@/*` → `src/*` (configured in both `vite.config.ts` and `tsconfig.app.json`) is
  available but the existing code mixes it with relative imports; match whichever a given file
  already uses.
- Domain naming is Portuguese throughout the codebase (types, store actions, variables — `ficha`,
  `atributos`, `pericias`, `dadosJson`) even in files that render English UI text. Keep new code
  consistent with this — don't translate identifiers.
- Constants (pool sizes, level caps, storage keys, debounce timing, fixed-per-class languages,
  point-buy costs) belong in `src/constants/index.ts`, not inlined.
