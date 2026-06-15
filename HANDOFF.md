# HANDOFF — Grimório de Venetia
**Date:** 2026-06-15  
**Project:** venetia-grimory (D&D 5.5 character creator SPA)  
**Branch:** main  
**Repo:** https://github.com/LeoGotardo/venetia-grimory.git  
**Working dir:** `/home/leog/Documentos/venetia-grimory`

---

## Project Summary

D&D 5.5 (2024 edition) character creator SPA. No backend — localStorage only.  
Stack: React 18 + TypeScript + Vite + Tailwind CSS v4 + Zustand + React Router v6 + Framer Motion + Zod + uuid.

Key data: `src/data/dnd_dados.json` (180KB — 12 classes, 10 species, 16 backgrounds, etc.)  
Entry: `src/main.tsx` → `src/App.tsx` (lazy-loaded routes: `/`, `/novo`, `/ficha/:id`)

---

## Architecture

```
src/
  constants/index.ts        — all named constants (POOL_PONTOS_COMPRA etc.)
  services/fichaStorage.ts  — localStorage abstraction
  lib/
    calculos.ts             — pure D&D calc fns (calcModificador, calcCA, etc.)
    recalcular.ts           — recalcular pipeline (modificadores → combate → pericias → magia)
    fichaInicial.ts         — factory fn for blank Ficha
  store/fichaStore.ts       — Zustand store; added atualizarMagia action this session
  hooks/
    useAtributosWizard.ts   — attribute selection logic
    useFichaExport.ts       — JSON export/import
  pages/  Home | Wizard | Ficha  (all lazy-loaded)
  components/
    ui/  Button | Card | Input | Badge | Modal
    wizard/  Step01–Step11 + WizardProgressBar + WizardNav
    ficha/  PainelCombate | PainelAtributos | PainelPericias | PainelRecursos
            PainelMagia | PainelInventario | PainelAnotacoes | PainelEditar (NEW)
```

---

## Completed This Session

### Engineering Guidelines Refactor — DONE
All files refactored: constants extracted, services created, lazy-loading added, store cleaned up.

### UI/UX Audit + Full Implementation — DONE
- Global WCAG AA contrast fix: `text-[#6B6560]` → `text-[#A8A09B]` across all .tsx
- `src/index.css`: added `--color-dnd-muted: #A8A09B`; global `:focus-visible` outline
- `src/components/ui/Button.tsx`: focus ring offset, active states, min-h on all sizes
- `src/components/ui/Modal.tsx`: focus trap + `aria-labelledby` + body scroll lock
- `src/components/ui/Badge.tsx`: DadoBadge uses on-theme colors
- `src/components/ficha/PainelCombate.tsx`: PV hero size, aria, Enter key on PV adjust
- `src/components/ficha/PainelAtributos.tsx`: `text-[8px]` → `text-[10px]`, aria-label
- `src/components/ficha/PainelMagia.tsx`: themed CIRCULO_CORES, empty state, aria
- `src/components/ficha/PainelInventario.tsx`: stable keys, aria-label, empty state
- `src/components/ficha/PainelAnotacoes.tsx`: imports constants; removed duplicates
- `src/components/ficha/PainelRecursos.tsx`: progress bar fallback for maximo > 20
- `src/components/wizard/WizardProgressBar.tsx`: always-visible progress bar, 44px touch
- `src/pages/Wizard.tsx`: scroll-to-top on step change
- `src/components/wizard/Step11Revisar.tsx`: removed `getState()` call

### Edit Feature ("adicione uma maneira de editar a ficha") — DONE
- `src/store/fichaStore.ts`: added `atualizarMagia` action
- `src/components/ficha/PainelEditar.tsx`: NEW — 6 sections: Informações, Progressão,
  Atributos, Armadura, Perícias, Magia. Full keyboard/aria support.
- `src/pages/Ficha.tsx`: extended `Aba` type to include `'editar'`; added "✎ Editar" tab
  with gold-tinted styling; renders `<PainelEditar />` when active
- **`npm run build` passes clean** ✓

---

## Known Technical Notes

- `Armadura` type fields: `id`, `nome`, `categoria`, `ca`, `requisito_for?`, `penalidade_furtividade?`, `custo_po?`, `peso_kg?` — no `ca_base`, `tipo_ca`, `forca_minima`
- `PainelRecursos`: `surto_de_acao` uses `.usos` not `.maximo`
- `atualizarRecurso` in store casts through `as typeof r` (union type complexity)
- `fichaStore.ts` `atualizarPV` was returning `Ficha` directly (now fixed)
- WCAG AA: `#6B6560` on `#2D2520` = 2.98:1 (fail); `#A8A09B` on `#2D2520` = 6.59:1 (pass)

---

## Blockers

None. Build is clean.

---

## Next Steps

