/**
 * Constantes das salas online. Moram aqui, e não em `src/constants`, porque as
 * funções da Vercel também as importam e só carregam módulos com imports `.js`
 * explícitos; `src/constants` reexporta tudo para o app.
 */

/** Alfabeto do código da sala: sem I, O, 0 e 1, que se confundem ao ditar. */
export const ROOM_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
export const ROOM_CODE_LENGTH = 6
export const ROOM_NAME_MAX = 120
export const ROOM_DISPLAY_NAME_MAX = 60
/** Mestre + players. */
export const ROOM_MAX_MEMBERS = 12

/** Bytes aleatórios do token do aparelho (vira base64url). */
export const ROOM_TOKEN_BYTES = 32
/** Base64url de 32 bytes tem 43 caracteres; a folga cobre mudanças futuras. */
export const ROOM_TOKEN_MAX_LENGTH = 128

/** O primeiro frame do WebSocket (`auth`) tem que chegar neste prazo. */
export const ROOM_AUTH_TIMEOUT_MS = 10_000
/** O cliente manda `ping` neste intervalo: mantém a conexão viva e renova a presença. */
export const ROOM_HEARTBEAT_MS = 25_000
/** Presença sem `ping` por mais que isto conta como offline (aparelho que caiu sem fechar). */
export const ROOM_PRESENCE_TTL_MS = 60_000
/** Espera entre tentativas de reconexão; a última se repete. */
export const ROOM_RECONNECT_DELAYS_MS = [1_000, 2_000, 4_000, 8_000, 15_000, 30_000] as const

/** Maior ficha aceita (JSON). Uma ficha de nível 20 fica bem abaixo; o teto barra lixo. */
export const ROOM_SHEET_MAX_BYTES = 256 * 1024
/** Espera depois da última edição da ficha antes de mandá-la à sala. */
export const ROOM_SHEET_PUSH_DEBOUNCE_MS = 800

/** Maior mesa aceita (JSON): mapa de 100×100 com rótulos e tokens fica bem abaixo. */
export const ROOM_TABLE_MAX_BYTES = 512 * 1024
/** Espera depois da última mudança no encontro antes de retransmitir a mesa. */
export const ROOM_TABLE_PUSH_DEBOUNCE_MS = 250
/** A sala tem uma mesa só: o encontro que o mestre está transmitindo. */
export const ROOM_TABLE_DOC_ID = 'main'

/** Notas compartilhadas: maior texto aceito e espera depois da última edição antes de publicar. */
export const ROOM_NOTE_TITLE_MAX = 200
export const ROOM_NOTE_BODY_MAX = 100_000
export const ROOM_NOTE_PUSH_DEBOUNCE_MS = 600

/** Rolagens e chat. */
export const ROOM_CHAT_MAX = 500
export const ROOM_ROLL_EXPRESSION_MAX = 60
export const ROOM_ROLL_LABEL_MAX = 80
/** Dados por rolagem (somando os termos), faces por dado e bônus fixo — barram rolagem absurda. */
export const ROOM_ROLL_MAX_DICE = 100
export const ROOM_ROLL_MAX_SIDES = 1000
export const ROOM_ROLL_MAX_BONUS = 10_000
/** Eventos guardados por sala no servidor e enviados a quem entra do zero. */
export const ROOM_LOG_MAX = 300
export const ROOM_LOG_ON_READY = 100
/** Rolagens + mensagens por membro, por janela. */
export const ROOM_EVENT_RATE_LIMIT = 20
export const ROOM_EVENT_RATE_WINDOW_S = 10

/** Tentativas de entrar numa sala por IP, por janela — barra quem tenta adivinhar códigos. */
export const ROOM_JOIN_RATE_LIMIT = 10
export const ROOM_JOIN_RATE_WINDOW_S = 60

/** Códigos de fechamento do WebSocket que encerram a sessão (o cliente não reconecta). */
export const ROOM_CLOSE = {
  invalid: 4400,
  unauthorized: 4401,
  kicked: 4403,
  closed: 4404,
} as const
