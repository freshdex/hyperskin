import { ipcMain, dialog, BrowserWindow } from 'electron'
import { IPC } from '@shared/ipc-channels'
import type { IpcResult, ThemePreset, WtColorScheme, HyperPlugin } from '@shared/types'
import {
  listThemes,
  listBuiltinThemes,
  saveTheme,
  deleteTheme,
  applyTheme,
  exportTheme,
  importTheme
} from '../services/theme-store'
import { listSchemes } from '../services/wt-config-parser'
import { listHyperPluginsInstalled, browseHyperPlugins } from '../services/plugin-manager'

export function registerThemeHandlers(): void {
  ipcMain.handle(IPC.THEMES_LIST, async (): Promise<IpcResult<ThemePreset[]>> => {
    try {
      const themes = listThemes()
      return { success: true, data: themes }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to list themes' }
    }
  })

  ipcMain.handle(IPC.THEMES_LIST_BUILTIN, async (): Promise<IpcResult<ThemePreset[]>> => {
    try {
      const themes = await listBuiltinThemes()
      return { success: true, data: themes }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to list built-in themes' }
    }
  })

  ipcMain.handle(IPC.THEMES_SAVE, async (_event, theme: ThemePreset): Promise<IpcResult<ThemePreset>> => {
    try {
      const saved = saveTheme(theme)
      return { success: true, data: saved }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to save theme' }
    }
  })

  ipcMain.handle(IPC.THEMES_DELETE, async (_event, id: string): Promise<IpcResult<void>> => {
    try {
      deleteTheme(id)
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to delete theme' }
    }
  })

  ipcMain.handle(
    IPC.THEMES_APPLY,
    async (_event, themeId: string, target: 'windows-terminal' | 'hyper'): Promise<IpcResult<void>> => {
      try {
        await applyTheme(themeId, target)
        return { success: true }
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to apply theme' }
      }
    }
  )

  ipcMain.handle(IPC.THEMES_EXPORT, async (_event, themeId: string): Promise<IpcResult<string>> => {
    try {
      const theme = exportTheme(themeId)
      if (!theme) {
        return { success: false, error: 'Theme not found' }
      }

      const win = BrowserWindow.getFocusedWindow()
      if (!win) return { success: false, error: 'No focused window' }

      const result = await dialog.showSaveDialog(win, {
        title: 'Export Theme',
        defaultPath: `${theme.name.replace(/[^a-zA-Z0-9-_]/g, '_')}.json`,
        filters: [{ name: 'JSON Files', extensions: ['json'] }]
      })

      if (result.canceled || !result.filePath) {
        return { success: false, error: 'Export cancelled' }
      }

      const { writeFile } = await import('fs/promises')
      await writeFile(result.filePath, JSON.stringify(theme, null, 2), 'utf-8')
      return { success: true, data: result.filePath }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to export theme' }
    }
  })

  ipcMain.handle(IPC.THEMES_IMPORT, async (): Promise<IpcResult<ThemePreset>> => {
    try {
      const win = BrowserWindow.getFocusedWindow()
      if (!win) return { success: false, error: 'No focused window' }

      const result = await dialog.showOpenDialog(win, {
        title: 'Import Theme',
        properties: ['openFile'],
        filters: [{ name: 'JSON Files', extensions: ['json'] }]
      })

      if (result.canceled || result.filePaths.length === 0) {
        return { success: false, error: 'Import cancelled' }
      }

      const { readFile } = await import('fs/promises')
      const raw = await readFile(result.filePaths[0], 'utf-8')
      const data = JSON.parse(raw) as ThemePreset
      const imported = importTheme(data)
      return { success: true, data: imported }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to import theme' }
    }
  })

  ipcMain.handle(IPC.THEMES_FETCH_WT_THEMES, async (): Promise<IpcResult<WtColorScheme[]>> => {
    try {
      const schemes = await listSchemes()
      return { success: true, data: schemes }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch WT color schemes' }
    }
  })

  ipcMain.handle(IPC.THEMES_FETCH_HYPER_THEMES, async (): Promise<IpcResult<HyperPlugin[]>> => {
    try {
      const themes = await browseHyperPlugins('theme')
      return { success: true, data: themes }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch Hyper themes' }
    }
  })

  ipcMain.handle(IPC.THEMES_FETCH_HYPER_PLUGINS, async (): Promise<IpcResult<HyperPlugin[]>> => {
    try {
      const plugins = await browseHyperPlugins('plugin')
      return { success: true, data: plugins }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch Hyper plugins' }
    }
  })
}
