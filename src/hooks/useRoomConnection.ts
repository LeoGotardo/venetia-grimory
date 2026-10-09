import { useEffect } from 'react'
import { useRoomStore } from '../store/roomStore'

/**
 * Liga o socket da sala enquanto a tela está aberta. Sair da tela não
 * desliga: navegar entre a campanha e um encontro não deve custar reconexão.
 * Quem desliga é sair, fechar ou esquecer a sala.
 */
export function useRoomConnection(roomId: string | null) {
  const connect = useRoomStore(s => s.connect)
  useEffect(() => {
    if (roomId) connect(roomId)
  }, [roomId, connect])
}
