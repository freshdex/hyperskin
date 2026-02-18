import { readFile, writeFile } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import type { WtConfig, WtProfile, WtColorScheme } from '@shared/types'
import { DEFAULT_WT_PROFILE } from '@shared/defaults'
import { appStore } from '../store/app-store'

/**
 * Strip JSONC comments (// line comments and /* block comments *​/) from a string
 * so it can be parsed as standard JSON.
 */
function stripJsonComments(text: string): string {
  let result = ''
  let i = 0
  let inString = false
  let escapeNext = false

  while (i < text.length) {
    const ch = text[i]
    const next = text[i + 1]

    if (escapeNext) {
      result += ch
      escapeNext = false
      i++
      continue
    }

    if (inString) {
      if (ch === '\\') {
        escapeNext = true
        result += ch
        i++
        continue
      }
      if (ch === '"') {
        inString = false
      }
      result += ch
      i++
      continue
    }

    // Not inside a string
    if (ch === '"') {
      inString = true
      result += ch
      i++
      continue
    }

    // Line comment
    if (ch === '/' && next === '/') {
      // Skip until end of line
      i += 2
      while (i < text.length && text[i] !== '\n') {
        i++
      }
      continue
    }

    // Block comment
    if (ch === '/' && next === '*') {
      i += 2
      while (i < text.length) {
        if (text[i] === '*' && text[i + 1] === '/') {
          i += 2
          break
        }
        i++
      }
      continue
    }

    // Trailing commas before } or ] (common in JSONC)
    if (ch === ',') {
      // Look ahead past whitespace for } or ]
      let j = i + 1
      while (j < text.length && /\s/.test(text[j])) {
        j++
      }
      if (j < text.length && (text[j] === '}' || text[j] === ']')) {
        // Skip the trailing comma
        i++
        continue
      }
    }

    result += ch
    i++
  }

  return result
}

/**
 * Auto-detect the Windows Terminal settings.json path.
 * Tries stable, then preview, then canary.
 */
export function getWtSettingsPath(): string {
  // Check if the user has configured a custom path
  const settings = appStore.get('settings')
  if (settings.wtSettingsPath && existsSync(settings.wtSettingsPath)) {
    return settings.wtSettingsPath
  }

  const localAppData = process.env.LOCALAPPDATA || ''

  const candidates = [
    // Stable
    join(localAppData, 'Packages', 'Microsoft.WindowsTerminal_8wekyb3d8bbwe', 'LocalState', 'settings.json'),
    // Preview
    join(localAppData, 'Packages', 'Microsoft.WindowsTerminalPreview_8wekyb3d8bbwe', 'LocalState', 'settings.json'),
    // Canary
    join(localAppData, 'Packages', 'Microsoft.WindowsTerminalCanary_8wekyb3d8bbwe', 'LocalState', 'settings.json')
  ]

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate
    }
  }

  // Return the stable path as default even if not found
  return candidates[0]
}

/**
 * Read and parse the Windows Terminal settings.json (JSONC format).
 * Extracts globals, profiles.defaults, profiles.list, schemes, and actions.
 */
export async function readWtConfig(path?: string): Promise<WtConfig> {
  const settingsPath = path || getWtSettingsPath()
  const raw = await readFile(settingsPath, 'utf-8')
  const cleaned = stripJsonComments(raw)
  const parsed = JSON.parse(cleaned)

  // Extract the structured config from the flat WT JSON
  const globals: WtConfig['globals'] = {}
  const globalKeys = [
    'defaultProfile', 'theme', 'alwaysShowTabs', 'showTabsInTitlebar',
    'copyOnSelect', 'copyFormatting', 'wordDelimiters', 'confirmCloseAllTabs',
    'startOnUserLogin', 'initialPosition', 'initialCols', 'initialRows',
    'launchMode', 'snapToGridOnResize', 'useAcrylicInTabRow',
    'showTerminalTitleInTitlebar', 'tabWidthMode', 'disableAnimations'
  ]
  for (const key of globalKeys) {
    if (key in parsed) {
      ;(globals as Record<string, unknown>)[key] = parsed[key]
    }
  }

  const profiles = parsed.profiles || {}
  const profileDefaults: Partial<WtProfile> = profiles.defaults || {}
  const profileList: WtProfile[] = (profiles.list || []).map((p: Record<string, unknown>) => ({
    name: (p.name as string) || 'Unnamed',
    ...p
  }))

  const schemes: WtColorScheme[] = parsed.schemes || []
  const actions: Array<{ command: string; keys?: string }> = parsed.actions || parsed.keybindings || []

  return {
    globals,
    profiles: {
      defaults: profileDefaults,
      list: profileList
    },
    schemes,
    actions
  }
}

