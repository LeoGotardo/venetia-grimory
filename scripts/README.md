# Scripts do PDF da ficha

Ferramentas de uso pontual, rodadas à mão com `node`. Não entram no bundle.

## Arquivos

| Caminho | O que é |
|---|---|
| `docs/ficha-oficial-5.5.pdf` | ficha oficial PT-BR, com formulário e o personagem de exemplo da WotC |
| `docs/ficha-oficial-en-5.5.pdf` | ficha oficial em inglês (`media.dndbeyond.com`), só arte, sem formulário |
| `public/sheet-template.pdf` | modelo PT em branco que o app carrega (~4,5 MB) |
| `public/sheet-template-en.pdf` | modelo EN em branco (~4,4 MB) |
| `src/lib/pdf/sheetFields.ts` | mapa de chaves semânticas → campos do formulário |

Os PDFs de `docs/` não são versionados (arte da WotC, e o PT tem 12 MB).
O oficial em inglês vem de:
`https://media.dndbeyond.com/compendium-images/phb/downloads/DnD_2024_Character-Sheet.pdf`

PT-BR e EN são o **mesmo template** (603×774 pts, mesma diagramação, mesmo InDesign),
então os dois modelos carregam campos idênticos — mesmos nomes, mesmas posições — e
`fillSheet.ts` trata os dois sem saber a diferença.

## Regerar tudo

```bash
# --- geometria: sai do modelo PT atual e é a referência para os dois idiomas
node scripts/extract-fields.mjs public/sheet-template.pdf /tmp/campos.json
node scripts/generate-field-map.mjs /tmp/campos.json src/lib/pdf/sheetFields.ts

# --- modelo PT: limpa o personagem de exemplo, comprime, recria o formulário
node scripts/clean-template.mjs docs/ficha-oficial-5.5.pdf /tmp/pt-limpo.pdf
gs -q -dNOPAUSE -dBATCH -sDEVICE=pdfwrite -dPDFSETTINGS=/ebook \
   -sOutputFile=/tmp/pt-arte.pdf /tmp/pt-limpo.pdf
node scripts/prepare-template.mjs /tmp/pt-arte.pdf /tmp/campos.json public/sheet-template.pdf

# --- modelo EN: só comprime e cria o formulário (o oficial não tem nenhum)
gs -q -dNOPAUSE -dBATCH -sDEVICE=pdfwrite -dPDFSETTINGS=/ebook \
   -sOutputFile=/tmp/en-arte.pdf docs/ficha-oficial-en-5.5.pdf
node scripts/prepare-template.mjs /tmp/en-arte.pdf /tmp/campos.json public/sheet-template-en.pdf
```

O `gs` derruba o formulário original — é justamente o que se quer: ele comprime a arte
(12 MB → 4 MB) e `prepare-template.mjs` recria os campos limpos, sem as molduras e os
fundos brancos que o formulário original desenhava por cima da ficha.

## Por que o mapa é gerado

Os nomes dos campos no PDF oficial são gerados por máquina (`text_1aoob`,
`checkbox_148cprb`), sem nenhuma semântica. `generate-field-map.mjs` identifica cada um
pela posição na página, associa a uma chave em português e **falha se sobrar campo sem
chave** — por isso o mapa é gerado, e não escrito à mão.

# Release do APK Android

| Script | O que faz |
|---|---|
| `scripts/setup-release-secrets.sh` | **uma vez só**: cria a keystore (`~/venetia-release.jks`) e grava os 4 secrets do repositório |
| `scripts/release.sh` (`npm run release`) | confere branch/árvore limpa/sincronia, roda lint + testes + build, cria a tag `vX.Y.Z` e a envia |
| `scripts/build-android-release.sh` | gera o APK assinado; roda no workflow e também à mão com as mesmas variáveis |

O push da tag dispara `.github/workflows/release.yml`, que gera
`grimorio-de-venetia-vX.Y.Z.apk` e publica a GitHub Release com a mensagem da tag
como notas. `versionCode` sai da versão (`v1.2.3` → `10203`), passado ao Gradle por
`-PversionCode`/`-PversionName` — o `build.gradle` versionado não é editado.

```bash
./scripts/setup-release-secrets.sh     # primeira vez
npm run release                        # patch  (v1.0.0 → v1.0.1)
npm run release -- minor               # minor  (v1.0.1 → v1.1.0)
NOTES="Correções" npm run release      # notas sem abrir o editor
```

