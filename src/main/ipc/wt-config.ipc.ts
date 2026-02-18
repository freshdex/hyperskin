import { ipcMain, dialog, BrowserWindow } from 'electron'
import { IPC } from '@shared/ipc-channels'
import type { IpcResult, WtConfig, WtProfile, WtColorScheme } from '@shared/types'
import {
  getWtSettingsPath,
  readWtConfig,
  writeWtConfig,
  listProfiles,
  listSchemes,
  addScheme,
  removeScheme,
  setPersistentHistory
} from '../services/wt-config-parser'
import { appStore } from '../store/app-store'

export function registerWtConfigHandlers(): void {
  ipcMain.handle(IPC.WT_CONFIG_READ, async (): Promise<IpcResult<WtConfig>> => {
    try {
      const config = await readWtConfig()
      return { success: true, data: config }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to read Windows Terminal config' }
    }
  })

  ipcMain.handle(IPC.WT_CONFIG_WRITE, async (_event, config: WtConfig): Promise<IpcResult<void>> => {
    try {
      await writeWtConfig(config)
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to write Windows Terminal config' }
    }
  })

  ipcMain.handle(IPC.WT_CONFIG_GET_PATH, async (): Promise<IpcResult<string>> => {
    try {
      const path = getWtSettingsPath()
      return { success: true, data: path }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to get WT settings path' }
    }
  })

  ipcMain.handle(IPC.WT_CONFIG_SELECT_PATH, async (): Promise<IpcResult<string>> => {
    try {
      const win = BrowserWindow.getFocusedWindow()
      if (!win) return { success: false, error: 'No focused window' }

      const result = await dialog.showOpenDialog(win, {
        properties: ['openFile'],
        title: 'Select Windows Terminal Settings File',
        filters: [
          { name: 'JSON Files', extensions: ['json'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      })

      if (result.canceled || result.filePaths.length === 0) {
        return { success: false, error: 'Selection cancelled' }
      }

      // Save the selected path to settings
      const settings = appStore.get('settings')
      appStore.set('settings', { ...settings, wtSettingsPath: result.filePaths[0] })

      return { success: true, data: result.filePaths[0] }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to select WT settings path' }
    }
  })

  ipcMain.handle(IPC.WT_PROFILES_LIST, async (): Promise<IpcResult<WtProfile[]>> => {
    try {
      const profiles = await listProfiles()
      return { success: true, data: profiles }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to list WT profiles' }
    }
  })

  ipcMain.handle(IPC.WT_SCHEMES_LIST, async (): Promise<IpcResult<WtColorScheme[]>> => {
    try {
      const schemes = await listSchemes()
      return { success: true, data: schemes }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to list WT color schemes' }
    }
  })

  ipcMain.handle(IPC.WT_SCHEME_ADD, async (_event, scheme: WtColorScheme): Promise<IpcResult<void>> => {
    try {
      await addScheme(scheme)
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to add color scheme' }
    }
  })

  ipcMain.handle(IPC.WT_SCHEME_REMOVE, async (_event, name: string): Promise<IpcResult<void>> => {
    try {
      await removeScheme(name)
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to remove color scheme' }
    }
  })

  ipcMain.handle(
    IPC.WT_SET_PERSISTENT_HISTORY,
    async (_event, enabled: boolean, historySize: number): Promise<IpcResult<void>> => {
      try {
        await setPersistentHistory(enabled, historySize)

        // Also update app settings
        const settings = appStore.get('settings')
        appStore.set('settings', {
          ...settings,
          persistentHistory: enabled,
          historySize
        })

        return { success: true }
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to set persistent history' }
      }
    }
  )
}
