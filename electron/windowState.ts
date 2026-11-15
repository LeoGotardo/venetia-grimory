import fs from 'node:fs'
import path from 'node:path'
import { screen, type BrowserWindow, type Rectangle } from 'electron'

/**
 * Tamanho, posição e "maximizada" da janela entre aberturas, num JSON dentro
 * do userData. Uma posição que caiu fora de todas as telas (monitor
 * desconectado) é descartada e a janela abre centralizada.
 */

interface WindowState {
  bounds?: Rectangle
  maximized?: boolean
}

const DEFAULT_SIZE = { width: 1280, height: 860 }

function stateFile(userData: string): string {
  return path.join(userData, 'window-state.json')
}

function isVisible(bounds: Rectangle): boolean {
  return screen.getAllDisplays().some(({ workArea }) =>
    bounds.x < workArea.x + workArea.width
    && bounds.x + bounds.width > workArea.x
    && bounds.y < workArea.y + workArea.height
    && bounds.y + bounds.height > workArea.y)
}

export function loadWindowState(userData: string): { bounds: Partial<Rectangle>; maximized: boolean } {
  try {
    const state = JSON.parse(fs.readFileSync(stateFile(userData), 'utf8')) as WindowState
    const b = state.bounds
    const valid = b && [b.x, b.y, b.width, b.height].every(Number.isFinite) && b.width > 0 && b.height > 0
    return { bounds: valid && isVisible(b) ? b : DEFAULT_SIZE, maximized: state.maximized === true }
  } catch {
    return { bounds: DEFAULT_SIZE, maximized: false }
  }
}

export function trackWindowState(win: BrowserWindow, userData: string): void {
  win.on('close', () => {
    const state: WindowState = { bounds: win.getNormalBounds(), maximized: win.isMaximized() }
    try {
      fs.writeFileSync(stateFile(userData), JSON.stringify(state))
    } catch (err) {
      console.warn('[janela] Não foi possível guardar o tamanho da janela.', err)
    }
  })
}
