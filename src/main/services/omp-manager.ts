import { execSync, exec } from 'child_process'
import { readFile, writeFile, readdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join, basename, extname } from 'path'
import { homedir } from 'os'
import type { OhMyPoshConfig, OhMyPoshTheme } from '@shared/types'
import { appStore } from '../store/app-store'

/**
 * Try to find the Oh My Posh themes directory.
 * First tries the `oh-my-posh get themes-dir` command,
 * then falls back to the default install location.
 */
function findThemesDir(): string {
  try {
    const result = execSync('oh-my-posh get themes-dir', {
      encoding: 'utf-8',
      timeout: 5000,
      windowsHide: true
    }).trim()
    if (result && existsSync(result)) {
      return result
    }
  } catch {
    // Command not available or failed
  }

  // Default location on Windows
  const localAppData = process.env.LOCALAPPDATA || join(homedir(), 'AppData', 'Local')
  const defaultDir = join(localAppData, 'Programs', 'oh-my-posh', 'themes')
  if (existsSync(defaultDir)) {
    return defaultDir
  }

  // Try POSH_THEMES_PATH env var
  if (process.env.POSH_THEMES_PATH && existsSync(process.env.POSH_THEMES_PATH)) {
    return process.env.POSH_THEMES_PATH
  }

  return defaultDir
}

/**
 * Detect the active Oh My Posh theme from the PowerShell profile.
 */
function detectActiveTheme(): string | undefined {
  try {
    const profilePath = execSync('powershell -NoProfile -Command "$PROFILE"', {
      encoding: 'utf-8',
      timeout: 5000,
      windowsHide: true
    }).trim()

    if (existsSync(profilePath)) {
      const content = require('fs').readFileSync(profilePath, 'utf-8')
      // Look for oh-my-posh init line with --config
      const match = content.match(/oh-my-posh\s+init\s+\w+\s+--config\s+['"]?([^'";\n]+)['"]?/)
      if (match) {
        const themePath = match[1].trim()
        const name = basename(themePath).replace(/\.omp\.(json|yaml|toml)$/, '')
        return name
      }
    }
  } catch {
    // Could not detect
  }
  return undefined
}

/**
 * Check if Oh My Posh is installed and get its status.
 */
export async function getOmpStatus(): Promise<OhMyPoshConfig> {
  try {
    const version = execSync('oh-my-posh version', {
      encoding: 'utf-8',
      timeout: 5000,
      windowsHide: true
    }).trim()

    // Find executable path
    let executablePath: string | undefined
    try {
      executablePath = execSync('where oh-my-posh', {
        encoding: 'utf-8',
        timeout: 5000,
        windowsHide: true
      }).trim().split('\n')[0].trim()
    } catch {
      executablePath = undefined
    }

    const activeTheme = detectActiveTheme()

    return {
      installed: true,
      executablePath: executablePath || undefined,
      activeTheme,
      shellIntegration: 'powershell'
    }
  } catch {
    return {
      installed: false,
      shellIntegration: 'powershell'
    }
  }
}

/**
 * Install Oh My Posh via winget.
 */
export async function installOmp(): Promise<void> {
  return new Promise((resolve, reject) => {
    exec('winget install JanDeDobbeleer.OhMyPosh -s winget', {
      timeout: 120000,
      windowsHide: true
    }, (error) => {
      if (error) {
        reject(new Error(`Failed to install Oh My Posh: ${error.message}`))
      } else {
        resolve()
      }
    })
  })
}

/**
 * List available Oh My Posh themes by reading *.omp.json files
 * from the themes directory.
 */
