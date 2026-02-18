import { ipcMain } from 'electron'
import { IPC } from '@shared/ipc-channels'
import type { IpcResult, OhMyPoshConfig, OhMyPoshTheme } from '@shared/types'
import {
  getOmpStatus,
  installOmp,
  listThemes,
  applyTheme,
  getPreview,
  setShell
} from '../services/omp-manager'

export function registerOmpHandlers(): void {
  ipcMain.handle(IPC.OMP_GET_STATUS, async (): Promise<IpcResult<OhMyPoshConfig>> => {
    try {
      const status = await getOmpStatus()
      return { success: true, data: status }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to get Oh My Posh status' }
    }
  })

  ipcMain.handle(IPC.OMP_INSTALL, async (): Promise<IpcResult<void>> => {
    try {
      await installOmp()
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to install Oh My Posh' }
    }
  })

  ipcMain.handle(IPC.OMP_LIST_THEMES, async (): Promise<IpcResult<OhMyPoshTheme[]>> => {
    try {
      const themes = await listThemes()
      return { success: true, data: themes }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to list Oh My Posh themes' }
    }
  })

  ipcMain.handle(
    IPC.OMP_APPLY_THEME,
    async (_event, themeName: string, shell: string): Promise<IpcResult<void>> => {
      try {
        await applyTheme(themeName, shell)
        return { success: true }
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to apply Oh My Posh theme' }
      }
    }
  )

  ipcMain.handle(IPC.OMP_GET_PREVIEW, async (_event, themeName: string): Promise<IpcResult<string>> => {
    try {
      const previewPath = await getPreview(themeName)
      return { success: true, data: previewPath }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to get theme preview' }
    }
  })

  ipcMain.handle(IPC.OMP_SET_SHELL, async (_event, shell: string): Promise<IpcResult<void>> => {
    try {
      await setShell(shell)
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to set shell' }
    }
  })
}
