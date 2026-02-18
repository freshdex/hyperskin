import { ipcMain } from 'electron'
import { IPC } from '@shared/ipc-channels'
import type { IpcResult } from '@shared/types'
import { logger, type LogEntry } from '../services/logger'

export function registerLogHandlers(): void {
  ipcMain.handle(IPC.LOG_GET_BUFFER, async (): Promise<IpcResult<LogEntry[]>> => {
    try {
      return { success: true, data: logger.getBuffer() }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to get log buffer' }
    }
  })

  ipcMain.handle(IPC.LOG_GET_FILE_PATH, async (): Promise<IpcResult<string>> => {
    try {
      return { success: true, data: logger.getLogFilePath() }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to get log file path' }
    }
  })

  ipcMain.handle(IPC.LOG_CLEAR, async (): Promise<IpcResult<void>> => {
    try {
      logger.clear()
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to clear logs' }
    }
  })
}
