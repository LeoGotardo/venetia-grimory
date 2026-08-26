# Scripts do PDF da ficha

Ferramentas de uso pontual, rodadas à mão com `node`. Não entram no bundle.

## Arquivos

| Caminho | O que é |
|---|---|
| `docs/ficha-oficial-5.5.pdf` | ficha oficial PT-BR, com formulário e o personagem de exemplo da WotC |
| `docs/ficha-oficial-en-5.5.pdf` | ficha oficial em inglês (`media.dndbeyond.com`), só arte, sem formulário |
| `public/ficha-modelo.pdf` | modelo PT em branco que o app carrega (~4,5 MB) |
| `public/ficha-modelo-en.pdf` | modelo EN em branco (~4,4 MB) |
| `src/lib/pdf/camposFicha.ts` | mapa de chaves semânticas → campos do formulário |

Os PDFs de `docs/` não são versionados (arte da WotC, e o PT tem 12 MB).
O oficial em inglês vem de:
`https://media.dndbeyond.com/compendium-images/phb/downloads/DnD_2024_Character-Sheet.pdf`

PT-BR e EN são o **mesmo template** (603×774 pts, mesma diagramação, mesmo InDesign),
então os dois modelos carregam campos idênticos — mesmos nomes, mesmas posições — e
`preencherFicha.ts` trata os dois sem saber a diferença.

## Regerar tudo

```bash
# --- geometria: sai do modelo PT atual e é a referência para os dois idiomas
node scripts/extrair-campos.mjs public/ficha-modelo.pdf /tmp/campos.json
node scripts/gerar-mapa-campos.mjs /tmp/campos.json src/lib/pdf/camposFicha.ts

# --- modelo PT: limpa o personagem de exemplo, comprime, recria o formulário
node scripts/limpar-modelo.mjs docs/ficha-oficial-5.5.pdf /tmp/pt-limpo.pdf
gs -q -dNOPAUSE -dBATCH -sDEVICE=pdfwrite -dPDFSETTINGS=/ebook \
   -sOutputFile=/tmp/pt-arte.pdf /tmp/pt-limpo.pdf
node scripts/preparar-modelo.mjs /tmp/pt-arte.pdf /tmp/campos.json public/ficha-modelo.pdf

# --- modelo EN: só comprime e cria o formulário (o oficial não tem nenhum)
gs -q -dNOPAUSE -dBATCH -sDEVICE=pdfwrite -dPDFSETTINGS=/ebook \
   -sOutputFile=/tmp/en-arte.pdf docs/ficha-oficial-en-5.5.pdf
node scripts/preparar-modelo.mjs /tmp/en-arte.pdf /tmp/campos.json public/ficha-modelo-en.pdf
```

O `gs` derruba o formulário original — é justamente o que se quer: ele comprime a arte
(12 MB → 4 MB) e `preparar-modelo.mjs` recria os campos limpos, sem as molduras e os
fundos brancos que o formulário original desenhava por cima da ficha.

## Por que o mapa é gerado

Os nomes dos campos no PDF oficial são gerados por máquina (`text_1aoob`,
`checkbox_148cprb`), sem nenhuma semântica. `gerar-mapa-campos.mjs` identifica cada um
pela posição na página, associa a uma chave em português e **falha se sobrar campo sem
chave** — por isso o mapa é gerado, e não escrito à mão.
