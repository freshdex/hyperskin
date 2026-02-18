import { readFile, writeFile } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'
import * as vm from 'vm'
import type { HyperConfig } from '@shared/types'
import { DEFAULT_HYPER_CONFIG } from '@shared/defaults'
import { appStore } from '../store/app-store'

/**
 * Returns the default path to .hyper.js in the user's home directory.
 */
export function getDefaultHyperConfigPath(): string {
  return join(homedir(), '.hyper.js')
}

/**
 * Get the effective Hyper config path, checking user settings first.
 */
function resolveConfigPath(configPath?: string): string {
  if (configPath) return configPath

  const settings = appStore.get('settings')
  if (settings.hyperConfigPath && existsSync(settings.hyperConfigPath)) {
    return settings.hyperConfigPath
  }

  return getDefaultHyperConfigPath()
}

/**
 * Deep merge two objects. Source values overwrite target values.
 * Arrays are replaced, not merged.
 */
function deepMerge<T extends Record<string, unknown>>(target: T, source: Partial<T>): T {
  const result = { ...target }

  for (const key of Object.keys(source) as Array<keyof T>) {
    const sourceVal = source[key]
    const targetVal = target[key]

    if (
      sourceVal !== null &&
      sourceVal !== undefined &&
      typeof sourceVal === 'object' &&
      !Array.isArray(sourceVal) &&
      typeof targetVal === 'object' &&
      !Array.isArray(targetVal) &&
      targetVal !== null
    ) {
      result[key] = deepMerge(
        targetVal as Record<string, unknown>,
        sourceVal as Record<string, unknown>
      ) as T[keyof T]
    } else if (sourceVal !== undefined) {
      result[key] = sourceVal as T[keyof T]
    }
  }

  return result
}

/**
 * Read .hyper.js, extract the object literal after `module.exports =`,
 * and evaluate it in a sandboxed VM context.
 * Merges with DEFAULT_HYPER_CONFIG for any missing fields.
 */
export async function readHyperConfig(configPath?: string): Promise<HyperConfig> {
  const filePath = resolveConfigPath(configPath)

  if (!existsSync(filePath)) {
    return { ...DEFAULT_HYPER_CONFIG }
  }

  const raw = await readFile(filePath, 'utf-8')

  // Extract the value assigned to module.exports
  // The file format is: module.exports = { ... };
  const match = raw.match(/module\.exports\s*=\s*/)
  if (!match || match.index === undefined) {
    return { ...DEFAULT_HYPER_CONFIG }
  }

  const objectSource = raw.slice(match.index + match[0].length)

  // Create a sandboxed context with no globals
  const sandbox: Record<string, unknown> = {}
  const script = new vm.Script(`__result = ${objectSource}`)
  const context = vm.createContext(sandbox)

  try {
    script.runInContext(context, { timeout: 2000 })
  } catch {
    // If evaluation fails, return defaults
    return { ...DEFAULT_HYPER_CONFIG }
  }

  const parsed = sandbox.__result as Partial<HyperConfig>
  if (!parsed || typeof parsed !== 'object') {
    return { ...DEFAULT_HYPER_CONFIG }
  }

  // Deep merge with defaults to fill in any missing fields
  const merged = deepMerge(
    DEFAULT_HYPER_CONFIG as unknown as Record<string, unknown>,
    parsed as unknown as Record<string, unknown>
  ) as unknown as HyperConfig

  return merged
}

/**
 * Serialize a JavaScript value to clean JS source code.
 * Produces unquoted keys, single-quoted strings, proper indentation.
 */
function serializeToJs(value: unknown, indent: number = 0): string {
  const pad = '  '.repeat(indent)
  const padInner = '  '.repeat(indent + 1)

  if (value === null || value === undefined) {
    return String(value)
  }

  if (typeof value === 'boolean' || typeof value === 'number') {
    return String(value)
  }

  if (typeof value === 'string') {
    // Use single quotes, escape internal single quotes
    const escaped = value
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t')
    return `'${escaped}'`
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return '[]'
    }
    const items = value.map((item) => `${padInner}${serializeToJs(item, indent + 1)}`)
    return `[\n${items.join(',\n')}\n${pad}]`
  }

  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>
    const keys = Object.keys(obj)
    if (keys.length === 0) {
      return '{}'
    }

    const entries = keys.map((key) => {
      // Use unquoted keys if they are valid JS identifiers
      const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `'${key}'`
      return `${padInner}${safeKey}: ${serializeToJs(obj[key], indent + 1)}`
    })

    return `{\n${entries.join(',\n')}\n${pad}}`
  }

  return String(value)
}

/**
 * Write the Hyper config back to .hyper.js.
 * Serializes to clean JavaScript with unquoted keys, single-quoted strings,
 * and 2-space indentation matching Hyper's expected format.
 */
export async function writeHyperConfig(config: HyperConfig, configPath?: string): Promise<void> {
  const filePath = resolveConfigPath(configPath)
  const serialized = serializeToJs(config, 0)
  const output = `module.exports = ${serialized};\n`
  await writeFile(filePath, output, 'utf-8')
}
