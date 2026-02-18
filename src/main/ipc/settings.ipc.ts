import { ipcMain, dialog, BrowserWindow } from 'electron'
import { IPC } from '@shared/ipc-channels'
import type { IpcResult, AppSettings, Greeting } from '@shared/types'
import { appStore } from '../store/app-store'
import { generateGreeting } from '../services/greeting-generator'

export function registerSettingsHandlers(): void {
  ipcMain.handle(IPC.SETTINGS_GET, async (): Promise<IpcResult<AppSettings>> => {
    try {
      const settings = appStore.get('settings')
      return { success: true, data: settings }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to get settings' }
    }
  })

  ipcMain.handle(
    IPC.SETTINGS_SET,
    async (_event, settings: Partial<AppSettings>): Promise<IpcResult<AppSettings>> => {
      try {
        const current = appStore.get('settings')
        const updated = { ...current, ...settings }
        appStore.set('settings', updated)
        return { success: true, data: updated }
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to update settings' }
      }
    }
  )

  ipcMain.handle(IPC.SETTINGS_GET_GREETING, async (): Promise<IpcResult<Greeting>> => {
    try {
      const settings = appStore.get('settings')

      if (!settings.greetingEnabled) {
        return { success: true, data: undefined }
      }

      const greeting = generateGreeting(settings.userName || 'Developer')
      return { success: true, data: greeting }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to generate greeting' }
    }
  })

  ipcMain.handle(IPC.SETTINGS_SELECT_FILE, async (): Promise<IpcResult<string>> => {
    try {
      const win = BrowserWindow.getFocusedWindow()
      if (!win) return { success: false, error: 'No focused window' }

      const result = await dialog.showOpenDialog(win, {
        properties: ['openFile'],
        title: 'Select File'
      })

      if (result.canceled || result.filePaths.length === 0) {
        return { success: false, error: 'Selection cancelled' }
      }

      return { success: true, data: result.filePaths[0] }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to select file' }
    }
  })

  ipcMain.handle(IPC.SETTINGS_SELECT_DIR, async (): Promise<IpcResult<string>> => {
    try {
      const win = BrowserWindow.getFocusedWindow()
      if (!win) return { success: false, error: 'No focused window' }

      const result = await dialog.showOpenDialog(win, {
        properties: ['openDirectory'],
        title: 'Select Directory'
      })

      if (result.canceled || result.filePaths.length === 0) {
        return { success: false, error: 'Selection cancelled' }
      }

      return { success: true, data: result.filePaths[0] }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to select directory' }
    }
  })
}
