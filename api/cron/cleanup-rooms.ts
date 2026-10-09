import { deleteStaleRooms } from '../_lib/rooms.js'

/**
 * Cron diário (`vercel.json`). A Vercel chama com `Authorization: Bearer
 * $CRON_SECRET`; sem o segredo configurado a rota não roda — senão qualquer um
 * dispararia a limpeza.
 */
export async function GET(request: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    console.error('[cron/cleanup-rooms] CRON_SECRET não definido; limpeza não rodou.')
    return new Response('CRON_SECRET missing', { status: 500 })
  }
  if (request.headers.get('authorization') !== `Bearer ${secret}`) return new Response('Unauthorized', { status: 401 })
  try {
    const deleted = await deleteStaleRooms()
    console.log(`[cron/cleanup-rooms] ${deleted} sala(s) apagada(s).`)
    return Response.json({ deleted })
  } catch (err) {
    console.error('[cron/cleanup-rooms] Falha na limpeza.', err)
    return new Response('cleanup failed', { status: 500 })
  }
}
