/**
 * Constantes do sync com a conta. Moram aqui, e não em `src/constants`, porque
 * as funções da Vercel também as importam (só módulos com imports `.js`);
 * `src/constants` reexporta tudo para o app.
 */

/**
 * Teto de um registro no fio — o JSON dele já escapado dentro do corpo da
 * requisição. A Vercel recusa corpo acima de 4,5 MB; a folga cobre o resto do lote.
 */
export const CLOUD_DOC_MAX_BYTES = 3_500_000
/** Um push leva no máximo isto de bytes e de registros. */
export const CLOUD_PUSH_BATCH_BYTES = 3_500_000
export const CLOUD_PUSH_BATCH_MAX = 100
/**
 * Página de uma busca: bytes do conteúdo cru (escapado no JSON pode quase dobrar,
 * e a resposta também tem o teto de 4,5 MB) e linhas. Um registro maior vem sozinho.
 */
export const CLOUD_PULL_PAGE_BYTES = 1_700_000
export const CLOUD_PULL_PAGE_MAX = 200

/** Cota por conta: o plano do Neon divide pouco armazenamento entre todo mundo. */
export const CLOUD_USER_MAX_BYTES = 50_000_000
export const CLOUD_USER_MAX_RECORDS = 10_000

/** Requisições de sync por conta e janela (s); edição contínua faz ~1 push a cada 2 s. */
export const CLOUD_SYNC_RATE_LIMIT = 120
export const CLOUD_SYNC_RATE_WINDOW_S = 60

/** Espera depois da última gravação local antes de subir: junta as gravações de uma sessão de edição. */
export const CLOUD_PUSH_DELAY_MS = 2000
/** Intervalo mínimo entre duas buscas ao voltar para o app. */
export const CLOUD_PULL_MIN_INTERVAL_MS = 30_000
/** Quanto o logout espera as mudanças pendentes subirem antes de perguntar. */
export const CLOUD_SIGN_OUT_TIMEOUT_MS = 10_000
/** Espera de uma chamada da API de sync — lotes de alguns MB levam mais que as da sala. */
export const CLOUD_HTTP_TIMEOUT_MS = 30_000
