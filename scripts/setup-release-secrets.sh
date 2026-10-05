#!/usr/bin/env bash
# Configuração única para .github/workflows/release.yml: a keystore de release
# e os quatro secrets do repositório que o workflow lê.
#
#   ./scripts/setup-release-secrets.sh [caminho/release.jks]
#
# Precisa do `gh` logado com acesso a este repositório e do `keytool` (qualquer
# JDK). A keystore é criada se o caminho ainda não existir.
#
# FAÇA BACKUP dela e da senha, fora desta máquina: toda release futura precisa
# ser assinada com ela, e o Android recusa atualização assinada por outra chave
# — o usuário teria de desinstalar (perdendo as fichas salvas no aparelho).
set -euo pipefail
cd "$(dirname "$0")/.."

KEYSTORE="${1:-$HOME/venetia-release.jks}"
ALIAS="${ANDROID_KEY_ALIAS:-venetia}"

fail() { echo "setup-release-secrets: $*" >&2; exit 1; }

command -v gh >/dev/null || fail "GitHub CLI (gh) não instalado"
gh auth status >/dev/null 2>&1 || fail "gh não está logado — rode: gh auth login"
command -v keytool >/dev/null || fail "keytool não encontrado — instale um JDK"

read -rsp "senha da keystore: " STOREPASS; echo
[[ ${#STOREPASS} -ge 6 ]] || fail "use pelo menos 6 caracteres"

if [[ -e "$KEYSTORE" ]]; then
    echo "usando a keystore existente em $KEYSTORE"
    keytool -list -keystore "$KEYSTORE" -storepass "$STOREPASS" -alias "$ALIAS" >/dev/null \
        || fail "senha errada, ou nenhuma chave '$ALIAS' em $KEYSTORE"
else
    read -rsp "confirme a senha: " CONFIRM; echo
    [[ "$STOREPASS" == "$CONFIRM" ]] || fail "as senhas não conferem"
    echo "criando $KEYSTORE (alias '$ALIAS', validade ~27 anos)"
    # Keystores PKCS12 usam a mesma senha para o arquivo e para a chave.
    keytool -genkeypair -v -keystore "$KEYSTORE" -alias "$ALIAS" \
        -keyalg RSA -keysize 4096 -validity 10000 \
        -storepass "$STOREPASS" -keypass "$STOREPASS" \
        -dname "CN=Grimorio de Venetia, O=Venetia" >/dev/null
    chmod 600 "$KEYSTORE"
    echo
    echo "  !! Faça backup de $KEYSTORE e da senha agora, fora desta máquina."
    echo
fi

echo "==> gravando os secrets do repositório"
base64 -w0 "$KEYSTORE" | gh secret set ANDROID_KEYSTORE_BASE64
printf '%s' "$STOREPASS" | gh secret set ANDROID_KEYSTORE_PASSWORD
printf '%s' "$STOREPASS" | gh secret set ANDROID_KEY_PASSWORD
printf '%s' "$ALIAS"     | gh secret set ANDROID_KEY_ALIAS

echo "pronto — a próxima tag de release (npm run release) gera e publica o APK."
