import { platform } from 'os'
import { join } from 'path'
import { homedir } from 'os'
import { existsSync } from 'fs'

/**
 * Returns true when running on macOS.
 */
export function isMac(): boolean {
  return process.platform === 'darwin'
}

/**
 * Returns true when running on Windows.
 */
export function isWindows(): boolean {
  return process.platform === 'win32'
}

/**
 * Returns true when running on Linux.
 */
export function isLinux(): boolean {
  return process.platform === 'linux'
}

/**
 * Returns the default shell for the current operating system.
 * - macOS: zsh (default since Catalina), falls back to bash
 * - Linux: value of $SHELL or /bin/bash
 * - Windows: powershell.exe
 */
export function getDefaultShell(): string {
  if (isMac()) {
    // macOS defaults to zsh since Catalina (10.15)
    return process.env.SHELL || '/bin/zsh'
  }

  if (isLinux()) {
    return process.env.SHELL || '/bin/bash'
  }

  // Windows
  // Prefer PowerShell 7+ (pwsh) if available, otherwise fall back to Windows PowerShell
  const pwshPath = join(
    process.env.ProgramFiles || 'C:\\Program Files',
    'PowerShell',
    '7',
    'pwsh.exe'
  )
  if (existsSync(pwshPath)) {
    return pwshPath
  }
  return 'powershell.exe'
}

/**
 * Returns the default path to the Hyper terminal executable.
 * - macOS:   /Applications/Hyper.app/Contents/MacOS/Hyper
 * - Linux:   /usr/bin/hyper (snap/deb) or /usr/local/bin/hyper
 * - Windows: %LOCALAPPDATA%\Programs\hyper\Hyper.exe
 */
export function getDefaultHyperPath(): string {
  if (isMac()) {
    return '/Applications/Hyper.app/Contents/MacOS/Hyper'
  }

  if (isLinux()) {
    // Check common install locations in order of likelihood
    const candidates = [
      '/usr/bin/hyper',
      '/usr/local/bin/hyper',
      join(homedir(), '.local', 'bin', 'hyper'),
      '/snap/bin/hyper'
    ]
    for (const candidate of candidates) {
      if (existsSync(candidate)) {
        return candidate
      }
    }
    // Default to the most common path even if not found yet
    return '/usr/bin/hyper'
  }

  // Windows - Hyper installs to the user's local app data by default
  const localAppData = process.env.LOCALAPPDATA || join(homedir(), 'AppData', 'Local')
  return join(localAppData, 'Programs', 'hyper', 'Hyper.exe')
}

/**
 * Returns the default path to the Claude Code CLI executable.
 * - macOS/Linux: claude (expected on PATH, typically installed via npm)
 * - Windows:     claude.exe (expected on PATH)
 */
export function getDefaultClaudePath(): string {
  if (isWindows()) {
    return 'claude.exe'
  }
  return 'claude'
}

/**
 * Returns the OS platform name in a human-readable form.
 */
export function getPlatformName(): string {
  const p = platform()
  switch (p) {
    case 'darwin':
      return 'macOS'
    case 'win32':
      return 'Windows'
    case 'linux':
      return 'Linux'
    default:
      return p
  }
}
