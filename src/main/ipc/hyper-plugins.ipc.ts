import { ipcMain } from 'electron'
import { IPC } from '@shared/ipc-channels'
import type { IpcResult, HyperPlugin } from '@shared/types'
import {
  listHyperPluginsInstalled,
  browseHyperPlugins,
  installHyperPlugin,
  uninstallHyperPlugin
} from '../services/plugin-manager'

export function registerHyperPluginHandlers(): void {
  ipcMain.handle(IPC.HYPER_PLUGINS_LIST_INSTALLED, async (): Promise<IpcResult<HyperPlugin[]>> => {
    try {
      const plugins = await listHyperPluginsInstalled()
      return { success: true, data: plugins }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to list installed Hyper plugins' }
    }
  })

  ipcMain.handle(
    IPC.HYPER_PLUGINS_BROWSE,
    async (_event, type?: string): Promise<IpcResult<HyperPlugin[]>> => {
      try {
        const plugins = await browseHyperPlugins(type)
        return { success: true, data: plugins }
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to browse Hyper plugins' }
      }
    }
  )

  ipcMain.handle(IPC.HYPER_PLUGINS_INSTALL, async (_event, name: string): Promise<IpcResult<void>> => {
    try {
      await installHyperPlugin(name)
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to install Hyper plugin' }
    }
  })

  ipcMain.handle(IPC.HYPER_PLUGINS_UNINSTALL, async (_event, name: string): Promise<IpcResult<void>> => {
    try {
      await uninstallHyperPlugin(name)
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to uninstall Hyper plugin' }
    }
  })
}
