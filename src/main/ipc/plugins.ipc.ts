import { ipcMain } from 'electron'
import { IPC } from '@shared/ipc-channels'
import type { IpcResult, Plugin } from '@shared/types'
import {
  listClaudePlugins,
  installClaudePlugin,
  uninstallClaudePlugin
} from '../services/plugin-manager'

export function registerPluginHandlers(): void {
  ipcMain.handle(IPC.PLUGINS_LIST, async (): Promise<IpcResult<Plugin[]>> => {
    try {
      const plugins = await listClaudePlugins()
      return { success: true, data: plugins }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to list Claude plugins' }
    }
  })

  ipcMain.handle(IPC.PLUGINS_INSTALL, async (_event, pluginName: string): Promise<IpcResult<Plugin>> => {
    try {
      await installClaudePlugin(pluginName)
      return {
        success: true,
        data: {
          name: pluginName,
          description: `Claude plugin: ${pluginName}`,
          installed: true,
          version: '1.0.0',
          source: 'local'
        }
      }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to install plugin' }
    }
  })

  ipcMain.handle(IPC.PLUGINS_UNINSTALL, async (_event, pluginName: string): Promise<IpcResult<void>> => {
    try {
      await uninstallClaudePlugin(pluginName)
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to uninstall plugin' }
    }
  })
}
