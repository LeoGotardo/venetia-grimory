#!/usr/bin/env bash
# Lança uma versão: confere o repositório, roda o gate, cria a tag anotada
# vX.Y.Z e a envia. O push da tag dispara .github/workflows/release.yml, que
# gera o APK assinado e publica a GitHub Release.
#
#   npm run release                 # patch: v1.2.3 → v1.2.4
#   npm run release -- minor        # v1.2.3 → v1.3.0
#   npm run release -- major        # v1.2.3 → v2.0.0
#   npm run release -- v1.5.0       # versão explícita
#
# As notas da release são a mensagem da tag. Com NOTES="..." elas vão direto;
# sem, o git abre o editor. A primeira versão, sem tag anterior, é v1.0.0.
#
# Antes da primeira vez: ./scripts/setup-release-secrets.sh
set -euo pipefail
cd "$(dirname "$0")/.."

fail() { echo "release: $*" >&2; exit 1; }

BRANCH="main"
bump="${1:-patch}"

[[ "$(git rev-parse --abbrev-ref HEAD)" == "$BRANCH" ]] || fail "rode a partir da branch $BRANCH"
[[ -z "$(git status --porcelain)" ]] || fail "há alterações não commitadas — commite ou descarte antes"

git fetch --quiet --tags origin "$BRANCH"
[[ "$(git rev-parse HEAD)" == "$(git rev-parse "origin/$BRANCH")" ]] \
    || fail "$BRANCH local difere de origin/$BRANCH — faça pull/push antes"

# Sem secrets o workflow falha depois do push; melhor avisar agora.
if command -v gh >/dev/null && gh auth status >/dev/null 2>&1; then
    gh secret list | grep -q '^ANDROID_KEYSTORE_BASE64' \
        || fail "secrets do APK ausentes no repositório — rode ./scripts/setup-release-secrets.sh"
fi

last="$(git tag -l 'v[0-9]*.[0-9]*.[0-9]*' | sort -V | tail -1)"
if [[ "$bump" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    next="$bump"
elif [[ -z "$last" ]]; then
    next="v1.0.0"
else
    IFS=. read -r major minor patch <<< "${last#v}"
    case "$bump" in
        patch) next="v$major.$minor.$((patch + 1))" ;;
        minor) next="v$major.$((minor + 1)).0" ;;
        major) next="v$((major + 1)).0.0" ;;
        *) fail "argumento inválido '$bump' — use patch, minor, major ou vX.Y.Z" ;;
    esac
fi

git rev-parse -q --verify "refs/tags/$next" >/dev/null && fail "a tag $next já existe"
if [[ -n "$last" ]] && [[ "$(printf '%s\n%s\n' "$last" "$next" | sort -V | tail -1)" != "$next" ]]; then
    fail "$next não é maior que $last — o Android recusaria a atualização"
fi

echo "==> ${last:-(nenhuma)} → $next"
echo "==> gate: lint, testes e build"
npm run lint
npm test
npm run build

if [[ -n "${NOTES:-}" ]]; then
    git tag -a "$next" -m "$NOTES"
else
    # Sugestão de notas: os commits desde a última tag.
    template="$(mktemp)"
    trap 'rm -f "$template"' EXIT
    {
        echo "Grimório de Venetia $next"
        echo
        git log --format='- %s' ${last:+"$last"..HEAD}
    } > "$template"
    git tag -a "$next" -e -F "$template"
fi

read -rp "enviar $next para origin e disparar o build do APK? [s/N] " ok
if [[ "$ok" != [sS] ]]; then
    git tag -d "$next" >/dev/null
    fail "cancelado — tag $next removida"
fi

git push origin "$next"
echo "pronto — acompanhe em: gh run watch \$(gh run list --workflow release.yml -L1 --json databaseId -q '.[0].databaseId')"