A keystore precisa de backup fora da máquina: o Android recusa atualização assinada
por outra chave.

# Catálogo de monstros do SRD 5.2.1

`src/data/monsters/{en,pt}/*.ts` são **gerados** — não edite à mão. A fonte é a conversão em
markdown do SRD 5.2.1 (CC-BY-4.0) de `github.com/oldmanumby/dnd.srd.5.2.1`, um arquivo por criatura.

```bash
curl -sL -o /tmp/srd.zip https://github.com/oldmanumby/dnd.srd.5.2.1/archive/refs/heads/main.zip
unzip -q /tmp/srd.zip -d /tmp/srd
node scripts/srd/generate-monsters.mjs /tmp/srd/dnd.srd.5.2.1-main
npx vitest run src/data/monsters.test.ts

# conferência contra a outra conversão (downfallx), opcional mas recomendada
curl -sL -o /tmp/df-monsters.md https://raw.githubusercontent.com/downfallx/dnd-5e-srd-markdown/master/monsters-A-Z.md
curl -sL -o /tmp/df-animals.md https://raw.githubusercontent.com/downfallx/dnd-5e-srd-markdown/master/animals.md
node scripts/srd/crosscheck.mjs /tmp/df-monsters.md /tmp/df-animals.md
```

**Overrides.** A conversão principal tem defeitos de paginação do PDF: criaturas coladas umas
nas outras, cabeçalho cortado, rótulos perdidos ("Hit:", "Failure:"), frases cortadas. Cada caso
achado tem uma versão corrigida em `scripts/srd/overrides/<Arquivo>.md`, que o gerador usa no
lugar da fonte. A maioria foi montada com `scripts/srd/downfallx-to-override.py` a partir da
conversão `github.com/downfallx/dnd-5e-srd-markdown`; na dúvida entre as duas, o desempate é o
PDF oficial (`media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf` — o Riding Horse
tem Car 7, não 8). O gerador falha se um arquivo tiver dois cabeçalhos de criatura, e
`src/data/monsters.test.ts` falha com restos de marcação, rótulos perdidos ou distâncias em pés.

**Tradução.** `scripts/srd/monsters-pt.json` tem três dicionários globais, inglês → português:
`names` (criaturas e habilidades), `texts` (descrições, com o inglês já em metros) e `misc`
(idiomas, etiquetas, resistências, usos, equipamento). Um texto repetido em vários monstros é
traduzido uma vez. O que faltar sai em inglês no catálogo PT — o teste de texto acusa. Ao
trocar um override, o texto inglês muda e a tradução antiga vira obsoleta: apague-a e traduza a
nova. Ao traduzir, todo número do inglês precisa aparecer no português (CD, dano, alcance) e a
terminologia segue o resto do app: condições com os nomes de `AVAILABLE_CONDITIONS`, magias com os
nomes do catálogo de magias PT, "Jogada de Ataque Corpo a Corpo", "Acerto:", "Salvaguarda de
Destreza: CD 13", "Falha:", "Sucesso: Metade do dano.", "Sangrando", "Vantagem".

A parte estruturada (tipo, tamanho, tendência, perícias, condições, tipos de dano) é traduzida
pelo próprio gerador. Distâncias saem em metros (5 ft = 1,5 m), como no resto do app.

# Ícones do mapa de área

`src/data/areaMap/icons.generated.ts` é **gerado** — não edite à mão.

```bash
node scripts/areamap/generate-icons.mjs
```

- **Fonte:** `@iconify-json/game-icons` (devDependency), o game-icons.net inteiro, CC BY 3.0.
- **Curadoria:** `scripts/areamap/icons.json` — id nosso, nome no game-icons, categoria e autor.
  O autor é a pasta do ícone no repositório `game-icons/icons`. Só entram nomes que existem em
  **uma pasta só**: alguns (`key`, `castle`, `tombstone`) existem em dois autores, e aí não dá
  para saber qual versão o pacote traz nem a quem atribuir. Hoje são todos de Lorc e Delapouite.
- **Paths:** o gerador passa tudo por `svgpath` (devDependency) — absoluto, sem arcos e sem
  atalhos de curva. O parser SVG do Pixi 8 desenha errado arcos e `S`/`T`: 10 dos 58 ícones saíam
  do quadro. `src/data/areaMap/catalog.test.ts` confere isso e os nomes em pt/en.
- Ícone novo = entrada no JSON, nome em `gm.areaMap.icons.*` nos dois catálogos, e rodar o gerador.