/**
 * Write config back to settings.json.
 * Reads the existing file first, merges only the fields we manage,
 * and preserves everything else the user may have configured.
 */
export async function writeWtConfig(config: WtConfig, path?: string): Promise<void> {
  const settingsPath = path || getWtSettingsPath()

  // Read the existing file to preserve unknown fields
  let existing: Record<string, unknown> = {}
  try {
    const raw = await readFile(settingsPath, 'utf-8')
    const cleaned = stripJsonComments(raw)
    existing = JSON.parse(cleaned)
  } catch {
    // File doesn't exist or is invalid, start fresh
  }

  // Merge global settings
  const globalKeys = [
    'defaultProfile', 'theme', 'alwaysShowTabs', 'showTabsInTitlebar',
    'copyOnSelect', 'copyFormatting', 'wordDelimiters', 'confirmCloseAllTabs',
    'startOnUserLogin', 'initialPosition', 'initialCols', 'initialRows',
    'launchMode', 'snapToGridOnResize', 'useAcrylicInTabRow',
    'showTerminalTitleInTitlebar', 'tabWidthMode', 'disableAnimations'
  ]
  for (const key of globalKeys) {
    const value = (config.globals as Record<string, unknown>)[key]
    if (value !== undefined) {
      existing[key] = value
    }
  }

  // Merge profiles
  if (!existing.profiles || typeof existing.profiles !== 'object') {
    existing.profiles = {}
  }
  const existingProfiles = existing.profiles as Record<string, unknown>
  existingProfiles.defaults = {
    ...(existingProfiles.defaults as Record<string, unknown> || {}),
    ...config.profiles.defaults
  }
  existingProfiles.list = config.profiles.list

  // Merge schemes
  existing.schemes = config.schemes

  // Merge actions
  if (config.actions.length > 0) {
    existing.actions = config.actions
  }

  const output = JSON.stringify(existing, null, 4)
  await writeFile(settingsPath, output, 'utf-8')
}

/**
 * Return just the profiles list from settings.json.
 */
export async function listProfiles(path?: string): Promise<WtProfile[]> {
  const config = await readWtConfig(path)
  return config.profiles.list
}

/**
 * Return just the color schemes from settings.json.
 */
export async function listSchemes(path?: string): Promise<WtColorScheme[]> {
  const config = await readWtConfig(path)
  return config.schemes
}

/**
 * Add a color scheme to settings.json.
 * If a scheme with the same name exists, it is replaced.
 */
export async function addScheme(scheme: WtColorScheme, path?: string): Promise<void> {
  const config = await readWtConfig(path)

  // Remove any existing scheme with the same name
  config.schemes = config.schemes.filter((s) => s.name !== scheme.name)
  config.schemes.push(scheme)

  await writeWtConfig(config, path)
}

/**
 * Remove a color scheme by name from settings.json.
 */
export async function removeScheme(name: string, path?: string): Promise<void> {
  const config = await readWtConfig(path)
  config.schemes = config.schemes.filter((s) => s.name !== name)
  await writeWtConfig(config, path)
}

/**
 * Set historySize on all profiles.
 * If enabled=true, sets to the given historySize.
 * If enabled=false, resets to the default (9001).
 */
export async function setPersistentHistory(
  enabled: boolean,
  historySize: number,
  path?: string
): Promise<void> {
  const config = await readWtConfig(path)
  const size = enabled ? historySize : (DEFAULT_WT_PROFILE.historySize || 9001)

  // Set on profile defaults
  config.profiles.defaults.historySize = size

  // Set on every individual profile
  for (const profile of config.profiles.list) {
    profile.historySize = size
  }

  await writeWtConfig(config, path)
}
