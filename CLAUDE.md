# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Grimório de Venetia** — a D&D 5.5 (2024 edition) character creator SPA. No backend; all
persistence is `localStorage`. Stack: React 19 + TypeScript + Vite + Tailwind CSS v4 + Zustand +
React Router v7 + Framer Motion + uuid + i18next + pdf-lib. Also packaged as an Android app via
Capacitor (`/android`).

## Commands

```bash
npm run dev       # Vite dev server
npm run build      # tsc -b (typecheck, project references) && vite build
npm test           # vitest run — unit tests for the rules layer, the store and the catalog
npm run lint        # eslint .
npm run test:e2e     # playwright (needs a dev server; the config starts one)
npm run preview      # serve the production build locally
```

**`npm run build` plus `npm test` is the correctness gate.** The build runs the full TypeScript
project-reference pass before bundling; the unit suite (`vitest.config.ts`, `src/**/*.test.ts`)
covers the rules math, the recalculation pipeline, the store actions and the item catalog's
integrity. Run both after non-trivial changes. Tests run in `environment: 'node'` — `vitest.setup.ts`
stubs the `localStorage` that `i18n` and the store read at import time. Sheet fixtures live in
`src/test/fixtures.ts` (`makeSheet` builds a sheet and runs `recalculate` on it).

Android (Capacitor), only relevant when touching native packaging:
```bash
npm run build && npx cap sync
cd android && ./gradlew assembleDebug   # → android/app/build/outputs/apk/debug/app-debug.apk
```

Releases: `npm run release [patch|minor|major|vX.Y.Z]` (`scripts/release.sh`) runs the gate and
pushes an annotated `vX.Y.Z` tag; `.github/workflows/release.yml` then builds the signed APK with
`scripts/build-android-release.sh` and publishes the GitHub Release. Signing comes from four repo
secrets set once by `scripts/setup-release-secrets.sh`. `versionCode` is derived from the tag
(`v1.2.3` → `10203`) and passed as `-PversionCode` — don't hardcode it back into `build.gradle`.

The installed app updates itself from those releases: `UpdatePrompt` (mounted in `App.tsx`) calls
`checkForUpdate` (`src/lib/appUpdate.ts`), which on Android release builds fetches
`releases/latest` and compares `versionCodeFromTag(tag)` — the same formula as the build script, keep
them in sync — with the installed `versionCode`. Download and install are native, in the local
plugin `android/.../AppUpdaterPlugin.java` (registered in `MainActivity.onCreate` before `super`):
it downloads into `cacheDir/updates/`, sends the user to the "install unknown apps" screen when
`canRequestPackageInstalls()` is false, and hands the file to the system installer via the existing
`FileProvider`. Debug builds skip the check (different signing key — the installer would refuse).

Launcher icon and splash are generated from `assets/` (`icon-only.png`, `icon-foreground.png`,
`icon-background.png`, `splash.png`, `splash-dark.png`, background `#1A1612`) with
`npx capacitor-assets generate --android` — rerun it after changing any of them; until it runs,
the APK ships Capacitor's placeholder icon. The adaptive-icon XML already insets the foreground
16.7%, so `icon-foreground.png` is the full icon with no extra padding. The launcher name is
localized in `res/values/strings.xml` (EN, "Venetia's Grimoire") and `res/values-pt/strings.xml`
("Grimório de Venetia"), matching the `title` key in `src/i18n/`.

## Naming: English code, Portuguese comments

Identifiers, filenames and folders are all **English** (`sheetStore.ts`, `recalculate.ts`,
`CombatPanel.tsx`, `src/data/rules/`). Code **comments and JSDoc stay Portuguese** — that is the
project's writing language, not leftover drift; keep writing them in Portuguese.

Three things are deliberately still Portuguese because changing them breaks something outside the
code: route paths (`/novo`, `/ficha/:id`), `data-testid` values (the e2e scaffold keys off them),
and localStorage keys (`dnd_ficha_*`, `dnd_fichas_lista`) plus the domain ids inside the rules data
(`barbaro`, `atletismo`, `'Leve'`, `'Escudo'`), which the rules math compares as raw strings.

## Architecture

