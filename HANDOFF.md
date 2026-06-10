# HANDOFF — Grimório de Venetia
**Date:** 2026-06-10  
**Project:** venetia-grimory (D&D 5.5 character creator SPA)  
**Branch:** N/A (no git repo initialized)  
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

## Resume Prompt

```
Project: Grimório de Venetia — D&D 5.5 character creator SPA
Dir: /home/leog/Documentos/venetia-grimory
Stack: React 18 + TypeScript + Vite + Tailwind v4 + Zustand + React Router v6

ALL major work is complete and `npm run build` passes clean:
- Engineering guidelines refactor: done
- Full UI/UX audit + implementation: done (WCAG AA contrast, focus traps, aria, etc.)
- Edit feature: done — "✎ Editar" tab added to Ficha page renders PainelEditar
  (src/components/ficha/PainelEditar.tsx) with 6 edit sections

Pending work is manual QA only:
1. Run `npm run dev`, open a completed ficha, click "✎ Editar" tab
2. Verify all 6 sections work: Informações, Progressão, Atributos, Armadura, Perícias, Magia
3. Check edge cases: nivel < 3 disables subclasse; non-conjurador shows message in Magia section
4. Confirm changes persist (localStorage auto-save via Zustand subscriber)

No blockers. No TypeScript errors. No pending implementation tasks.
```
