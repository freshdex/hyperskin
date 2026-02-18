import { ipcMain } from 'electron'
import { IPC } from '@shared/ipc-channels'
import type { IpcResult, McpServer } from '@shared/types'
import {
  listMcpServers,
  addMcpServer,
  removeMcpServer,
  updateMcpServer,
  toggleMcpServer
} from '../services/mcp-manager'

export function registerMcpHandlers(): void {
  ipcMain.handle(IPC.MCP_LIST, async (): Promise<IpcResult<McpServer[]>> => {
    try {
      const servers = await listMcpServers()
      return { success: true, data: servers }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to list MCP servers' }
    }
  })

  ipcMain.handle(IPC.MCP_ADD, async (_event, server: McpServer): Promise<IpcResult<McpServer>> => {
    try {
      await addMcpServer(server)
      return { success: true, data: server }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to add MCP server' }
    }
  })

  ipcMain.handle(IPC.MCP_REMOVE, async (_event, name: string): Promise<IpcResult<void>> => {
    try {
      await removeMcpServer(name)
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to remove MCP server' }
    }
  })

  ipcMain.handle(IPC.MCP_UPDATE, async (_event, server: McpServer): Promise<IpcResult<McpServer>> => {
    try {
      await updateMcpServer(server.name, server)
      return { success: true, data: server }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update MCP server' }
    }
  })

  ipcMain.handle(
    IPC.MCP_TOGGLE,
    async (_event, name: string, enabled: boolean): Promise<IpcResult<void>> => {
      try {
        await toggleMcpServer(name, enabled)
        return { success: true }
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to toggle MCP server' }
      }
    }
  )
}
