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
