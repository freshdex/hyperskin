import { ipcMain } from 'electron'
import { IPC } from '@shared/ipc-channels'
import type { IpcResult } from '@shared/types'
import {
  readClaudeSettings,
  writeClaudeSettings,
  updateSubagentModel,
  getAvailableModels
} from '../services/claude-settings-manager'

export function registerClaudeSettingsHandlers(): void {
  ipcMain.handle(
    IPC.CLAUDE_SETTINGS_READ,
    async (): Promise<IpcResult<Record<string, unknown>>> => {
      try {
        const settings = await readClaudeSettings()
        return { success: true, data: settings }
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to read Claude settings' }
      }
    }
  )

  ipcMain.handle(
    IPC.CLAUDE_SETTINGS_WRITE,
    async (_event, settings: Record<string, unknown>): Promise<IpcResult<void>> => {
      try {
        await writeClaudeSettings(settings)
        return { success: true }
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to write Claude settings' }
      }
    }
  )

  ipcMain.handle(
    IPC.CLAUDE_SETTINGS_UPDATE_SUBAGENT_MODEL,
    async (_event, model: string): Promise<IpcResult<void>> => {
      try {
        await updateSubagentModel(model)
        return { success: true }
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to update subagent model' }
      }
    }
  )

  ipcMain.handle(
    IPC.CLAUDE_SETTINGS_GET_MODELS,
    async (): Promise<IpcResult<string[]>> => {
      try {
        const models = getAvailableModels()
        return { success: true, data: models }
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to get available models' }
      }
    }
  )
}
