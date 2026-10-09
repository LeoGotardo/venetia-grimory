# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Grimório de Venetia** — a D&D 5.5 (2024 edition) character creator SPA. Sheets and campaigns
persist locally (`localStorage`/IndexedDB); the only backend is the online rooms (`api/`, Vercel
Functions + Neon Postgres + Upstash Redis — see "Online rooms" below). Stack: React 19 + TypeScript + Vite + Tailwind CSS v4 + Zustand +
React Router v7 + Framer Motion + uuid + i18next + pdf-lib. Also packaged as an Android app via
Capacitor (`/android`).

## Commands

```bash
npm run dev       # Vite dev server — also serves api/ (HTTP + room WebSocket) from .env.local
npm run db:migrate # apply db/migrations/*.sql to the Neon database in .env.local
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

The Android back button goes through `@capacitor/app`: without a `backButton` listener Capacitor 8
just finishes the Activity and the whole app closes. `BackButtonBridge` (inside `BrowserRouter`)
runs the top handler of a stack in `src/lib/backButton.ts`, registered with `useBackHandler(active,
handler, layer)`: `overlay` first (every `Modal`, the export menu, the area editor's bottom sheet on
phones, the encounter's table view), then `page` — `GmHeader` registers its own back (same
destination and same "discard changes?" as the header button), the sheet goes home and the wizard
steps back one step. With nothing registered it goes up a route (`parentPath`), and on the home
screen it minimizes the app (`minimizeApp`, what Android does with a root Activity). A new overlay
or a screen with its own back button needs a `useBackHandler`, or the hardware back skips it.

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
  any time `sheetId` is set — components never call storage directly. The pending save is flushed
  on `pagehide`/`visibilitychange` and before `loadSheet` (`flushPendingSheetSave`): closing or
  backgrounding the app inside the debounce used to lose the last edit.
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

- Built in phases: players (done), NPC statblocks (done),
  combat tracker (done), grid map editor (done), map + combat (done), SRD 5.2 monster catalog (done, EN + full PT). Online play is a later
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
- NPCs and monsters share one `StatBlock` shape (`src/types/gm.ts`, 2024 layout, distances in
  meters). The **bestiary** (`dnd_mestre_bestiario`, `/mestre/bestiario`) is global across
  campaigns; a campaign's `npcs` are **copies** (`base_monster_id` points back), so editing an NPC
  never touches the bestiary. Rules math lives in `src/lib/gm/statblock.ts` (CR → XP/PB, saves,
  initiative, passive Perception) and `src/lib/gm/dice.ts` (`parseDice` / `averageDice` /
  `rollDice` with an injectable RNG). Anything read from storage or an imported JSON goes
  through `normalizeStatBlock` / `normalizeCampaign` (`src/lib/gm/normalize.ts`) — the GM
  equivalent of `migrateSheet`; Phase-1 campaigns had no `npcs`.
- The Monster Manual 2025 is not bundleable (only the SRD 5.2 is CC-BY). Users bring their own
  book's monsters through the editor or a "monster pack" (`format: 'venetia-monsters'`);
  importing a pack replaces entries with the same id.
- The statblock editor (`StatBlockEditLayout`) keeps a local draft and writes to the store only
  on Save, with a live `StatBlockCard` preview beside it from `lg:`.
  `StatBlockEditor.onChange` takes an updater (`prev => next`), never a value built from the
  last render — two field changes between renders used to drop the first.
- Encounters live inside the campaign (`campaign.encounters`). A `Combatant` carries its own
  numbers and, for NPCs/monsters, a **copy** of the statblock — encounter HP never writes back to
  a player's sheet, and editing the bestiary doesn't change a running fight. The turn is tracked
  by `turn_id`, not an index, so re-sorting or removing combatants can't hand the turn to the
  wrong one (`repairTurn` moves it on when its owner leaves the order). Rules are pure in
  `src/lib/gm/encounter.ts` (initiative sort, turns/rounds, damage with temp HP first, 0 HP →
  defeated for monsters / Unconscious for players, concentration DC `max(10, ⌊dmg/2⌋)` capped at
  30, crits double the dice only) and `src/lib/gm/difficulty.ts` (2024 XP budget,
  `XP_BUDGET_BY_LEVEL`). The log stores structured entries (`EncounterLogEntry`) and
  `EncounterLog` renders them in the current language; it is capped at `MAX_ENCOUNTER_LOG`.
- Maps (`campaign.maps`, `GridMap`) store the grid as a **string with one terrain code per
  square** (`TERRAINS` in constants — never change an existing code, it's in saved maps). Grid
  math is pure in `src/lib/gm/terrain.ts` (paint, rect, Bresenham line, 4-way flood fill, resize
  keeping the top-left, 2024 distance where a diagonal is one 1.5 m square). `MapCanvas` only
  turns pointers into squares (zoom on wheel/buttons, one-finger draw or pan, two-finger pinch
  that cancels the stroke) and takes a `drawOverlay` for previews/tokens; tools live in
  `MapEditorPage`, which paints into a local draft (mirrored in refs, since `pointerup` can beat
  the last render) and commits once per stroke. Undo/redo is per editing session only.
  `MapCanvas` cleanup must reset its rAF id — StrictMode's double mount otherwise left it set
  and the canvas never drew again.
- An encounter can point at a campaign map (`map_id`); switching maps clears every `position`
  and the fog. Combatants carry `position` (top-left square), `size` (Large+ cover 2×2 and up,
  `CREATURE_SIZE_SQUARES`), `speed_m`, `movement_used_m` and `dash`; the last two reset when the
  combatant's turn starts (`freshTurn`). Pathing is Dijkstra in `src/lib/gm/movement.ts`
  (difficult = 2 per square, walls/pits/void block, diagonals don't cut wall corners). Dragging
  the **turn owner** spends movement at the real path cost; dragging anyone else is a free GM
  reposition (`placeCombatant`). Beyond-speed moves are allowed with a warning — the GM decides —
  unless the encounter's `strict_movement` ("Enforce movement") is on and combat is active: then
  `checkMove` (`movement.ts`) refuses drops with no real path for everyone and beyond the remaining
  movement for the turn owner (setup placement stays free; off by default, old saves normalize to off).
  Each combatant has `move_mode` (walk/fly/swim, with `fly_m`/`swim_m` from the stat block; players
  start with none and the GM can type them) — each `TERRAINS` entry carries `fly` (passable when
  flying: everything but wall, pillar and void) and `swim` (costs 1 with a swim speed: shallow and
  deep water), so `terrainCost` never switches on terrain ids. Switching modes mid-turn subtracts what was already moved (2024). Other
  creatures are handled by `occupancyFor`: same `side`, Incapacitated, Tiny or 2+ sizes apart is
  passable as difficult terrain, anything else blocks; nobody may end a move in an occupied space.
- Terrains are grouped (`group`, `TERRAIN_GROUPS`) for the editor palette. Rendering is in
  `src/components/gm/terrainStyle.ts`: `fill` is the flat colour (thumbnail, zoomed out below
  `TEXTURE_MIN_PX`), `paint` draws a procedural texture into a cached tile (`terrainTile`, keyed by
  terrain, pixel size and one of `VARIANTS` per square via `cellVariant`, so the same map always
  draws the same). Texture, not colour, is what tells terrains apart (accessibility). Walls cast a
  short shadow on the squares south and east of them. Adding a terrain = new code in `TERRAINS`,
  a `TERRAIN_STYLE` entry and `gm.terrains.*` in both catalogs (`terrain.test.ts` checks).
- NPCs carry an optional roleplay `profile` (`NpcProfile`: gender, species, archetype, age,
  occupation, appearance, mannerism, personality, ideal, bond, flaw, motivation, secret), normalized
  by `normalizeProfile`. The generator (`/mestre/campanha/:id/npc/gerar`, `NpcGeneratorPage`) is pure
  in `src/lib/gm/npcGenerator.ts`: the GM fills what they want, everything empty is rolled
  (`generateNpc` takes an injectable RNG), the stat block is the SRD block of an archetype
  (`NPC_ARCHETYPES` in `src/data/npcTables.ts`, common folk first) varied ±2 per ability by
  `varyStatBlock`, which recomputes HP from the hit dice + CON, initiative and skills. Typing in a
  field locks it against "Reroll". Names and phrase tables live in `npcTables.ts`; the PT and EN
  phrase lists must have the same lengths (tested). `NpcProfileFields` is shared by the generator
  and `NpcEditPage`; `NpcPortrait` shows the profile in the NPC modal and the encounter.
- The generator has a second mode, **like a character** (`src/lib/gm/pcNpc.ts`): `resolvePcBuild`
  fills whatever the GM left open (class weighted by `PC_CLASS_WEIGHTS`, level 1–6, subclass from
  the class's subclass level, species, lineage, background), `buildPcSheet` builds a real
  `CharacterSheet` with the player rules (standard array in the class's suggested order, with INT
  raised for third casters; background +2/+1; ASIs at `ASI_LEVELS` + `EXTRA_ASI_LEVELS`; class
  skills and rogue/bard expertise; armor from `PC_LOADOUT`/`PC_ARMOR_BY_TIER`; spells up to
  `maxSpellCircle`), and `sheetToStatBlock` turns it into the NPC block (weapon and damage-cantrip
  actions, Extra Attack as Multiattack, spellcasting summarized in a trait). CR comes from
  `PC_LEVEL_CR` (an estimate, there is no official 2024 table) but the block keeps the level's
  proficiency bonus through the optional `StatBlock.proficiency_bonus`; always read it through
  `blockProficiencyBonus`, never `crProficiencyBonus(block.cr)` directly. The class, species and
  background steps live in `src/lib/characterBuild.ts` (`applyClass`, `applySpecies`,
  `applyBackground`), shared with the sheet store's setters, so the generator and the wizard
  cannot drift apart.
- The bestiary list (`MonsterBrowser`) groups by creature type: chips with counts filter, and with
  no search and no category it shows collapsible shelves (`TypeGroup`, `CreatureTypeIcon`).
- Adding to an encounter: `EncounterPage` has one button per source that opens
  `AddCombatantsModal` on that tab (remounted by `key`), and the NPC tab has "Add to encounter"
  (`AddToEncounterModal`, existing encounter or a new one). `QuantityAdd` confirms each add.
- GM visual vocabulary lives in `src/components/gm/ornaments.tsx` (`SectionTitle` with the gold
  rule, `EmptyState` that teaches with its actions inline, stroke icons) plus the `gm-page`
  background and `gm-rule` divider in `index.css`. Cinzel only for titles; numbers, buttons and
  lists stay in Manrope. `PRODUCT.md` holds the design brief for this area.
- GM layout: every GM page uses `gmContainer` (`GmHeader.tsx`, up to 1480px) and fills the width
  with a side column from `lg:` instead of a narrow centred column. Lists that open a detail use
  master-detail on desktop and a modal on phones (`useMediaQuery('(min-width: 1024px)')`): NPC tab
  and bestiary show the selected block in a sticky aside; the players tab has `PartySummary`
  (party table, XP budget, languages); encounter and map tabs put creation in `CreatePanel`; the
  encounter page keeps the turn bar on one row and, in map view, moves the initiative order into
  the aside so the map gets the height. The campaign index (`CampaignListItem`) carries counts and
  the running encounter for the home cards; `listCampaigns` fills them in once for older indexes.
- "Table view" is page state in `EncounterPage`: it renders only the map (hidden combatants and
  anyone under fog removed), round and visible turn, with no GM panel, log or tools.
- Fog is `encounter.fog`, one `0`/`1` char per square, ignored when its length no longer matches
  the map (resized). GM view dims hidden squares; "table view" blacks them out and hides hidden
  combatants and anyone standing in fog.
- The SRD 5.2.1 catalog (`src/data/monsters/{en,pt}/`, 330 monsters) is **generated** by
  `scripts/srd/generate-monsters.mjs` — see `scripts/README.md`; never hand-edit it. It is loaded
  lazily per language (`loadSrdMonsters`, store `srd` + `loadSrd`) and is read-only: copying a
  monster into the bestiary (`copySrdToBestiary`) or adding it to an NPC/encounter makes a copy.
  `src/data/monsters.test.ts` checks PT/EN id parity, that every block survives
  `normalizeStatBlock` unchanged, that mechanics match across languages and that every
  extracted damage parses as dice. The CC-BY attribution is in `gm.srdAttribution` (shown under
  the SRD list) and in both READMEs — keep it. The markdown source has PDF-pagination defects
  (merged creatures, lost "Hit:"/"Failure:" labels); fixed copies live in `scripts/srd/overrides/`,
  `scripts/srd/crosscheck.mjs` compares the output with a second CC-BY conversion, and the PT text
  comes from the global EN→PT dictionaries in `scripts/srd/monsters-pt.json` (see `scripts/README.md`).
- **Area maps** (non-combat, `docs/venetia-area-map-spec.md`, shown as **Beta** in the UI) are a separate system from the grid:
  world coordinates, a flat `elements` list where each element carries its `layer` (array order =
  z inside the layer), `layers` state (visible/locked/opacity, array order = draw order; `labels`
  is last so no territory covers a name). Element kinds: `stamp`, `label` (oriented box, gizmo
  rotate/scale), `path`, `region` (move only) and `paint` (texture brush/eraser strokes — not
  selectable). Lines and regions store a flat `[x, y, …]` centre line, RDP-simplified and
  quantized on pointer-up (`src/lib/gm/areaMap/shapes.ts`); smoothing and dashes happen at render.
  They live in **IndexedDB**, not in the campaign's localStorage: `src/services/areaMapStorage.ts`
  (db `venetia-gm`, store `area_maps`, index `campaign_id`) behind `useAreaMapStore`. Saves are
  **immediate, one queued write at a time** — no debounce: an IndexedDB transaction started on
  `pagehide` dies with the page, which lost the last edit. `saveFailed` surfaces write errors.
  Campaign export carries them as `area_maps` (so `exportCampaignJson`/`importCampaignJson` are
  async; import gives new ids), and `deleteCampaign` deletes them. Tests use `fake-indexeddb`
  (`vitest.setup.ts`); don't fake `setImmediate` with `vi.useFakeTimers()` or the db hangs.
  Pure logic in `src/lib/gm/areaMap/` (`scene`, `geometry`, `shapes`, `viewport`), normalized by
  `normalizeAreaMap`. Rendering is PixiJS 8 in `AreaStage` (on-demand renders, no ticker; one
  shared `GraphicsContext` per asset; Text resolution follows zoom). Drawing per kind is in
  `areaStyles.ts`, except paint: brush strokes are **raster**, like Inkarnate (`paintLayer.ts`).
  Each layer with paint keeps a baked RenderTexture; a stroke is stamped as brush-tip "dabs"
  (`brush.ts` `dabsAlong`, seeded per stroke id so it always redraws the same; tips in
  `brushTips.ts`: organic/soft/hard) into a soft mask with blend `max`, then the world-aligned
  material goes through it with **height blending** (`heightBlend.ts`, a `Mesh` with a GLSL
  shader — hence `preference: 'webgl'`): height is the texel's luminance against the material's
  mean colour (`PAINTED_TEXTURE_FILLS`), it shifts the mask's 0.5 threshold, so crowns, stones and
  ridges cross first and the edge follows the texture instead of a ghostly alpha fade; `RIM` adds
  foam on water/ice and a contact shadow on forests. Dab alpha is always 1 — strength is the
  shader's `uOpacity`, or a stroke under 50% would never cross the threshold. `Mesh.destroy` does
  not free geometry or shader: use `destroyHeightBlend`. Erase strokes are the same mask (short
  ramp, no height) with blend `erase` on the baked texture. Only appended strokes are composited;
  anything else rebakes the layer. The stroke being drawn (`liveId`) goes to a reused map-sized
  live mask, stamping only new dabs per move, through the same shader, so it never jumps on release.
  `setMask({ mask: null })` does **not** clear a mask — set `.mask = null` (a destroyed live mask
  left on the baked sprite broke every later frame). Textured regions are baked too (blurred
  polygon mask through the same height blend, `bakeRegion`) except while being drawn. A brush
  stroke that starts outside the map is a pan (`onDown` declines it), not a lost stroke. Icons are the glyph alone with a thin
  contrasting outline (no badge). Measure editor performance on a production build (`vite
  preview`): dev-mode React adds ~50 ms renders that don't exist in the app. Stamps are our
  own SVG in `src/data/areaMap/stamps.ts`; Pixi's SVG parser reads `polygon points` as integers
  only, so `pixiSafe` rewrites polygons as paths and rounds coordinates — `catalog.test.ts`
  enforces the allowed tags. Materials (`areaTextures.ts`) are **painted images** where one exists
  (`src/assets/area-textures/<id>.webp` + `.thumb.webp`, made in Gemini from `assets/texture/<id>.jpeg`
  by `scripts/areamap/process-textures.sh`, which flattens the baked-in lighting and fixes the
  seams; it also writes the average colours to `paintedTextures.generated.ts`), else the procedural
  `TERRAIN_STYLE` tile. `materials.ts` loads painted ones on demand (`Assets.load` with mipmaps):
  `materialTexture` returns `null` until ready, the stage shows the average colour meanwhile, bakes
  paint only up to the first stroke whose material is still loading, keeps a textured region vector
  until its material arrives, and re-syncs through `materialsTick`. Both kinds share 2 px per
  world unit (`TILE_RESOLUTION`), so one tile scale fits all. Editor: `AreaMapEditorPage` (`/mestre/campanha/:id/area/:mapId`), draft + undo
  snapshots like the grid editor; the `undo`/`redo` updaters must capture `committed.current`
  *before* `restore`. Icons (`kind: 'icon'`, upright, glyph only, tinted shared glyph) come
  from game-icons.net (CC BY 3.0, Lorc and Delapouite) through the generated
  `src/data/areaMap/icons.generated.ts` (`scripts/areamap/generate-icons.mjs`, see
  `scripts/README.md`); keep the credit under the icon grid and in both READMEs. Stamps can carry
  `effect: 'shadow' | 'glow'` (a blurred copy behind, core `BlurFilter`; fantasy stamps start
  glowing). The optional grid (`map.grid`, square or pointy-top hex in `grid.ts`) is alignment
  only, drawn under the labels layer; snapping is an editor toggle, not saved. `AreaStage` exposes
  `apiRef.capture()` (whole map, no selection/frame, labels and grid optional, capped by
  `AREA_EXPORT_MAX_PX`) used by the PNG/JPEG export (`ExportDialog` → `deliverFile`) and by the list
  thumbnail, which the editor regenerates `AREA_THUMBNAIL_DELAY_MS` after the last edit;
  `setAreaThumbnail` is its only writer (`commitAreaMap` keeps the store's current one).
  Effects are drawn once into a `cacheAsTexture` container (`buildEffect`) and rebuilt only when
  `asset:effect` changes — live, three glowing stamps cost ~30 ms per frame. Selection is a list:
  Shift (or the select tool's multi-select toggle, for touch) adds/removes and box-selects
  (`elementsInRect`: paths/regions count by their line, not their bounding box); dragging any
  selected element moves them all. A single selected path/region shows draggable vertices
  (`vertexHit`/`moveVertex`). Asset favorites are a per-device convenience in localStorage
  (`STORAGE_KEY_AREA_FAVORITES`). The GM home card adds area maps to the campaign's map count
  via `countAreaMapsByCampaign` (index keys only).
- **Notes** (`campaign.notes: CampaignNote[]`, `{ id, title, body, created_at, updated_at }`) are
  markdown. Campaigns saved before this had a single `notes: string`; `normalizeCampaign` turns a
  non-empty one into the first (untitled) note. Mentions are plain markdown links with our own
  schemes — `[Grukk](npc:<id>)`, `player:<PartyMember.id>`, `monster:<id>` (bestiary uuid or SRD
  `srd-*` id) — never rename a scheme (`MENTION_KINDS`), they're in saved notes. The link text is
  the name at mention time; the chip shows the current name, strikes through a deleted target and
  opens `MentionPreviewModal` (player card with "Open sheet" for local players, stat block with
  "Edit" for NPCs and bestiary monsters). Export/import keeps NPC and member ids, so mentions
  survive it. Pure logic in `src/lib/gm/notes.ts` (mention parse/insert, `@` query, toolbar
  edits, `toggleTaskAt` for checklist clicks in read mode, summary/search); typing `@` turns the
  sticky toolbar into a suggestion strip (`useNoteTextarea`), and `useMentionTargets` loads the SRD
  only when suggesting or when a shown note cites a monster outside the bestiary. Rendering is
  `react-markdown` + `remark-gfm` in `MarkdownNote` — raw HTML shows as text, `urlTransform` lets
  only the mention schemes past `defaultUrlTransform`, and the element components live at module
  level (inline ones would remount the note every render). `NotesTab` is lazy-loaded from
  `CampaignPage` so the markdown libs stay out of the page chunk; the open note is `?nota=<id>`.
- `AVAILABLE_CONDITIONS` gained `Atordoado` (Stunned) — it is a 2024 condition the SRD uses.
- UI strings live under `gm.*`. Shared helpers: `pickTextFile` (`src/lib/pickTextFile.ts`) and
  `deliverJson` (`src/lib/deliverJson.ts`), also used by `useSheetExport`.

### Online rooms (`/sala/:code`, `api/`, phases in `~/.claude/plans/crispy-orbiting-micali.md`)

- The GM opens a room per campaign (`RoomPanel`, "Room" button on `CampaignPage`); players join
  from Home with a 6-char code (`ROOM_CODE_ALPHABET`, no I/O/0/1) and a local sheet, landing on
  `RoomPage`. No accounts: each device gets a random token, the DB stores only its sha256
  (`room_members.token_hash`). The campaign stays local-first; the room only holds what is
  published.
- Server: `api/rooms/[action].ts` (one function: create, join, close, kick, leave) and
  `api/room-ws.ts` (WebSocket: first frame `auth {token, since}` → `ready`; presence; fan-out).
  Writes publish on Redis channel `room:<id>`; every function instance with sockets in that room
  is SUBSCRIBEd (ioredis over `REDIS_URL`) and forwards. Neon (`@neondatabase/serverless`) is the
  source of truth; `rooms.version` + `version > since` is how a reconnecting client catches up.
  Presence is a Redis hash with expiry timestamps renewed by the client's `ping`.
  Shared helpers live in `api/_lib/` (the `_` keeps them from becoming functions).
- **Vercel does not bundle `api/`**: Node loads each file as ESM, so every relative import in
  `api/` and in anything it imports must end in `.js` (`tsconfig.api.json` is `nodenext` and
  fails the build otherwise). Shared code therefore lives in `src/lib/room/` (protocol schemas in
  zod, code, constants, the pure `applyServerMessage` reducer) with `.js` imports and no imports
  from the rest of `src/`; `src/constants` re-exports the room constants for the app.
- Client: `roomApi` (HTTP, `RoomApiError` → `room.errors.<code>`), `RoomSocket` (reconnect with
  `ROOM_RECONNECT_DELAYS_MS`, heartbeat, `ROOM_CLOSE` codes end the session — the Hobby plan
  cuts a socket at 300 s, so reconnecting is normal), `roomStore` (memberships in `dnd_salas`,
  one active socket; `useRoomConnection` connects and does not disconnect on unmount).
  `roomApiBase()` is same-origin on the web and `ROOM_API_URL_APP` inside the APK
  (`VITE_API_BASE_URL` overrides). CORS is `*` on purpose: auth is a bearer token, never a cookie.
- Room data is **documents** (`room_docs`, `RoomDoc`: whole-value replace, `deleted` tombstone)
  keyed `kind:id`; `docVisibleTo` (`src/lib/room/docs.ts`) is applied by the server before any
  doc reaches a socket — a `sheet` goes only to the GM and its owner. `ready` carries the docs
  changed since `since` (`full` when since was 0); `applyServerMessage` keeps them in `docs`.
- Live sheets: the player's sheet is pushed (`sheet_put`, ≤ `ROOM_SHEET_MAX_BYTES`) on every
  `ready` and on each edit (`usePlayerSheetPush`, debounced, deduped per connection). The GM side
  (`useGmRoomParty`) runs only while `online` — before `ready` the doc list is empty and would
  read as "everyone left" — and calls `gmStore.syncRoomPlayers` → `mergeRoomPlayers`
  (`src/lib/gm/party.ts`): `PartyMember.source: 'room'` with `room_member_id`/`room_version`,
  same version is a no-op, a vanished doc (kick/leave tombstone) becomes `imported` with the last
  copy, and closing the room calls `detachRoomPlayers`. Room players have no "Remove" on their
  card (they'd come back on the next edit) — the GM removes them from the room. The GM still
  never writes into a player's sheet.
- Table broadcast: `BroadcastButton` on `EncounterPage` stores `broadcast_encounter_id` on the GM
  membership; `useGmTableBroadcast` rebuilds and publishes (`table_put`, doc `table:main`,
  debounced, deduped) on every encounter/map change and clears it (`table_clear`) when switched
  off or the encounter is gone. **Redaction happens on the GM device** in `buildTableState`
  (`src/lib/gm/tableView.ts`): hidden combatants and anyone whose top-left square is fogged are
  dropped (also from `turn_id`), terrain and labels under fog become `TERRAIN_VOID`/removed,
  enemies carry only `healthBand` (2024 Bloodied = ≤ half), exact HP only for `kind: 'player'`,
  no stat blocks or notes — the server and players never get the rest. Free text is clipped to
  `TABLE_LIMITS` and `publishTable` validates against `tableStateSchema` first, because a frame
  that fails the schema makes the server close the socket (4400). Players render it read-only
  with `TableView`/`TableMap` (`MapCanvas` + the shared `drawToken` from `drawToken.ts`).
- Rolls and chat are **events** (`room_events`, `RoomEvent`; append-only, pruned to
  `ROOM_LOG_MAX`; `ready` sends the last `ROOM_LOG_ON_READY` on a full sync). Dice are rolled **on
  the server** with `crypto.randomInt` (`addRoll`), after `parseRoomRoll` caps the expression
  (total dice, sides, bonus); the client never sends a result. `private` events reach only the GM
  and the author (`eventVisibleTo`, applied by the server). Each member is rate-limited
  (`ROOM_EVENT_RATE_LIMIT` per `ROOM_EVENT_RATE_WINDOW_S`). `RoomLog` (log + quick dice + composer;
  `/r 1d20+5 Label` rolls, see `parseComposer`) appears inline on `RoomPage` (tabs Table | Rolls |
  Room, the table pinned left on desktop) and everywhere else in the floating `RoomDock` with an
  unread count.
- Shared notes: `CampaignNote.shared` (normalized to `false`), toggled in `NoteEditor` only when
  the campaign has a room. `useGmSharedNotes` mirrors the shared set as docs `note:<noteId>`
  (`note_put`/`note_clear`, GM-only on the server): each goes through `shareableNote`
  (`src/lib/gm/notes.ts`), which turns every mention into its **current** name in bold —
  players have no access to the GM's NPCs/monsters — and unsharing or deleting tombstones the
  doc. Players read them in the room's Notes tab (`SharedNotes`, lazy so react-markdown stays out
  of `RoomPage`).
- `vercel.json` pins functions to `gru1` (São Paulo), next to the Neon database (`sa-east-1`):
  from the default `iad1` every event paid several cross-continent round trips (median 703 ms per
  roll vs 52 ms pinned). Keep the function region next to the database.
- The bridges live in `RoomSyncBridge`, lazy-mounted in `App` only when `roomSyncGate` says this
  device uses rooms (stored membership or one just created); Home lazy-loads `JoinRoomModal` and
  `HomeRoomList` the same way, so zod and the room store stay off the landing page.
- `vercel.json` rewrites only extension-less, non-`/api`, non-`/@` paths to `index.html`; a
  catch-all also swallowed `/api` and Vite's module requests under `vercel dev`.
- Local dev: `npm run dev` runs `api/` inside Vite (`apiDevServer` in `vite.config.ts`, loading
  `.env.local` into the server process) because `vercel dev` does not forward WebSocket
  upgrades. The integration's env vars are *Sensitive*: `vercel env pull` writes them empty, so
  `.env.local` must be filled from the Neon and Upstash dashboards. Never prefix a DB/Redis var
  with `VITE_` (it would ship in the bundle and the APK); `.env*` is gitignored and `.vercelignore`d.

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
