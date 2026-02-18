import { readFile, readdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'
import { net } from 'electron'
import type { HyperPlugin, Plugin } from '@shared/types'
import { readHyperConfig, writeHyperConfig } from './hyper-config-parser'
import { getClaudeConfigDir } from '../utils/paths'

/**
 * Fetch a URL using Electron's net module and return the body as a string.
 */
function fetchUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const request = net.request({ url, method: 'GET' })
    request.setHeader('User-Agent', 'HyperSkin/1.0')

    let body = ''

    request.on('response', (response) => {
      response.on('data', (chunk) => {
        body += chunk.toString()
      })
      response.on('end', () => {
        if (response.statusCode && response.statusCode >= 200 && response.statusCode < 300) {
          resolve(body)
        } else {
          reject(new Error(`HTTP ${response.statusCode}`))
        }
      })
      response.on('error', reject)
    })

    request.on('error', reject)
    request.end()
  })
}

// ---- Hyper Plugins ----

/**
 * List Hyper plugins currently installed (from .hyper.js plugins array).
 */
export async function listHyperPluginsInstalled(): Promise<HyperPlugin[]> {
  const config = await readHyperConfig()
  const plugins: HyperPlugin[] = []

  for (const name of config.plugins) {
    // Try to get info from the local node_modules
    const pluginDir = join(homedir(), '.hyper_plugins', 'node_modules', name)
    let description = ''
    let version = ''
    let homepage: string | undefined
    let pluginType: 'plugin' | 'theme' = 'plugin'

    try {
      const pkgPath = join(pluginDir, 'package.json')
      if (existsSync(pkgPath)) {
        const pkg = JSON.parse(await readFile(pkgPath, 'utf-8'))
        description = pkg.description || ''
        version = pkg.version || ''
        homepage = pkg.homepage || pkg.repository?.url
        // Hyper themes typically have "hyper-theme" keyword
        if (pkg.keywords?.includes('hyper-theme') || name.includes('theme')) {
          pluginType = 'theme'
        }
      }
    } catch {
      // Could not read package info
    }

    plugins.push({
      name,
      description,
      version,
      homepage,
      installed: true,
      type: pluginType
    })
  }

  return plugins
}

/**
 * Browse available Hyper plugins/themes from the npm registry.
 * Searches for packages with the "hyper-plugin" or "hyper-theme" keyword.
 */
export async function browseHyperPlugins(
  type: string = 'plugin'
): Promise<HyperPlugin[]> {
  const keyword = type === 'theme' ? 'hyper-theme' : 'hyper-plugin'
  const plugins: HyperPlugin[] = []

  try {
    // Search npm registry for packages with the keyword
    const searchUrl = `https://registry.npmjs.org/-/v1/search?text=keywords:${keyword}&size=100`
    const body = await fetchUrl(searchUrl)
    const result = JSON.parse(body)

    // Get list of currently installed plugins for the "installed" flag
    const config = await readHyperConfig()
    const installedSet = new Set(config.plugins)

    if (result.objects && Array.isArray(result.objects)) {
      for (const obj of result.objects) {
        const pkg = obj.package
        if (!pkg || !pkg.name) continue

        plugins.push({
          name: pkg.name,
          description: pkg.description || '',
          version: pkg.version || '',
          homepage: pkg.links?.homepage || pkg.links?.repository || undefined,
          installed: installedSet.has(pkg.name),
          type: type === 'theme' ? 'theme' : 'plugin'
        })
      }
    }
  } catch {
    // Could not fetch from npm registry
  }

  return plugins
}

/**
 * Install a Hyper plugin by adding it to the .hyper.js plugins array.
 * Hyper will automatically download and install the plugin on next launch.
 */
export async function installHyperPlugin(name: string): Promise<void> {
  const config = await readHyperConfig()

  if (config.plugins.includes(name)) {
    return // Already installed
  }

  config.plugins.push(name)
  await writeHyperConfig(config)
}

/**
 * Uninstall a Hyper plugin by removing it from the .hyper.js plugins array.
 */
export async function uninstallHyperPlugin(name: string): Promise<void> {
  const config = await readHyperConfig()

  const index = config.plugins.indexOf(name)
  if (index < 0) {
    throw new Error(`Plugin "${name}" is not installed`)
  }

  config.plugins.splice(index, 1)
  await writeHyperConfig(config)
}

// ---- Claude Plugins ----

/**
 * List Claude plugins from the ~/.claude directory.
 * Claude plugins are directories or files in ~/.claude/plugins/
 */
export async function listClaudePlugins(): Promise<Plugin[]> {
  const pluginsDir = join(getClaudeConfigDir(), 'plugins')
  const plugins: Plugin[] = []

  if (!existsSync(pluginsDir)) {
    return plugins
  }

  try {
    const entries = await readdir(pluginsDir, { withFileTypes: true })

    for (const entry of entries) {
      if (entry.isDirectory()) {
        let description = ''
        let version: string | undefined

        // Try to read package.json or plugin metadata
        const pkgPath = join(pluginsDir, entry.name, 'package.json')
        if (existsSync(pkgPath)) {
          try {
            const pkg = JSON.parse(await readFile(pkgPath, 'utf-8'))
            description = pkg.description || ''
            version = pkg.version
          } catch {
            // Could not parse package.json
          }
        }

        // Try manifest.json as alternative
        const manifestPath = join(pluginsDir, entry.name, 'manifest.json')
        if (!description && existsSync(manifestPath)) {
          try {
            const manifest = JSON.parse(await readFile(manifestPath, 'utf-8'))
            description = manifest.description || ''
            version = manifest.version
          } catch {
            // Could not parse manifest
          }
        }

        plugins.push({
          name: entry.name,
          description,
          installed: true,
          version,
          source: 'local'
        })
      }
    }
  } catch {
    // Could not read plugins directory
  }

  return plugins
}

/**
 * Install a Claude plugin.
 * This creates a placeholder directory in ~/.claude/plugins/
 * In a full implementation, this would download from a plugin registry.
 */
export async function installClaudePlugin(name: string): Promise<void> {
  const pluginsDir = join(getClaudeConfigDir(), 'plugins')
  const pluginDir = join(pluginsDir, name)

  const { mkdir, writeFile } = await import('fs/promises')
  await mkdir(pluginDir, { recursive: true })

  // Create a minimal manifest
  const manifest = {
    name,
    version: '1.0.0',
    description: `Claude plugin: ${name}`,
    installed: new Date().toISOString()
  }

  await writeFile(
    join(pluginDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2),
    'utf-8'
  )
}

/**
 * Uninstall a Claude plugin by removing its directory.
 */
export async function uninstallClaudePlugin(name: string): Promise<void> {
  const pluginsDir = join(getClaudeConfigDir(), 'plugins')
  const pluginDir = join(pluginsDir, name)

  if (!existsSync(pluginDir)) {
    throw new Error(`Plugin "${name}" is not installed`)
  }

  const { rm } = await import('fs/promises')
  await rm(pluginDir, { recursive: true, force: true })
}