1. **Manual QA** — open dev server (`npm run dev`), navigate to a completed ficha, click "✎ Editar" tab; verify all 6 sections render and mutations persist via localStorage auto-save
2. **Test edge cases in PainelEditar**:
   - Subclasse select disables when nivel < 3
   - Linhagem field appears only for species with `linhagens` array
   - Non-conjurador: Magia section shows "não é conjurador" message
   - Armor select: picking "Sem armadura" sets `setArmadura(null)`
3. **Consider**: PainelEditar currently imports `dados` via JSON directly — verify it uses same reference as rest of app (should be fine, both use `dnd_dados.json`)
4. **Git init** if user wants version control: `git init && git add -A && git commit -m "initial commit"`

---

## Session 2 Work (2026-06-15)

### Capacitor Android setup — DONE
- Installed `@capacitor/core`, `@capacitor/cli`, `@capacitor/android`, `@capacitor/assets`
- Android project generated at `/android/`
- Fixed Kotlin duplicate class build error in `android/app/build.gradle`:
  added `configurations.all { resolutionStrategy { force kotlin 1.8.22 } }` block
- Android Studio installed at `/home/leog/Documentos/android-studio/bin/studio.sh`
- SDK at `/home/leog/Android/Sdk`, `android/local.properties` points to it

### i18n PT/EN — PARTIALLY DONE (build passes ✓)

Installed `i18next` + `react-i18next`.

Created:
- `src/i18n/index.ts` — i18next init, reads lang from `localStorage('venetia-lang')`, defaults `'pt'`
- `src/i18n/pt.ts` — full Portuguese translation object
- `src/i18n/en.ts` — full English translation object
- `src/main.tsx` — `import './i18n/index'` added as first import

**Already updated** (all use `useTranslation`):
- All 5 pages: `Home`, `Ficha`, `Wizard`, `NotFound`, `ServerError`
- All 12 wizard steps + `WizardNav`
- Ficha components: `LevelUpModal`, `PainelAnotacoes`, `PainelAtributos`, `PainelCombate`, `PainelEditar`
- UI: `ConfigModal` — has PT/EN toggle buttons at top

**NOT YET updated** (hardcoded strings remain):
- `src/components/ficha/PainelInventario.tsx` → use `inventory.*` keys
- `src/components/ficha/PainelMagia.tsx` → use `magic.*` keys
- `src/components/ficha/PainelPericias.tsx` → use `skills.*` keys
- `src/components/ficha/PainelRecursos.tsx` → use `resources.*` keys
- `src/components/ui/MochilaBusca.tsx` → use `bag.*` keys

All keys for these 5 files already exist in `src/i18n/pt.ts` and `src/i18n/en.ts`.

**Game data NOT translated** (user's explicit decision — they'll handle it separately).

---

## Next Steps

1. **Complete i18n** on 5 remaining files above:
   - For each: read file → add `import { useTranslation } from 'react-i18next'` → add `const { t } = useTranslation()` in component body → replace hardcoded strings with `t('namespace.key', { vars })`
   - Run `npm run build` to verify

2. **Verify PT/EN toggle** — `npm run dev`, open ConfigModal, switch language, confirm all text changes

3. **App icon** — still pending:
   - Create `assets/icon.png` at root (1024×1024px, no transparency)
   - Run `npx capacitor-assets generate --android`

4. **Commit** all uncommitted changes (i18n files, android fix, component updates)

5. **Sync Capacitor** after build: `npm run build && npx cap sync`

---

## Resume Prompt

```
Project: Grimório de Venetia — D&D 5.5 character creator SPA
Dir: /home/leog/Documentos/venetia-grimory
Stack: React 18 + TypeScript + Vite + Tailwind v4 + Zustand + React Router v7
Branch: main | Repo: https://github.com/LeoGotardo/venetia-grimory.git

We partially implemented PT/EN i18n using i18next + react-i18next. Build passes clean.

DONE: all pages, all wizard steps, LevelUpModal, PainelAnotacoes, PainelAtributos,
PainelCombate, PainelEditar, ConfigModal (has PT/EN toggle).

TODO — 5 files still need useTranslation (hardcoded strings, no i18n yet):
  src/components/ficha/PainelInventario.tsx  → inventory.* keys
  src/components/ficha/PainelMagia.tsx       → magic.* keys
  src/components/ficha/PainelPericias.tsx    → skills.* keys
  src/components/ficha/PainelRecursos.tsx    → resources.* keys
  src/components/ui/MochilaBusca.tsx         → bag.* keys

All keys already exist in src/i18n/pt.ts and src/i18n/en.ts.
For each file: read → add useTranslation import + const { t } = useTranslation() → replace strings → npm run build.

Also pending: app icon (create assets/icon.png 1024x1024 → npx capacitor-assets generate --android).
Game data strings (spells, weapons, etc.) intentionally NOT translated — user will do separately.
```