### Data flow: one Zustand store, a pure recalculation pipeline, debounced persistence

- `src/store/sheetStore.ts` is the single source of truth (`useSheetStore`). Every mutation
  (wizard steps, in-play actions like damage/rest/level-up) goes through an action here. Most
  actions that touch abilities, class, species, level, armor, or spell slots call
  `recalculate(sheet)` before returning the new state — derived fields are never hand-patched.
- `src/lib/recalculate.ts` is a pipeline of pure functions
  (`recalculateModifiers → recalculateCombat → recalculateSkills → recalculateSpellcasting`), each
  taking and returning a `CharacterSheet`. Derived/computed fields on `CharacterSheet` are prefixed
  with `_` (e.g. `_modifier`, `_value`, `_spell_dc`, `_spell_attack_bonus`) to distinguish them
  from user-editable fields — never set a `_`-prefixed field directly, only through `recalculate`.
- `src/lib/calculations.ts` holds the actual D&D rules math (modifiers, proficiency bonus, AC, HP,
  saves, skills, spell DC) as standalone pure functions — this is where rules logic should live,
  not inline in the store or components.
- The store subscribes to itself (bottom of `sheetStore.ts`) and debounce-saves
  (`DEBOUNCE_SAVE_MS`, in `src/constants`) to `localStorage` via `src/services/sheetStorage.ts`
  any time `sheetId` is set — components never call storage directly.
- `src/lib/initialSheet.ts` is the factory for a brand-new blank sheet (`createInitialSheet`).

### Game data: canonical Portuguese modules + a whole-string translation layer

- `src/data/rules/*.ts` are the static rules dataset — classes, species, backgrounds, feats,
  progression tables, armors — one default-exported array per file, assembled in
  `src/data/rules/index.ts`.
- `gameDataPt` is canonical and always Portuguese: the rules compare raw strings (`'Leve'`,
  `'Escudo'`), so they must not vary with the UI language. `src/data/rules/translation.ts` translates
  whole strings through `EN_DICTIONARY` for display-bearing keys only (`TRANSLATABLE_KEYS`);
  anything missing from the dictionary stays Portuguese.
- Components read `gameData` (also from `src/data/rules`) — a `Proxy` that resolves
  `translateData(gameDataPt, i18n.language)` on every property read, so it follows a language
  switch with no subscription. Use `gameData` in UI code and `gameDataPt` only where rules math
  needs the canonical strings.
- Items (`src/data/items/`), spells (`src/data/spells/`), and backgrounds (`src/data/backgrounds/`)
  are a separate system: each has parallel `pt/` and `en/` subfolders with identically-shaped
  modules. The two languages must hold **the same ids in the same order** — `getItems()` returns
  them in file order and the search caps results, so a divergent order silently changes what a
  search shows per language. `src/data/catalog.test.ts` enforces that, plus id uniqueness,
  recognized rarities and `uses` parity. `src/data/items.ts`, `src/data/spells.ts`, and `src/data/backgrounds.ts` re-export
  `getXxx()` functions that pick the PT or EN array based on `i18n.language` at call time — always
  read localized data through these getters, never import the `pt/`/`en/` modules directly from
  components.
- Types for items/spells live in `src/data/items/types.ts` and `src/data/spells/types.ts`; types
  for the rules dataset and the in-progress character live in `src/types/gameData.ts` (`GameData`) and
  `src/types/sheet.ts` (`CharacterSheet`) respectively (both re-exported from `src/types/index.ts`).

### i18n: two independent translation layers

- UI strings: `i18next` + `react-i18next`, initialized in `src/i18n/index.ts`. Language is read
  from the persisted `useConfigStore` (`venetia-config` in localStorage, key `language`), and
  `i18n/index.ts` subscribes to that store to call `i18n.changeLanguage` on change. UI strings
  live in `src/i18n/pt.ts` / `src/i18n/en.ts`; components use `useTranslation()` + `t('ns.key')`.
  The play-sheet namespace is `sheet.*`; wizard step titles are `wizard.steps.*`, keyed by the
  `stepKey` values in `src/pages/Wizard.tsx`.
