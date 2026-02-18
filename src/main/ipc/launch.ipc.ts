import { ipcMain, clipboard } from 'electron'
import { IPC } from '@shared/ipc-channels'
import type { IpcResult, Project } from '@shared/types'
import { appStore } from '../store/app-store'
import { launchProject, launchTerminal, copyLaunchCommand } from '../services/process-launcher'

export function registerLaunchHandlers(): void {
  ipcMain.handle(IPC.LAUNCH_PROJECT, async (_event, projectId: string): Promise<IpcResult<void>> => {
    try {
      const projects = appStore.get('projects')
      const project = projects.find((p) => p.id === projectId)
      if (!project) {
        return { success: false, error: `Project with id "${projectId}" not found` }
      }

      // Update lastOpened timestamp
      project.lastOpened = new Date().toISOString()
      const index = projects.findIndex((p) => p.id === projectId)
      projects[index] = project
      appStore.set('projects', projects)

      await launchProject(project)
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to launch project' }
    }
  })

  ipcMain.handle(IPC.LAUNCH_TERMINAL, async (_event, workingDir?: string): Promise<IpcResult<void>> => {
    try {
      await launchTerminal({ directory: workingDir })
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to launch terminal' }
    }
  })

  ipcMain.handle(IPC.LAUNCH_COPY_COMMAND, async (_event, projectId: string): Promise<IpcResult<string>> => {
    try {
      const projects = appStore.get('projects')
      const project = projects.find((p) => p.id === projectId)
      if (!project) {
        return { success: false, error: `Project with id "${projectId}" not found` }
      }

      const command = copyLaunchCommand(project)
      clipboard.writeText(command)
      return { success: true, data: command }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to copy launch command' }
    }
  })
}
