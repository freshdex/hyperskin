import { readFile, writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join, dirname } from 'path'
import { homedir } from 'os'

/**
 * Returns the path to ~/.claude/settings.json
 */
export function getClaudeSettingsPath(): string {
  return join(homedir(), '.claude', 'settings.json')
}

/**
 * Read ~/.claude/settings.json.
 * Returns an empty object if the file does not exist.
 */
export async function readClaudeSettings(): Promise<Record<string, unknown>> {
  const settingsPath = getClaudeSettingsPath()

  if (!existsSync(settingsPath)) {
    return {}
  }

  try {
    const raw = await readFile(settingsPath, 'utf-8')
    const parsed = JSON.parse(raw)
    return typeof parsed === 'object' && parsed !== null ? parsed : {}
  } catch {
    return {}
  }
}

/**
 * Write settings back to ~/.claude/settings.json.
 * Preserves existing keys by reading the current file first and merging.
 */
export async function writeClaudeSettings(settings: Record<string, unknown>): Promise<void> {
  const settingsPath = getClaudeSettingsPath()

  // Ensure the .claude directory exists
  const dir = dirname(settingsPath)
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true })
  }

  // Read existing settings and merge
  let existing: Record<string, unknown> = {}
  try {
    const raw = await readFile(settingsPath, 'utf-8')
    const parsed = JSON.parse(raw)
    if (typeof parsed === 'object' && parsed !== null) {
      existing = parsed
    }
  } catch {
    // File doesn't exist or is invalid
  }

  const merged = { ...existing, ...settings }
  const output = JSON.stringify(merged, null, 2)
  await writeFile(settingsPath, output, 'utf-8')
}

/**
 * Update the model setting for subagents.
 * Sets the "model" key in Claude settings to override the default model.
 */
export async function updateSubagentModel(model: string): Promise<void> {
  const validModels = getAvailableModels()
  if (!validModels.includes(model)) {
    throw new Error(
      `Invalid model: ${model}. Available models: ${validModels.join(', ')}`
    )
  }

  await writeClaudeSettings({ model })
}

/**
 * Return list of known Claude model IDs.
 */
export function getAvailableModels(): string[] {
  return [
    'claude-opus-4-6',
    'claude-sonnet-4-6',
    'claude-haiku-4-5-20251001'
  ]
}