- Game data strings: handled by the two systems above (`translateData` for the rules dataset,
  `getXxx()` for items/spells/backgrounds), driven directly by `i18n.language`, not by `t()`.
- `pt.ts` and `en.ts` must stay key-for-key identical, including `{{interpolation}}` placeholder
  names — those placeholders are English (`{{name}}`, `{{charClass}}`, `{{level}}`) and must match
  what the call site passes. Key-for-key parity is not enough on its own: a key written into the
  wrong namespace is identical in both files and still renders as raw `edit.attackName` on screen,
  so `src/i18n/keys.test.ts` resolves every literal `t('ns.key')` in `src/` against both catalogs.
- When adding a component that renders any user-facing text, use `useTranslation` — don't
  hardcode strings. When adding new item/spell/background data, add entries to both `pt/` and `en/`.

### Second store: useConfigStore

- `src/store/configStore.ts` is a separate persisted Zustand store (`useConfigStore`, key
  `venetia-config`) for user preferences: `track_weight`, `manage_gold`, `sale_refund`,
  `simple_coins`, `language`. It never calls `recalculate` — it is entirely independent of the
  sheet store. It is at persist `version: 1` with a `migrate` for the old Portuguese field names,
  and a custom `merge` so newly added preferences keep their defaults instead of being dropped by
  zustand's shallow merge.

### Routing & pages

- `src/App.tsx`: three lazy-loaded routes — `/` (`Home`, the saved-character list), `/novo`
  (`Wizard`, character creation), `/ficha/:id` (`Sheet`, the play sheet). Wrapped in an
  `ErrorBoundary` (`src/pages/ServerError.tsx`) and a `Suspense` fallback.
- `src/pages/Wizard.tsx` drives 13 steps in sequence, tracked by `currentStep`/`setStep` in the
  store. Step filenames (`Step01Level` … `Step12Review`) do **not** match the step ids: the `STEPS`
  array runs Level, Class, Subclass, Species, Abilities (`Step06Abilities`, id 5), Background
  (`Step05Background`, id 6), `StepMulticlass` (id 7), Skills, Spells, Languages, Equipment,
  Personality, Review (id 13). The array is the source of truth for order. Each step calls the corresponding store setter which internally triggers
  `recalculate`.
- `src/pages/Sheet.tsx` is the in-play sheet: tabs render `src/components/sheet/XxxPanel.tsx`
  panels (Combat, Abilities, Skills, Resources, Spells, Inventory, Notes, Edit). Edits in
  any panel go through store actions, not local component state that bypasses the store.
- Every tab lays out in two columns from `lg:` up (`grid-cols-2`, or a `1fr` + fixed-width aside),
  with the wide sections — spells, personality, the bag — spanning the full row below. The page
  container is `max-w-[1180px]`; don't put a `max-w-2xl` back around a tab, that was what made
  these panels a single tall column on desktop.
- `EditPanel` is the only way to reach most fields once the wizard is done, so a field that is
  only settable in a wizard step is a gap — it covers identity, appearance, progression,
  multiclass, class choices (`src/lib/classChoices.ts` decides which apply, shared with
  `Step03Subclass`), feats, abilities, movement, armor, attacks, skills + expertise,
  proficiencies, spells, personality and the bag. Changing the background there goes through
  `setBackground` (skills + feat + the +3 ability spread), never `setBackgroundId` alone.
  `LevelUpModal` (in `src/components/sheet/`) handles ASI selection (+2 or +1+1) on level-up and
  supports choosing which class (primary or multiclass) gains the level.

### Hooks

- `src/hooks/useWizardAbilities.ts` (`useWizardAbilities`) encapsulates all ability-assignment
  logic for the wizard step. It manages three methods (`standard` — assign from the standard array
  `[15,14,13,12,10,8]`; `random` — roll 4d6-drop-lowest then assign dice to slots; `pointBuy` —
  27-point buy). Components should use this hook rather than re-implementing point-buy math.
- `src/hooks/useSheetExport.ts` (`useSheetExport`) wraps the store's `exportSheetJson`/
  `importSheetJson` with browser file download/upload mechanics. Use this hook from UI components
  instead of touching `localStorage` or blobs directly.
