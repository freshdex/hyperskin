import { ipcMain } from 'electron'
import { IPC } from '@shared/ipc-channels'
import type { IpcResult, AppTheme } from '@shared/types'
import { DEFAULT_APP_THEME } from '@shared/defaults'
import { appStore } from '../store/app-store'

export function registerAppThemeHandlers(): void {
  ipcMain.handle(IPC.APP_THEME_GET, async (): Promise<IpcResult<AppTheme>> => {
    try {
      const settings = appStore.get('settings')
      const theme = settings.appTheme || DEFAULT_APP_THEME
      return { success: true, data: theme }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to get app theme' }
    }
  })

  ipcMain.handle(IPC.APP_THEME_SET, async (_event, theme: AppTheme): Promise<IpcResult<AppTheme>> => {
    try {
      const settings = appStore.get('settings')
      appStore.set('settings', { ...settings, appTheme: theme })
      return { success: true, data: theme }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to set app theme' }
    }
  })

  ipcMain.handle(IPC.APP_THEME_RESET, async (): Promise<IpcResult<AppTheme>> => {
    try {
      const settings = appStore.get('settings')
      appStore.set('settings', { ...settings, appTheme: DEFAULT_APP_THEME })
      return { success: true, data: DEFAULT_APP_THEME }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to reset app theme' }
    }
  })
}
