import { useSheetStore } from '../../store/sheetStore'

type SheetStore = ReturnType<typeof useSheetStore.getState>

/**
 * Edita a ficha com que o player entrou na sala pelas ações da store (gastar
 * espaço, consumir item). Carrega antes se outra ficha estiver aberta, como a
 * aba Ficha da sala; a edição chega ao mestre pelo envio da ficha.
 */
export function withRoomSheet(sheetId: string, edit: (store: SheetStore) => void) {
  if (useSheetStore.getState().sheetId !== sheetId) useSheetStore.getState().loadSheet(sheetId)
  edit(useSheetStore.getState())
}

/** Consome uma unidade do item do inventário: tira uma da pilha, ou o item quando é o último. */
export function consumeItem(sheetId: string, idx: number) {
  withRoomSheet(sheetId, store => {
    const item = store.sheet.inventory.items[idx]
    if (!item) return
    if (item.quantity > 1) store.updateItem(idx, { quantity: item.quantity - 1 })
    else store.removeItem(idx)
  })
}