- `src/hooks/useSheetPdf.ts` (`useSheetPdf`) generates the official sheet as a PDF —
  `generatePdf(mode, action)` with `mode: 'export' | 'print'` and `action: 'download' | 'print'`. It picks the model by `i18n.language`, caches it per path, and lazily imports
  `fillSheet` so pdf-lib stays out of the main chunk.

### PDF export: two prefilled models and a generated field map

- `public/sheet-template.pdf` (PT-BR) and `public/sheet-template-en.pdf` are the official D&D 5.5 sheets carrying **the same 411 AcroForm fields, with the same names, at the same coordinates** — PT and EN are the same InDesign template (603×774 pts). That is what lets `fillSheet.ts` fill either one without knowing the language.
- `src/lib/pdf/sheetFields.ts` is **generated** — do not hand-edit. The PDF's own field names are machine-generated (`text_1aoob`, `checkbox_148cprb`); the generator identifies each field by page + position and fails if any field ends up without a semantic key. Regenerate with the pipeline in `scripts/README.md`.
- `src/lib/pdf/fillSheet.ts` maps a `CharacterSheet` onto those keys. `export` fills everything and flattens; `print` leaves blank what changes during play (current/temp HP, spent Hit Dice, XP, spent spell slots, coins) and keeps the form editable. That split is documented in the file's header with its three sources (2024 rest rules, the sheet's own tracker boxes, the store's in-play actions) — keep it in sync if you add fields.
- `src/lib/deliverFile.ts` decides how a finished file (the PDF, and the JSON export too) reaches the user, and `src/lib/platform.ts` holds the predicate both it and the UI read (`deliverViaShare`). Desktop keeps `<a download>` / hidden-iframe printing; touch browsers go through the Web Share API; inside the app the file is written to `Directory.Cache` with `@capacitor/filesystem` — in ~1 MB chunks (`writeFile` + `appendFile`), never one multi-MB base64 message over the bridge — and handed to `@capacitor/share`, because the WebView ignores `<a download>` and has no print dialog. Adding either plugin means running `npx cap sync` again.
- Death saves, Heroic Inspiration and item attunement are never filled: `CharacterSheet` has no such fields.
- Class resources print their **maximum** only (level-derived, permanent); the current value is restored by `longRest` and stays out.
- Two PDF gotchas, both already worked around — don't "simplify" them away:
  - The checkboxes' on-state appearance references a font the widget doesn't declare, so `check()` renders nothing and `flatten()` emits broken XObjects. Marks are drawn on the page as filled circles and the checkbox fields are removed before flattening.
  - Each widget carries its own `/DA`, which **overrides** the field-level one — `setFontSize()` alone has no effect, so the widget `/DA` is deleted whenever the font is shrunk to fit.

### GM area (`/mestre`)

- Built in phases: players (done), NPC statblocks,
  combat tracker, grid map editor, map + combat, SRD 5.2 monster catalog. Online play is a later
  phase — every GM entity carries a uuid and `updated_at` so a sync layer can do last-write-wins.
- `src/store/gmStore.ts` (`useGmStore`) is separate from the sheet store and owns the open
  `Campaign`; every edit goes through `updateCampaign`, which stamps `updated_at`. It debounce-saves
  through `src/services/gmStorage.ts` (`dnd_mestre_campanhas` index + `dnd_mestre_campanha_<id>`),
  and flushes the pending save on `openCampaign`, on switching campaigns and on
  `pagehide`/`visibilitychange` — reopening or closing the app inside the debounce lost the last edit.
- Party members are `local` (live link by `sheet_id`, snapshot refreshed on every `openCampaign`;
  a deleted sheet degrades to `imported`) or `imported` (JSON snapshot, read with
  `parseSheetImport`, changes only on reimport). The GM never writes back into a player's sheet.
- Campaign export is an envelope (`format: 'venetia-campaign'`, `src/lib/gm/party.ts`); importing
  creates a new campaign and turns every local member into an imported one.
- UI strings live under `gm.*`. Shared helpers: `pickTextFile` (`src/lib/pickTextFile.ts`) and
  `deliverJson` (`src/lib/deliverJson.ts`), also used by `useSheetExport`.

### localStorage key schema and legacy migration

