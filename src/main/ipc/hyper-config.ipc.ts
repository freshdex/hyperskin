import { ipcMain, dialog, BrowserWindow } from 'electron'
import { IPC } from '@shared/ipc-channels'
import type { IpcResult, HyperConfig } from '@shared/types'
import { readHyperConfig, writeHyperConfig, getDefaultHyperConfigPath } from '../services/hyper-config-parser'
import { appStore } from '../store/app-store'

export function registerHyperConfigHandlers(): void {
  ipcMain.handle(IPC.HYPER_CONFIG_READ, async (): Promise<IpcResult<HyperConfig>> => {
    try {
      const config = await readHyperConfig()
      return { success: true, data: config }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to read Hyper config' }
    }
  })

  ipcMain.handle(IPC.HYPER_CONFIG_WRITE, async (_event, config: HyperConfig): Promise<IpcResult<void>> => {
    try {
      await writeHyperConfig(config)
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to write Hyper config' }
    }
  })

  ipcMain.handle(IPC.HYPER_CONFIG_GET_PATH, async (): Promise<IpcResult<string>> => {
    try {
      const settings = appStore.get('settings')
      const path = settings.hyperConfigPath || getDefaultHyperConfigPath()
      return { success: true, data: path }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to get Hyper config path' }
    }
  })

  ipcMain.handle(IPC.HYPER_CONFIG_SELECT_PATH, async (): Promise<IpcResult<string>> => {
    try {
      const win = BrowserWindow.getFocusedWindow()
      if (!win) return { success: false, error: 'No focused window' }

      const result = await dialog.showOpenDialog(win, {
        properties: ['openFile'],
        title: 'Select Hyper Config File',
        filters: [
          { name: 'Hyper Config', extensions: ['js'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      })

      if (result.canceled || result.filePaths.length === 0) {
        return { success: false, error: 'Selection cancelled' }
      }

      // Save the selected path to settings
      const settings = appStore.get('settings')
      appStore.set('settings', { ...settings, hyperConfigPath: result.filePaths[0] })

      return { success: true, data: result.filePaths[0] }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to select Hyper config' }
    }
  })
}
