import { exec, spawn } from 'child_process'
import { existsSync, writeFileSync, mkdirSync, unlinkSync } from 'fs'
import { join } from 'path'
import { homedir, tmpdir } from 'os'
import type { Project, ClaudeLaunchFlags, TerminalTarget } from '@shared/types'
import { appStore } from '../store/app-store'

/**
 * Build the claude CLI command string from launch flags.
 */
export function buildClaudeCommand(flags: ClaudeLaunchFlags, executablePath?: string): string {
  const parts: string[] = [executablePath || 'claude']

  if (flags.model) {
    parts.push('--model', flags.model)
  }

  if (flags.permissionMode) {
    if (flags.permissionMode === 'plan') {
      parts.push('--plan')
    } else if (flags.permissionMode === 'allow') {
      parts.push('--dangerously-skip-permissions')
    }
    // 'ask' is the default, no flag needed
  }

  if (flags.dangerouslySkipPermissions) {
    // Only add if not already added via permissionMode
    if (flags.permissionMode !== 'allow') {
      parts.push('--dangerously-skip-permissions')
    }
  }

  if (flags.maxTurns !== undefined && flags.maxTurns > 0) {
    parts.push('--max-turns', String(flags.maxTurns))
  }

  if (flags.maxBudgetUsd !== undefined && flags.maxBudgetUsd > 0) {
    parts.push('--max-budget-usd', String(flags.maxBudgetUsd))
  }

  if (flags.verbose) {
    parts.push('--verbose')
  }

  if (flags.mcpConfig) {
    parts.push('--mcp-config', `"${flags.mcpConfig}"`)
  }

  if (flags.systemPrompt) {
    parts.push('--system-prompt', `"${flags.systemPrompt}"`)
  }

  if (flags.appendSystemPrompt) {
    parts.push('--append-system-prompt', `"${flags.appendSystemPrompt}"`)
  }

  if (flags.addDirs && flags.addDirs.length > 0) {
    for (const dir of flags.addDirs) {
      parts.push('--add-dir', `"${dir}"`)
    }
  }

  if (flags.outputFormat) {
    parts.push('--output-format', flags.outputFormat)
  }

  if (flags.agent) {
    parts.push('--agent', flags.agent)
  }

  if (flags.chrome) {
    parts.push('--chrome')
  }

  if (flags.continueSession) {
    parts.push('--continue')
  }

  if (flags.resumeSession) {
    parts.push('--resume', flags.resumeSession)
  }

  if (flags.customFlags && flags.customFlags.length > 0) {
    for (const flag of flags.customFlags) {
      if (flag.value) {
        parts.push(flag.key, flag.value)
      } else {
        parts.push(flag.key)
      }
    }
  }

  return parts.join(' ')
}

/**
 * Return the command string for clipboard use.
 */
export function copyLaunchCommand(project: Project): string {
  const instances = appStore.get('claudeInstances')
  let execPath: string | undefined

  if (project.claudeInstanceId) {
    const instance = instances.find((i) => i.id === project.claudeInstanceId)
    if (instance) {
      execPath = instance.executablePath
    }
  }

  const cmd = buildClaudeCommand(project.claudeFlags, execPath)
  return `cd "${project.path}" && ${cmd}`
}

/**
 * Launch a project in the appropriate terminal with Claude Code.
 */
export async function launchProject(project: Project): Promise<void> {
  const instances = appStore.get('claudeInstances')
  let execPath: string | undefined

  if (project.claudeInstanceId) {
    const instance = instances.find((i) => i.id === project.claudeInstanceId)
    if (instance) {
      execPath = instance.executablePath
    }
  }

  const claudeCmd = buildClaudeCommand(project.claudeFlags, execPath)
  const terminal = project.terminalTarget || appStore.get('settings').defaultTerminal

  if (terminal === 'windows-terminal') {
    await launchInWindowsTerminal(project.path, claudeCmd, project.wtProfileGuid)
  } else {
    await launchInHyper(project.path, claudeCmd)
  }
}

/**
 * Launch a Windows Terminal instance with the given command.
 */
async function launchInWindowsTerminal(
  directory: string,
  command: string,
  profileGuid?: string
): Promise<void> {
  const args: string[] = []

  if (profileGuid) {
    args.push('-p', profileGuid)
  }

  args.push('-d', directory, 'cmd', '/k', command)

  return new Promise((resolve, reject) => {
    const child = spawn('wt.exe', args, { detached: true, stdio: 'ignore', shell: true })

    child.on('error', (error) => {
      reject(new Error(`Failed to launch Windows Terminal: ${error.message}`))
    })

    child.unref()
    resolve()
  })
}

/**
 * Launch a Hyper terminal instance with the given command.
 * Creates a temporary script that sets directory and runs the command.
 */
async function launchInHyper(directory: string, command: string): Promise<void> {
  const localAppData = process.env.LOCALAPPDATA || join(homedir(), 'AppData', 'Local')
  const hyperPath = join(localAppData, 'Programs', 'hyper', 'Hyper.exe')

  // Create a temporary batch script to run the command in the project directory
  const tempDir = join(tmpdir(), 'hyperskin')
  if (!existsSync(tempDir)) {
    mkdirSync(tempDir, { recursive: true })
  }

  const scriptPath = join(tempDir, `launch-${Date.now()}.bat`)
  const scriptContent = `@echo off\ncd /d "${directory}"\n${command}\n`
  writeFileSync(scriptPath, scriptContent, 'utf-8')

  // Spawn Hyper with the script
  const hyper = spawn(hyperPath, [], {
    detached: true,
    stdio: 'ignore',
    env: {
      ...process.env,
      HYPERSKIN_LAUNCH_SCRIPT: scriptPath,
      HYPERSKIN_WORKING_DIR: directory,
      HYPERSKIN_COMMAND: command
    }
  })

  hyper.unref()

  // Clean up the temp .bat file after 30 seconds
  setTimeout(() => {
    try {
      if (existsSync(scriptPath)) {
        unlinkSync(scriptPath)
      }
    } catch {
      // Ignore cleanup errors
    }
  }, 30000)
}

/**
 * Open a blank terminal at a given directory.
 */
export async function launchTerminal(opts?: {
  directory?: string
  terminal?: TerminalTarget
}): Promise<void> {
  const directory = opts?.directory || homedir()
  const terminal = opts?.terminal || appStore.get('settings').defaultTerminal

  if (terminal === 'windows-terminal') {
    return new Promise((resolve, reject) => {
      exec(`wt.exe -d "${directory}"`, { windowsHide: false }, (error) => {
        if (error) {
          reject(new Error(`Failed to launch Windows Terminal: ${error.message}`))
        } else {
          resolve()
        }
      })
    })
  } else {
    const localAppData = process.env.LOCALAPPDATA || join(homedir(), 'AppData', 'Local')
    const hyperPath = join(localAppData, 'Programs', 'hyper', 'Hyper.exe')

    const hyper = spawn(hyperPath, [], {
      detached: true,
      stdio: 'ignore',
      cwd: directory
    })
    hyper.unref()
  }
}