- Individual sheets: `dnd_ficha_<uuid>` (raw `CharacterSheet` JSON).
- List index: `dnd_fichas_lista` (array of `SheetListItem`). A `complete` flag on each list item is
  never downgraded once set to `true` — the wizard sets it only upon finishing the final review
  step (currently step 13, `Step12Review` component).
- Exported JSON is an envelope (`src/lib/sheetExport.ts`: `format: 'venetia-sheet'`, `version`,
  `complete`, `sheet`) because that flag lives in the list, not the sheet — without it every import
  came back as a draft. Older raw-sheet exports still import; they count as complete when class,
  species and background are set.
- The storage **keys** never changed across the Portuguese→English identifier rename, but every
  field *inside* them did. `src/lib/migrateLegacyPt.ts` translates the old shapes field by field —
  `translateLegacyPtSheet` (called from `migrateSheet`, so it covers both stored sheets and
  imported JSON), `translateLegacyPtListItem` (called from `sheetStorage.readList`) and
  `translateLegacyPtConfig` (the `configStore` persist migration). It is deliberately **not** a
  recursive key rename: `skills` and `choices_made` are Records whose keys are domain ids
  (`historia`, `natureza`) that would collide with field names. If you rename a persisted field,
  add it there.
- `src/lib/migrateSheet.ts` (`migrateSheet`) then fills in fields added after a sheet was saved,
  using `createInitialSheet()` as the default source.

### Multiclass system

- `CharacterSheet.identity.multiclasses` is an array of `{ class_id, subclass_id, level }` for
  secondary classes. The primary class level is `sheet.identity.level - sum(multiclasses[].level)`
  — never stored redundantly.
- Store actions: `addMulticlass`, `removeMulticlass`, `setMulticlassLevel`, `setMulticlassSubclass`.
  `levelUp` accepts an optional `targetClassId` to route the level gain to a specific class.
- Prerequisites (`MULTICLASS_PREREQUISITES`) and granted proficiencies (`MULTICLASS_PROFICIENCIES`)
  live in `src/constants/index.ts`.
- Spellcasting is recalculated via `calcMulticlassCasterLevel` and `calcMulticlassSlots` in
  `src/lib/calculations.ts`, using `CASTER_TYPE` weights (`completo`, `meio`, `null`).
  `THIRD_CASTER_SUBCLASSES` in constants handles the Eldritch Knight/Arcane Trickster ⅓-caster
  subclasses.
- HP on level-up uses `calcMulticlassHp`, which knows each class's hit die separately.

### Known data-model gotchas (read before touching combat/resources code)

- `Armor` (in `src/types/gameData.ts`) has `id, name, category, ac, str_requirement?,
  stealth_penalty?, cost_gp?, weight_kg?` — there is no `base_ac`, `ac_type`, or `min_strength` on
  the in-store combat armor type (don't confuse with `src/data/items/types.ts`'s `Armor`, which is
  a different, item-catalog shape with `min_strength`/`stealth_disadvantage`).
- `class_resources.action_surge` is tracked via `.uses`, not `.max`.
- `updateResource` in the store casts through `as typeof r` because `class_resources` is a
  union of differently-shaped class resources — keep that cast if you extend it.
- The progression rows in `src/data/rules/classes.ts` use `slots` for standard casters and
  `max_spell_level` + `spell_slots` (a count) for the Warlock's Pact Magic — `recalculateSpellcasting`
  branches on which one is present.
- Spell slots live in **three separate pools**, because the 2024 rules treat them as different
  things (see the JSDoc on `recalculateSpellcasting`): `spellcasting.spell_slots` (Spellcasting),
  `spellcasting.pact_slots` (Warlock Pact Magic — `CASTER_TYPE['bruxo'] === 'pacto'`, deliberately
  **excluded** from `calcMulticlassCasterLevel`, restored by `shortRest`), and
  `spellcasting.free_casts` (casts that spend no slot at all). Never fold one into another — the PDF
  is the only place they get summed, because the official sheet has a single row per circle.
