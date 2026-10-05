#!/usr/bin/env bash
# Gera o APK de release assinado de uma versão.
#
#   VERSION=v1.2.3 ./scripts/build-android-release.sh      # pede a senha
#
# Keystore e alias têm padrão (~/venetia-release.jks, venetia); para outros,
# exporte ANDROID_KEYSTORE / ANDROID_KEY_ALIAS. No CI a senha vem de
# ANDROID_KEYSTORE_PASSWORD / ANDROID_KEY_PASSWORD.
#
# Imprime o caminho do APK na última linha (o resto vai para stderr). Usado por
# .github/workflows/release.yml em cada tag de release, e roda à mão com as
# mesmas variáveis. Precisa de JDK 21 e do Android SDK (ANDROID_HOME, ou
# ~/Android/Sdk).
#
# Diferente de um projeto Capacitor recém-criado, aqui `android/` é versionado
# — ícones e nome localizado já estão em `res/` — então só se faz `cap sync`.
# A versão entra por -PversionCode/-PversionName, sem editar o build.gradle.
set -euo pipefail
cd "$(dirname "$0")/.."

fail() { echo "build-android-release: $*" >&2; exit 1; }

# A CLI do Capacitor 8 (usada no cap sync) exige Node 22 — há um .nvmrc.
(( $(node -p 'process.versions.node.split(".")[0]') >= 22 )) || fail "precisa do Node 22 — rode: nvm use"

[[ "${VERSION:-}" =~ ^v([0-9]+)\.([0-9]+)\.([0-9]+)$ ]] || fail "VERSION precisa ser vX.Y.Z (veio '${VERSION:-}')"
major="${BASH_REMATCH[1]}"; minor="${BASH_REMATCH[2]}"; patch="${BASH_REMATCH[3]}"
(( minor < 100 && patch < 100 )) || fail "minor e patch precisam ficar abaixo de 100 (entram no versionCode)"
# O Android recusa atualização cujo versionCode não seja maior, então ele sai
# da própria versão: v1.2.3 → 10203. Cresce junto com as versões.
# A auto-atualização do app usa a mesma fórmula (versionCodeFromTag em
# src/lib/appUpdate.ts) — mudou aqui, mude lá.
versionCode=$(( major * 10000 + minor * 100 + patch ))

# À mão bastam VERSION e a senha: keystore e alias têm os padrões do
# setup-release-secrets.sh, e a senha é pedida se não vier do ambiente. No CI
# tudo chega pelos secrets e nada é perguntado.
export ANDROID_KEYSTORE="${ANDROID_KEYSTORE:-$HOME/venetia-release.jks}"
export ANDROID_KEY_ALIAS="${ANDROID_KEY_ALIAS:-venetia}"
if [[ -z "${ANDROID_KEYSTORE_PASSWORD:-}" && -t 0 ]]; then
    read -rsp "senha da keystore ($ANDROID_KEYSTORE): " ANDROID_KEYSTORE_PASSWORD; echo >&2
fi
export ANDROID_KEYSTORE_PASSWORD
# Keystores PKCS12 usam a mesma senha para o arquivo e para a chave.
export ANDROID_KEY_PASSWORD="${ANDROID_KEY_PASSWORD:-${ANDROID_KEYSTORE_PASSWORD:-}}"

for v in ANDROID_KEYSTORE ANDROID_KEYSTORE_PASSWORD ANDROID_KEY_ALIAS ANDROID_KEY_PASSWORD; do
    [[ -n "${!v:-}" ]] || fail "$v não definida"
done
[[ -r "$ANDROID_KEYSTORE" ]] || fail "keystore ilegível em $ANDROID_KEYSTORE"

export ANDROID_HOME="${ANDROID_HOME:-$HOME/Android/Sdk}"
[[ -d "$ANDROID_HOME/build-tools" ]] || fail "Android SDK não encontrado em $ANDROID_HOME"
buildTools="$(ls -d "$ANDROID_HOME"/build-tools/* | sort -V | tail -1)"

echo "==> bundle web ($VERSION)" >&2
npm run build >&2
npx cap sync android >&2

echo "==> gradle assembleRelease (versionCode $versionCode)" >&2
(cd android && ./gradlew --quiet assembleRelease \
    -PversionCode="$versionCode" -PversionName="${VERSION#v}" >&2)

unsigned="android/app/build/outputs/apk/release/app-release-unsigned.apk"
[[ -r "$unsigned" ]] || fail "o gradle não gerou $unsigned"
out="grimorio-de-venetia-$VERSION.apk"

"$buildTools/zipalign" -p -f 4 "$unsigned" "$out.aligned"
"$buildTools/apksigner" sign \
    --ks "$ANDROID_KEYSTORE" \
    --ks-pass env:ANDROID_KEYSTORE_PASSWORD \
    --ks-key-alias "$ANDROID_KEY_ALIAS" \
    --key-pass env:ANDROID_KEY_PASSWORD \
    --out "$out" "$out.aligned"
rm -f "$out.aligned" "$out.idsig"
"$buildTools/apksigner" verify "$out" >&2

echo "$out"
