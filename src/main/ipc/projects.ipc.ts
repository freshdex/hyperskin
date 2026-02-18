import { ipcMain, dialog, BrowserWindow } from 'electron'
import { basename, join } from 'path'
import { existsSync } from 'fs'
import { v4 as uuidv4 } from 'uuid'
import { IPC } from '@shared/ipc-channels'
import type { IpcResult, Project } from '@shared/types'
import { DEFAULT_LAUNCH_FLAGS } from '@shared/defaults'
import { appStore } from '../store/app-store'
import { scanMultipleDirectories, detectGitInfo } from '../services/project-scanner'
import { logger } from '../services/logger'

export function registerProjectHandlers(): void {
  ipcMain.handle(IPC.PROJECTS_LIST, async (): Promise<IpcResult<Project[]>> => {
    try {
      const projects = appStore.get('projects') as Project[]
      logger.debug('projects', `Listed ${projects.length} projects`)
      return { success: true, data: projects }
    } catch (err) {
      logger.error('projects', 'Failed to list projects', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to list projects' }
    }
  })

  ipcMain.handle(IPC.PROJECTS_ADD, async (_event, project: Project): Promise<IpcResult<Project>> => {
    try {
      const projects = appStore.get('projects') as Project[]
      const existing = projects.findIndex((p) => p.id === project.id)
      if (existing >= 0) {
        projects[existing] = project
        logger.info('projects', `Updated project: ${project.name}`, { id: project.id })
      } else {
        projects.push(project)
        logger.info('projects', `Added project: ${project.name}`, { id: project.id, path: project.path })
      }
      appStore.set('projects', projects)
      return { success: true, data: project }
    } catch (err) {
      logger.error('projects', 'Failed to add project', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to add project' }
    }
  })

  ipcMain.handle(IPC.PROJECTS_REMOVE, async (_event, id: string): Promise<IpcResult<void>> => {
    try {
      const projects = appStore.get('projects') as Project[]
      const filtered = projects.filter((p) => p.id !== id)
      logger.info('projects', `Removed project with id: ${id}`, { remaining: filtered.length })
      appStore.set('projects', filtered)
      return { success: true }
    } catch (err) {
      logger.error('projects', 'Failed to remove project', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to remove project' }
    }
  })

  ipcMain.handle(IPC.PROJECTS_UPDATE, async (_event, id: string, data: Partial<Project>): Promise<IpcResult<Project>> => {
    try {
      const projects = appStore.get('projects') as Project[]
      const index = projects.findIndex((p) => p.id === id)
      if (index < 0) {
        logger.warn('projects', `Project not found for update: ${id}`)
        return { success: false, error: `Project with id "${id}" not found` }
      }
      projects[index] = { ...projects[index], ...data }
      appStore.set('projects', projects)
      logger.info('projects', `Updated project: ${projects[index].name}`)
      return { success: true, data: projects[index] }
    } catch (err) {
      logger.error('projects', 'Failed to update project', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update project' }
    }
  })

  ipcMain.handle(IPC.PROJECTS_SCAN, async (_event, directories: string[]): Promise<IpcResult<Project[]>> => {
    try {
      const dirsToScan = directories && directories.length > 0
        ? directories
        : (appStore.get('settings') as { scanDirectories: string[] }).scanDirectories || []
      logger.info('projects', `Scanning directories: ${dirsToScan.join(', ')}`)
      const scanned = await scanMultipleDirectories(dirsToScan)
      logger.info('projects', `Found ${scanned.length} projects from scan`)
      // Merge scanned projects into the store
      const existing = appStore.get('projects') as Project[]
      const existingPaths = new Set(existing.map((p) => p.path.toLowerCase()))
      const newProjects = scanned.filter((p) => !existingPaths.has(p.path.toLowerCase()))
      const merged = [...existing, ...newProjects]
      appStore.set('projects', merged)
      logger.info('projects', `Merged: ${newProjects.length} new, ${merged.length} total`)
      return { success: true, data: merged }
    } catch (err) {
      logger.error('projects', 'Failed to scan directories', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to scan directories' }
    }
  })

  ipcMain.handle(IPC.PROJECTS_SELECT_DIR, async (): Promise<IpcResult<string>> => {
    try {
      const win = BrowserWindow.getFocusedWindow()
      if (!win) return { success: false, error: 'No focused window' }

      const result = await dialog.showOpenDialog(win, {
        properties: ['openDirectory'],
        title: 'Select Project Directory'
      })

      if (result.canceled || result.filePaths.length === 0) {
        logger.debug('projects', 'Directory selection cancelled')
        return { success: false, error: 'Selection cancelled' }
      }

      const dirPath = result.filePaths[0]
      logger.info('projects', `Directory selected: ${dirPath}`)

      // Scan the selected directory for sub-projects
      const scanned = await scanMultipleDirectories([dirPath])
      logger.info('projects', `Scanned selected dir, found ${scanned.length} sub-projects`)

      if (scanned.length > 0) {
        // Found sub-projects — merge them in
        const existing = appStore.get('projects') as Project[]
        const existingPaths = new Set(existing.map((p) => p.path.toLowerCase()))
        const newProjects = scanned.filter((p) => !existingPaths.has(p.path.toLowerCase()))
        const merged = [...existing, ...newProjects]
        appStore.set('projects', merged)
        logger.info('projects', `Added ${newProjects.length} projects from sub-scan`)
      } else {
        // No sub-projects found — add the directory itself as a project
        const gitInfo = await detectGitInfo(dirPath)
        const settings = appStore.get('settings') as { defaultTerminal: string }
        const project: Project = {
          id: uuidv4(),
          name: basename(dirPath),
          path: dirPath,
          gitBranch: gitInfo.branch,
          gitRemote: gitInfo.remote,
          terminalTarget: (settings.defaultTerminal as 'windows-terminal' | 'hyper') || 'windows-terminal',
          claudeFlags: { ...DEFAULT_LAUNCH_FLAGS }
        }
        const existing = appStore.get('projects') as Project[]
        const alreadyExists = existing.some((p) => p.path.toLowerCase() === dirPath.toLowerCase())
        if (!alreadyExists) {
          existing.push(project)
          appStore.set('projects', existing)
          logger.info('projects', `Added directory as project: ${project.name}`, { path: dirPath })
        } else {
          logger.info('projects', `Directory already exists as project: ${dirPath}`)
        }
      }

      // Also add to scan directories if not already there
      const settings = appStore.get('settings') as { scanDirectories: string[] }
      const scanDirs = settings.scanDirectories || []
      if (!scanDirs.some((d) => d.toLowerCase() === dirPath.toLowerCase())) {
        scanDirs.push(dirPath)
        appStore.set('settings.scanDirectories', scanDirs)
        logger.info('projects', `Added to scan directories: ${dirPath}`)
      }

      return { success: true, data: dirPath }
    } catch (err) {
      logger.error('projects', 'Failed to select directory', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to select directory' }
    }
  })

  ipcMain.handle(IPC.PROJECTS_HAS_IMAGE, async (_event, projectPath: string): Promise<IpcResult<boolean>> => {
    try {
      const imagePath = join(projectPath, 'hyperskin.png')
      const exists = existsSync(imagePath)
      return { success: true, data: exists }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to check image' }
    }
  })
}