- Which table `spell_slots` comes from depends on the build: multiclass → `calcMulticlassSlots` on
  the summed caster level; a single class with a `THIRD_CASTER_SUBCLASSES` subclass →
  `calcThirdCasterSlots` (Eldritch Knight / Arcane Trickster have their **own** table, which is not
  the multiclass one — at level 4 it gives 3 first-circle slots where the multiclass table gives 2);
  any other single class → its own `progression[].slots`.
- `free_casts` is derived by `recalculateFreeCasts` and holds two kinds: `magic_initiate` (one per
  acquired feat, 2 cantrips + a level-1 spell with its own chosen ability) and `mystic_arcanum`
  (warlock levels 11/13/15/17, per `MYSTIC_ARCANUM_BY_LEVEL`). The list is derived but the player's
  choices are preserved by id across recalcs, so the store's `setFreeCastChoices` is the only writer.
  `FreeCastPicker` (`src/components/ui/`) is the shared editor, used by both `Step08Spells` and
  `EditPanel`.
- `CASTER_TYPE` values feed `calcMulticlassCasterLevel`: `completo` counts full levels, `meio`
  counts half **rounded up** (Paladin/Ranger get Spellcasting at level 1 in 2024), and
  `THIRD_CASTER_SUBCLASSES` count a third **rounded down**. `CASTER_TYPE[id] != null` is **not** a
  complete "does this cast?" test — it misses third casters, whose class is `null`; use
  `isCasterClass(classId, subclassId)` from `calculations.ts` instead.
- Third casters conjure from the **wizard** list, not from a fighter/rogue list (which doesn't
  exist): `spellListForClass(classId, subclassId)` gives the catalog key, while `classId` stays the
  storage key in `cantrips_by_class` / `spells_by_class`. Keep those two apart.
- In multiclass every class casts with its own ability, so `_spell_dc_by_class` /
  `_spell_attack_by_class` are the real numbers; the scalar `_spell_dc` / `_spell_attack_bonus` keep
  the primary caster's values for the PDF and single-class UI.
- Origin feats and General feats are **not** interchangeable: the level-4 ASI grants a General feat
  (`gameData.general_feats`, which is what `LevelUpModal` offers) and Origin feats come from the
  background or from a species that grants one (`SPECIES_WITH_ORIGIN_FEAT` — only Human's Versatile
  in 2024, picked in `Step04Species` via `setSpeciesOriginFeat`). Don't "fix" Magic Initiate's
  absence from the level-up list by moving it there. Species-granted feats are tagged
  `source: FEAT_SOURCE_SPECIES` and are dropped when the species changes.
- The item search (`BackpackSearch`, shared by the wizard's equipment step and the sheet's bag) has
  a rarity filter that only appears under the magic-item type and is cleared when you leave it.
  It compares `itemRarityKey(item)`, the canonical key, so the filter behaves the same in PT and EN.
- Magic items with a fixed use budget carry `uses: { max, recharge }` in the catalog
  (`src/data/items/*/magic_items.ts`, type in `items/types.ts`); the sheet stores only
  `InventoryItem.uses_spent`. `recharge: 'dawn'` is refilled by `longRest` (the sheet has no other
  marker for a new day); `'manual'` items (wands and staves that regain 1d6+1 a day) are only
  restored by hand. Two constants wire items back into the spell pools inside `spendItemUse`:
  `ITEMS_RESTORING_PACT_SLOT` (Rod of the Pact Keeper — gives back a pact slot, no choice) and
  `ITEMS_RESTORING_SPELL_SLOT` (Pearl of Power — maps the item to the highest circle it reaches;
  `spendItemUse(idx, slotLevel)` refuses the use unless that circle is within range and actually
  has a spent slot, so the charge is never burned for nothing).
- WCAG AA contrast: use `text-[#A8A09B]` (6.59:1 on the `#2D2520` background), not the older
  `#6B6560` (2.98:1, fails AA) — this was a deliberate global fix, don't reintroduce the old color.

## Conventions

- Path alias `@/*` → `src/*` (configured in both `vite.config.ts` and `tsconfig.app.json`) is
  available but the existing code mixes it with relative imports; match whichever a given file
  already uses.
- Constants (pool sizes, level caps, storage keys, debounce timing, fixed-per-class languages,
  point-buy costs) belong in `src/constants/index.ts`, not inlined.
