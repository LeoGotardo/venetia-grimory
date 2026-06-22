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
- Items (`src/data/itens/`), spells (`src/data/spells/`), and backgrounds (`src/data/antecedentes/`) are the exception: each has parallel `pt/` and `en/` subfolders with identically-shaped modules. `src/data/itens.ts`, `src/data/magias.ts`, and `src/data/antecedentes.ts` re-export `getXxx()` functions that pick the PT or EN array based on `i18n.language` at call time — always read localized data through these getters, never import the `pt/`/`en/` modules directly from components.
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
  hardcode strings. When adding new item/spell/background data, add entries to both `pt/` and `en/`.

### Second store: useConfigStore

- `src/store/configStore.ts` is a separate persisted Zustand store (`useConfigStore`, key `venetia-config`) for user preferences: `rastrear_peso`, `gerenciar_ouro`, `reembolso_venda`, `moedas_simples`, `lingua`. It never calls `recalcular` — it is entirely independent of `fichaStore`.

### Routing & pages

- `src/App.tsx`: three lazy-loaded routes — `/` (`Home`, the saved-character list), `/novo`
  (`Wizard`, character creation), `/ficha/:id` (`Ficha`, the play sheet). Wrapped in an
  `ErrorBoundary` (`src/pages/ServerError.tsx`) and a `Suspense` fallback.
- `src/pages/Wizard.tsx` drives 13 steps in sequence, tracked by `passoAtual`/`setPasso` in the
  store. Step components are `Step01Nivel` through `Step12Revisar` (filenames) but the sequence
  includes `StepMulticlasse` at position 7 (between Perícias and Magias), making the final review
  step id 13. Each step calls the corresponding store setter which internally triggers `recalcular`.
- `src/pages/Ficha.tsx` is the in-play sheet: tabs render `src/components/ficha/PainelXxx.tsx`
  panels (Combate, Atributos, Perícias, Recursos, Magia, Inventário, Anotações, Editar). Edits in
  any panel go through store actions, not local component state that bypasses the store.
  `LevelUpModal` (in `src/components/ficha/`) handles ASI selection (+2 or +1+1) on level-up and
  supports choosing which class (primary or multiclasse) gains the level.

### Hooks

- `src/hooks/useAtributosWizard.ts` encapsulates all attribute-assignment logic for the wizard step. It manages three methods (`padrao` — assign from the standard array `[15,14,13,12,10,8]`; `aleatorio` — roll 4d6-drop-lowest then assign dice to slots; `compra` — 27-point buy). Components should use this hook rather than re-implementing point-buy math.
- `src/hooks/useFichaExport.ts` wraps the store's `exportarJSON`/`importarJSON` with browser file download/upload mechanics. Use this hook from UI components instead of touching `localStorage` or blobs directly.

### localStorage key schema

- Individual fichas: `dnd_ficha_<uuid>` (raw `Ficha` JSON).
- List index: `dnd_fichas_lista` (array of `FichaListItem`). A `completa` flag on each list item is never downgraded once set to `true` — the wizard sets it only upon finishing the final review step (currently step 13, `Step12Revisar` component).

### Multiclasse system

- `Ficha.identidade.multiclasses` is an array of `{ classe_id, subclasse_id, nivel }` for secondary classes. The primary class level is `ficha.identidade.nivel - sum(multiclasses[].nivel)` — never stored redundantly.
- Store actions: `addMulticlasse`, `removeMulticlasse`, `setMulticlasseNivel`, `setSubclasseMulticlasse`. `levelUp` accepts an optional `classeIdAlvo` to route the level gain to a specific class.
- Prerequisites (`MULTICLASSE_PREREQUISITOS`) and granted proficiencies (`PROFICIENCIAS_MULTICLASSE`) live in `src/constants/index.ts`.
- Spellcasting is recalculated via `calcNivelConjuradorMulticlasse` and `calcSlotsMulticlasse` in `src/lib/calculos.ts`, using `TIPO_CONJURADOR` weights (`completo`, `meio`, `null`). `SUBCLASSES_TERCEIRO_CONJURADOR` in constants handles the Eldritch Knight/Arcane Trickster ⅓-caster subclasses.
- HP on level-up uses `calcPVMulticlasse`, which knows each class's hit die separately.

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
