import { execSync } from 'child_process'
import { existsSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'
import { v4 as uuidv4 } from 'uuid'
import type { ClaudeInstance } from '@shared/types'
import { appStore } from '../store/app-store'

/**
 * Get all Claude Code instances from the store.
 */
export function listInstances(): ClaudeInstance[] {
  return appStore.get('claudeInstances')
}

/**
 * Add a new Claude Code instance to the store.
 */
export function addInstance(
  instance: Omit<ClaudeInstance, 'id' | 'status'>
): ClaudeInstance {
  const instances = appStore.get('claudeInstances')

  const newInstance: ClaudeInstance = {
    ...instance,
    id: uuidv4(),
    status: 'unknown'
  }

  // Detect version if possible
  try {
    const version = execSync(`"${newInstance.executablePath}" --version`, {
      encoding: 'utf-8',
      timeout: 5000,
      windowsHide: true,
      stdio: ['pipe', 'pipe', 'pipe']
    }).trim()
    newInstance.version = version
    newInstance.status = 'active'
  } catch {
    newInstance.status = 'unknown'
  }

  instances.push(newInstance)
  appStore.set('claudeInstances', instances)

  return newInstance
}

/**
 * Remove a Claude Code instance by ID.
 */
export function removeInstance(id: string): void {
  const instances = appStore.get('claudeInstances')
  const filtered = instances.filter((i) => i.id !== id)
  appStore.set('claudeInstances', filtered)

  // If this was the default, unset
  const settings = appStore.get('settings')
  if (settings.defaultClaudeInstanceId === id) {
    appStore.set('settings', {
      ...settings,
      defaultClaudeInstanceId: undefined
    })
  }
}

/**
 * Update a Claude Code instance by ID.
 */
export function updateInstance(
  id: string,
  data: Partial<ClaudeInstance>
): ClaudeInstance {
  const instances = appStore.get('claudeInstances')
  const index = instances.findIndex((i) => i.id === id)

  if (index < 0) {
    throw new Error(`Claude instance with id "${id}" not found`)
  }

  const updated: ClaudeInstance = {
    ...instances[index],
    ...data,
    id // Ensure ID cannot be changed
  }

  instances[index] = updated
  appStore.set('claudeInstances', instances)

  return updated
}

/**
 * Set a Claude Code instance as the default.
 * Unsets the default flag on all other instances.
 */
export function setDefaultInstance(id: string): void {
  const instances = appStore.get('claudeInstances')

  const updated = instances.map((instance) => ({
    ...instance,
    isDefault: instance.id === id
  }))

  const target = updated.find((i) => i.id === id)
  if (!target) {
    throw new Error(`Claude instance with id "${id}" not found`)
  }

  appStore.set('claudeInstances', updated)

  // Also update the settings
  const settings = appStore.get('settings')
  appStore.set('settings', {
    ...settings,
    defaultClaudeInstanceId: id
  })
}

/**
 * Auto-detect installed Claude Code executables.
 * Checks common paths and uses `where` (Windows) / `which` (Unix) commands.
 */
export async function detectInstances(): Promise<ClaudeInstance[]> {
  const detected: ClaudeInstance[] = []
  const seenPaths = new Set<string>()

  // Try to find claude via the system path
  const findCommands = process.platform === 'win32'
    ? ['where claude', 'where claude.exe']
    : ['which claude']

  for (const cmd of findCommands) {
    try {
      const result = execSync(cmd, {
        encoding: 'utf-8',
        timeout: 5000,
        windowsHide: true,
        stdio: ['pipe', 'pipe', 'pipe']
      }).trim()

      const paths = result.split('\n').map((p) => p.trim()).filter(Boolean)
      for (const p of paths) {
        if (!seenPaths.has(p.toLowerCase())) {
          seenPaths.add(p.toLowerCase())

          let version: string | undefined
          try {
            version = execSync(`"${p}" --version`, {
              encoding: 'utf-8',
              timeout: 5000,
              windowsHide: true,
              stdio: ['pipe', 'pipe', 'pipe']
            }).trim()
          } catch {
            // Could not get version
          }

          detected.push({
            id: uuidv4(),
            label: `Claude Code (${p})`,
            executablePath: p,
            version,
            isDefault: detected.length === 0,
            status: version ? 'active' : 'unknown'
          })
        }
      }
    } catch {
      // Command not found
    }
  }

  // Check common installation paths on Windows
  if (process.platform === 'win32') {
    const commonPaths = [
      join(process.env.APPDATA || '', 'npm', 'claude.cmd'),
      join(process.env.APPDATA || '', 'npm', 'claude'),
      join(homedir(), '.npm-global', 'bin', 'claude.cmd'),
      join(homedir(), '.npm-global', 'bin', 'claude'),
      join(process.env.ProgramFiles || 'C:\\Program Files', 'Claude', 'claude.exe'),
      join(process.env.LOCALAPPDATA || '', 'Programs', 'Claude', 'claude.exe')
    ]

    for (const p of commonPaths) {
      if (existsSync(p) && !seenPaths.has(p.toLowerCase())) {
        seenPaths.add(p.toLowerCase())

        let version: string | undefined
        try {
          version = execSync(`"${p}" --version`, {
            encoding: 'utf-8',
            timeout: 5000,
            windowsHide: true,
            stdio: ['pipe', 'pipe', 'pipe']
          }).trim()
        } catch {
          // Could not get version
        }

        detected.push({
          id: uuidv4(),
          label: `Claude Code (${p})`,
          executablePath: p,
          version,
          isDefault: detected.length === 0,
          status: version ? 'active' : 'unknown'
        })
      }
    }
  }

  return detected
}
