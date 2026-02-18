import { ipcMain } from 'electron'
import { IPC } from '@shared/ipc-channels'
import type { IpcResult, ClaudeInstance } from '@shared/types'
import {
  listInstances,
  addInstance,
  removeInstance,
  updateInstance,
  setDefaultInstance,
  detectInstances
} from '../services/claude-instance-manager'

export function registerClaudeInstanceHandlers(): void {
  ipcMain.handle(IPC.CLAUDE_INSTANCES_LIST, async (): Promise<IpcResult<ClaudeInstance[]>> => {
    try {
      const instances = listInstances()
      return { success: true, data: instances }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to list Claude instances' }
    }
  })

  ipcMain.handle(
    IPC.CLAUDE_INSTANCES_ADD,
    async (_event, instance: Omit<ClaudeInstance, 'id' | 'status'>): Promise<IpcResult<ClaudeInstance>> => {
      try {
        const added = addInstance(instance)
        return { success: true, data: added }
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to add Claude instance' }
      }
    }
  )

  ipcMain.handle(IPC.CLAUDE_INSTANCES_REMOVE, async (_event, id: string): Promise<IpcResult<void>> => {
    try {
      removeInstance(id)
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to remove Claude instance' }
    }
  })

  ipcMain.handle(
    IPC.CLAUDE_INSTANCES_UPDATE,
    async (_event, instance: ClaudeInstance): Promise<IpcResult<ClaudeInstance>> => {
      try {
        const updated = updateInstance(instance.id, instance)
        return { success: true, data: updated }
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to update Claude instance' }
      }
    }
  )

  ipcMain.handle(IPC.CLAUDE_INSTANCES_SET_DEFAULT, async (_event, id: string): Promise<IpcResult<void>> => {
    try {
      setDefaultInstance(id)
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to set default instance' }
    }
  })

  ipcMain.handle(IPC.CLAUDE_INSTANCES_DETECT, async (): Promise<IpcResult<ClaudeInstance[]>> => {
    try {
      const detected = await detectInstances()
      return { success: true, data: detected }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to detect Claude instances' }
    }
  })
}
