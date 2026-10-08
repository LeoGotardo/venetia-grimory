#!/usr/bin/env bash
# Processa as texturas pintadas do mapa de área (geradas no Gemini) para o app.
#
# Entrada:  assets/texture/<id>.jpeg  (1024×1024, o id é o do material em areaTextures.ts)
# Saída:    src/assets/area-textures/<id>.webp        (1024 px, ladrilho do mapa)
#           src/assets/area-textures/<id>.thumb.webp  (128 px, amostra da paleta)
#           src/data/areaMap/paintedTextures.generated.ts  (cor média de cada uma)
#
# Dois defeitos das imagens geradas, corrigidos aqui:
# 1. Iluminação: "luz de cima à esquerda" virou um degradê na imagem inteira — repetida, a
#    textura forma um xadrez claro/escuro. A imagem é multiplicada pela própria cor média e
#    dividida por uma versão muito desfocada de si mesma (com repetição nas bordas), o que
#    tira a variação de baixa frequência e mantém o detalhe.
# 2. Emenda: em várias, a borda esquerda não continua na direita (nem a de cima na de baixo).
#    Nessas, uma faixa de 160 px nas bordas vem da versão rolada pela metade — que emenda
#    sozinha —, misturada suavemente com o miolo original.
#
# Requer ImageMagick 6 ou 7 com WebP. Uso: scripts/areamap/process-textures.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SRC="$ROOT/assets/texture"
OUT="$ROOT/src/assets/area-textures"
GEN="$ROOT/src/data/areaMap/paintedTextures.generated.ts"
SIZE=1024
BAND=160

IM=convert
command -v magick >/dev/null 2>&1 && IM="magick"

# Desfoque da iluminação, como "lado reduzido": 32 → sigma ~160 px (só o degradê grande);
# 64 → ~40 px, para manchas de luz de escala média (a darkGrass tinha um 2×2 de manchas).
declare -A FLAT=([darkGrass]=64)
# Texturas cuja borda não emenda. As outras (pedra, copas, areia…) já emendam e a mistura
# só criaria fantasmas de pedras e copas na faixa da borda.
SEAM=" ice water mud deepWater grass ash volcanicRock magic darkGrass "

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$OUT"

# Máscara da faixa de borda: 1 no miolo, rampa suave até 0 nas bordas.
# (No -fx, `a` e `b` são os canais alfa e azul — por isso qx/qy.)
$IM -size ${SIZE}x${SIZE} xc: \
  -fx "qx=min(1,min(i,w-1-i)/$BAND); qy=min(1,min(j,h-1-j)/$BAND); qx*qx*(3-2*qx)*qy*qy*(3-2*qy)" \
  -depth 16 "$TMP/mask.png"

fills=()
for file in "$SRC"/*.jpeg; do
  id="$(basename "$file" .jpeg)"
  low="${FLAT[$id]:-32}"
  blur=$([ "$low" -ge 64 ] && echo 2.5 || echo 5)
  mean="$($IM "$file" -resize 1x1\! -format "%[pixel:p{0,0}]" info:)"

  # Multiplica pela média antes de dividir: sem HDRI, dividir primeiro estouraria os brilhos.
  $IM "$file" -resize ${SIZE}x${SIZE}\! \
    \( +clone -fill "$mean" -colorize 100 \) -compose Multiply -composite \
    \( "$file" -resize ${low}x${low}\! -virtual-pixel tile -blur 0x$blur -resize ${SIZE}x${SIZE}\! \) \
    -compose Divide_Src -composite "$TMP/$id.png"

  if [[ "$SEAM" == *" $id "* ]]; then
    $IM \( "$TMP/$id.png" -roll +$((SIZE / 2))+$((SIZE / 2)) \) "$TMP/$id.png" "$TMP/mask.png" \
      -composite "$TMP/$id.png"
  fi

  $IM "$TMP/$id.png" -strip -quality 82 -define webp:method=6 "$OUT/$id.webp"
  $IM "$TMP/$id.png" -strip -resize 128x128 -quality 80 -define webp:method=6 "$OUT/$id.thumb.webp"
  fill="$($IM "$TMP/$id.png" -resize 1x1\! -format "#%[hex:p{0,0}]" info:)"
  fills+=("  $id: '${fill:0:7}',")
  echo "$id: ok ($(du -k "$OUT/$id.webp" | cut -f1) KB)"
done

{
  echo "// Gerado por scripts/areamap/process-textures.sh — não edite à mão."
  echo "// Cor média de cada textura pintada (amostra enquanto a imagem carrega, miniatura afastada)."
  echo ""
  echo "export const PAINTED_TEXTURE_FILLS: Record<string, string> = {"
  printf '%s\n' "${fills[@]}" | sort
  echo "}"
} > "$GEN"
echo "manifesto: $GEN"