export async function listThemes(): Promise<OhMyPoshTheme[]> {
  const themesDir = findThemesDir()
  const themes: OhMyPoshTheme[] = []

  if (!existsSync(themesDir)) {
    return themes
  }

  try {
    const files = await readdir(themesDir)
    for (const file of files) {
      if (file.endsWith('.omp.json') || file.endsWith('.omp.yaml') || file.endsWith('.omp.toml')) {
        const name = file.replace(/\.omp\.(json|yaml|toml)$/, '')
        themes.push({
          name,
          fileName: file,
          description: undefined,
          preview: undefined,
          isCustom: false
        })
      }
    }
  } catch {
    // Could not read themes directory
  }

  return themes.sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Get the PowerShell profile path.
 */
function getPowerShellProfilePath(): string {
  try {
    return execSync('powershell -NoProfile -Command "$PROFILE"', {
      encoding: 'utf-8',
      timeout: 5000,
      windowsHide: true
    }).trim()
  } catch {
    // Fallback to default location
    const docs = join(homedir(), 'Documents')
    return join(docs, 'PowerShell', 'Microsoft.PowerShell_profile.ps1')
  }
}

/**
 * Apply a theme by updating the shell profile to include the
 * oh-my-posh init command with the selected theme.
 */
export async function applyTheme(themeName: string, shell: string): Promise<void> {
  const themesDir = findThemesDir()

  // Find the theme file
  let themeFile = ''
  const candidates = [
    `${themeName}.omp.json`,
    `${themeName}.omp.yaml`,
    `${themeName}.omp.toml`
  ]
  for (const candidate of candidates) {
    if (existsSync(join(themesDir, candidate))) {
      themeFile = join(themesDir, candidate)
      break
    }
  }

  if (!themeFile) {
    throw new Error(`Theme "${themeName}" not found in ${themesDir}`)
  }

  // Normalize the path for the config file (use forward slashes for cross-platform)
  const configPath = themeFile.replace(/\\/g, '/')

  if (shell === 'powershell' || shell === 'pwsh') {
    const profilePath = getPowerShellProfilePath()
    let content = ''

    try {
      content = await readFile(profilePath, 'utf-8')
    } catch {
      // Profile doesn't exist yet, start fresh
    }

    // The init line we want
    const initLine = `oh-my-posh init pwsh --config '${configPath}' | Invoke-Expression`

    // Check if there's already an oh-my-posh init line and replace it,
    // or append if not found
    const ompPattern = /^.*oh-my-posh\s+init\s+pwsh.*$/gm
    const newContent = content.replace(ompPattern, initLine)

    if (newContent !== content) {
      content = newContent
    } else {
      content = content.trimEnd() + '\n\n' + initLine + '\n'
    }

    // Ensure directory exists
    const { mkdir } = await import('fs/promises')
    const { dirname } = await import('path')
    await mkdir(dirname(profilePath), { recursive: true })

    await writeFile(profilePath, content, 'utf-8')
  } else if (shell === 'bash') {
    const profilePath = join(homedir(), '.bashrc')
    let content = ''

    try {
      content = await readFile(profilePath, 'utf-8')
    } catch {
      // File doesn't exist
    }

    const initLine = `eval "$(oh-my-posh init bash --config '${configPath}')"`
    const ompPattern = /^.*oh-my-posh\s+init\s+bash.*$/gm
    const newContent = content.replace(ompPattern, initLine)

    if (newContent !== content) {
      content = newContent
    } else {
      content = content.trimEnd() + '\n\n' + initLine + '\n'
    }

    await writeFile(profilePath, content, 'utf-8')
  } else if (shell === 'zsh') {
    const profilePath = join(homedir(), '.zshrc')
    let content = ''

    try {
      content = await readFile(profilePath, 'utf-8')
    } catch {
      // File doesn't exist
    }

    const initLine = `eval "$(oh-my-posh init zsh --config '${configPath}')"`
    const ompPattern = /^.*oh-my-posh\s+init\s+zsh.*$/gm
    const newContent = content.replace(ompPattern, initLine)

    if (newContent !== content) {
      content = newContent
    } else {
      content = content.trimEnd() + '\n\n' + initLine + '\n'
    }

    await writeFile(profilePath, content, 'utf-8')
  } else if (shell === 'cmd') {
    // CMD uses a Lua script via clink or a registry entry.
    // For simplicity, create/update a clink script
    const clinkDir = join(homedir(), '.clink')
    const { mkdir } = await import('fs/promises')
    await mkdir(clinkDir, { recursive: true })

    const scriptPath = join(clinkDir, 'oh-my-posh.lua')
    const luaContent = `load(io.popen('oh-my-posh init cmd --config "${configPath.replace(/'/g, '"')}"'):read("*a"))()\n`
    await writeFile(scriptPath, luaContent, 'utf-8')
  } else if (shell === 'fish') {
    const configDir = join(homedir(), '.config', 'fish')
    const { mkdir } = await import('fs/promises')
    await mkdir(configDir, { recursive: true })

    const profilePath = join(configDir, 'config.fish')
    let content = ''

    try {
      content = await readFile(profilePath, 'utf-8')
    } catch {
      // File doesn't exist
    }

    const initLine = `oh-my-posh init fish --config '${configPath}' | source`
    const ompPattern = /^.*oh-my-posh\s+init\s+fish.*$/gm
    const newContent = content.replace(ompPattern, initLine)

    if (newContent !== content) {
      content = newContent
    } else {
      content = content.trimEnd() + '\n\n' + initLine + '\n'
    }

    await writeFile(profilePath, content, 'utf-8')
  } else if (shell === 'nushell') {
    // Nushell uses a different config approach
    const configDir = join(homedir(), '.config', 'nushell')
    const { mkdir } = await import('fs/promises')
    await mkdir(configDir, { recursive: true })

    const envPath = join(configDir, 'env.nu')
    let content = ''

    try {
      content = await readFile(envPath, 'utf-8')
    } catch {
      // File doesn't exist
    }

    const initLine = `oh-my-posh init nu --config '${configPath}'`
    const ompPattern = /^.*oh-my-posh\s+init\s+nu.*$/gm
    const newContent = content.replace(ompPattern, initLine)

    if (newContent !== content) {
      content = newContent
    } else {
      content = content.trimEnd() + '\n\n' + initLine + '\n'
    }

    await writeFile(envPath, content, 'utf-8')
  }
}

/**
 * Return the path to the theme JSON file for preview purposes.
 */
export async function getPreview(themeName: string): Promise<string> {
  const themesDir = findThemesDir()

  const candidates = [
    `${themeName}.omp.json`,
    `${themeName}.omp.yaml`,
    `${themeName}.omp.toml`
  ]

  for (const candidate of candidates) {
    const fullPath = join(themesDir, candidate)
    if (existsSync(fullPath)) {
      return fullPath
    }
  }

  throw new Error(`Theme "${themeName}" not found`)
}

/**
 * Store the preferred shell in app settings.
 */
export async function setShell(shell: string): Promise<void> {
  const validShells = ['powershell', 'cmd', 'bash', 'zsh', 'fish', 'nushell']
  if (!validShells.includes(shell)) {
    throw new Error(`Invalid shell: ${shell}. Must be one of: ${validShells.join(', ')}`)
  }

  const settings = appStore.get('settings')
  appStore.set('settings', {
    ...settings,
    omp_shell: shell
  })
}
