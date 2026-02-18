import { ipcMain } from 'electron'
import { IPC } from '@shared/ipc-channels'
import type { IpcResult, UpdateInfo } from '@shared/types'
import { checkForUpdates, getChangelog } from '../services/update-checker'

export function registerUpdateHandlers(): void {
  ipcMain.handle(IPC.UPDATES_CHECK, async (): Promise<IpcResult<UpdateInfo>> => {
    try {
      const updateInfo = await checkForUpdates()
      return { success: true, data: updateInfo }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to check for updates' }
    }
  })

  ipcMain.handle(IPC.UPDATES_GET_CHANGELOG, async (): Promise<IpcResult<string>> => {
    try {
      const changelog = await getChangelog()
      return { success: true, data: changelog }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to get changelog' }
    }
  })
}
