import { readdir, readFile } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import type { ThemePreset, WtColorScheme } from '@shared/types'
import { appStore } from '../store/app-store'
import { getBuiltinThemesDir } from '../utils/paths'
import { addScheme } from './wt-config-parser'
import { readHyperConfig, writeHyperConfig } from './hyper-config-parser'

/**
 * Get all user-saved themes from the electron-store.
 */
export function listThemes(): ThemePreset[] {
  return appStore.get('themePresets')
}

/**
 * Read built-in theme JSON files from the resources/builtin-themes/ directory.
 * Each file should be a JSON file containing a ThemePreset object.
 */
export async function listBuiltinThemes(): Promise<ThemePreset[]> {
  const themesDir = getBuiltinThemesDir()
  const themes: ThemePreset[] = []

  if (!existsSync(themesDir)) {
    return themes
  }

  try {
    const files = await readdir(themesDir)

    for (const file of files) {
      if (!file.endsWith('.json')) continue

      try {
        const filePath = join(themesDir, file)
        const raw = await readFile(filePath, 'utf-8')
        const parsed = JSON.parse(raw) as ThemePreset

        themes.push({
          ...parsed,
          builtin: true,
          source: 'builtin'
        })
      } catch {
        // Skip invalid theme files
      }
    }
  } catch {
    // Could not read themes directory
  }

  return themes.sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Save a new theme or update an existing one in the store.
 * Generates id, createdAt, and updatedAt automatically.
 */
export function saveTheme(
  theme: Omit<ThemePreset, 'id' | 'createdAt' | 'updatedAt'>
): ThemePreset {
  const themes = appStore.get('themePresets')
  const now = new Date().toISOString()

  // Check if a theme with the same name already exists
  const existingIndex = themes.findIndex(
    (t) => t.name.toLowerCase() === theme.name.toLowerCase()
  )

  const saved: ThemePreset = {
    ...theme,
    id: existingIndex >= 0 ? themes[existingIndex].id : uuidv4(),
    createdAt: existingIndex >= 0 ? themes[existingIndex].createdAt : now,
    updatedAt: now
  }

  if (existingIndex >= 0) {
    themes[existingIndex] = saved
  } else {
    themes.push(saved)
  }

  appStore.set('themePresets', themes)
  return saved
}

/**
 * Delete a theme by ID from the store.
 * Built-in themes cannot be deleted.
 */
export function deleteTheme(id: string): void {
  const themes = appStore.get('themePresets')
  const theme = themes.find((t) => t.id === id)

  if (theme?.builtin) {
    throw new Error('Cannot delete built-in themes')
  }

  const filtered = themes.filter((t) => t.id !== id)
  appStore.set('themePresets', filtered)
}

/**
 * Apply a theme to the target terminal configuration.
 * For 'windows-terminal': adds the color scheme to settings.json.
 * For 'hyper': updates the Hyper config with theme colors.
 */
export async function applyTheme(
  id: string,
  target: 'windows-terminal' | 'hyper'
): Promise<void> {
  // Look in both user themes and built-in themes
  const userThemes = appStore.get('themePresets')
  let theme = userThemes.find((t) => t.id === id)

  if (!theme) {
    const builtins = await listBuiltinThemes()
    theme = builtins.find((t) => t.id === id)
  }

  if (!theme) {
    throw new Error(`Theme with id "${id}" not found`)
  }

  if (target === 'windows-terminal') {
    if (!theme.wtScheme) {
      throw new Error('Theme does not have a Windows Terminal color scheme')
    }
    await addScheme(theme.wtScheme)
  } else if (target === 'hyper') {
    if (!theme.hyperConfig) {
      throw new Error('Theme does not have Hyper configuration')
    }
    const config = await readHyperConfig()
    const updatedConfig = {
      ...config,
      config: {
        ...config.config,
        ...theme.hyperConfig
      }
    }
    await writeHyperConfig(updatedConfig)
  }
}

/**
 * Get theme data for export. Returns the theme object or null if not found.
 */
export function exportTheme(id: string): ThemePreset | null {
  const themes = appStore.get('themePresets')
  return themes.find((t) => t.id === id) || null
}

/**
 * Import a theme from a JSON ThemePreset object.
 * Assigns a new ID and timestamps to avoid collisions.
 */
export function importTheme(data: ThemePreset): ThemePreset {
  const now = new Date().toISOString()
  const imported: ThemePreset = {
    ...data,
    id: uuidv4(),
    builtin: false,
    source: 'user',
    createdAt: now,
    updatedAt: now
  }

  const themes = appStore.get('themePresets')
  themes.push(imported)
  appStore.set('themePresets', themes)

  return imported
}
