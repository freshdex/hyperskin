import { readFile, writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { dirname } from 'path'
import type { McpServer } from '@shared/types'
import { getClaudeMcpConfigPath } from '../utils/paths'

/**
 * Internal format of the MCP config file.
 * The file stores servers as a map of name -> config.
 */
interface McpConfigFile {
  mcpServers?: Record<string, {
    command: string
    args?: string[]
    env?: Record<string, string>
    disabled?: boolean
  }>
}

/**
 * Read the MCP config file and return its parsed content.
 * Returns a default empty config if the file does not exist.
 */
async function readConfigFile(): Promise<McpConfigFile> {
  const configPath = getClaudeMcpConfigPath()

  if (!existsSync(configPath)) {
    return { mcpServers: {} }
  }

  try {
    const raw = await readFile(configPath, 'utf-8')
    const parsed = JSON.parse(raw)
    return typeof parsed === 'object' && parsed !== null ? parsed : { mcpServers: {} }
  } catch {
    return { mcpServers: {} }
  }
}

/**
 * Write the MCP config file back to disk.
 * Ensures the parent directory exists.
 */
async function writeConfigFile(config: McpConfigFile): Promise<void> {
  const configPath = getClaudeMcpConfigPath()
  const dir = dirname(configPath)

  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true })
  }

  const output = JSON.stringify(config, null, 2)
  await writeFile(configPath, output, 'utf-8')
}

/**
 * List all MCP servers from the config file.
 */
export async function listMcpServers(): Promise<McpServer[]> {
  const config = await readConfigFile()
  const servers = config.mcpServers || {}

  return Object.entries(servers).map(([name, serverConfig]) => ({
    name,
    command: serverConfig.command,
    args: serverConfig.args || [],
    env: serverConfig.env,
    enabled: !serverConfig.disabled
  }))
}

/**
 * Add a new MCP server to the config.
 * Throws if a server with the same name already exists.
 */
export async function addMcpServer(server: McpServer): Promise<void> {
  const config = await readConfigFile()

  if (!config.mcpServers) {
    config.mcpServers = {}
  }

  if (config.mcpServers[server.name]) {
    throw new Error(`MCP server "${server.name}" already exists`)
  }

  config.mcpServers[server.name] = {
    command: server.command,
    args: server.args,
    env: server.env,
    disabled: !server.enabled
  }

  await writeConfigFile(config)
}

/**
 * Remove an MCP server by name.
 */
export async function removeMcpServer(name: string): Promise<void> {
  const config = await readConfigFile()

  if (!config.mcpServers || !config.mcpServers[name]) {
    throw new Error(`MCP server "${name}" not found`)
  }

  delete config.mcpServers[name]
  await writeConfigFile(config)
}

/**
 * Update an existing MCP server's configuration.
 */
export async function updateMcpServer(
  name: string,
  data: Partial<McpServer>
): Promise<void> {
  const config = await readConfigFile()

  if (!config.mcpServers || !config.mcpServers[name]) {
    throw new Error(`MCP server "${name}" not found`)
  }

  const existing = config.mcpServers[name]

  // If the name is being changed, we need to remove the old entry
  // and create a new one
  if (data.name && data.name !== name) {
    delete config.mcpServers[name]
    config.mcpServers[data.name] = {
      command: data.command ?? existing.command,
      args: data.args ?? existing.args,
      env: data.env !== undefined ? data.env : existing.env,
      disabled: data.enabled !== undefined ? !data.enabled : existing.disabled
    }
  } else {
    config.mcpServers[name] = {
      command: data.command ?? existing.command,
      args: data.args ?? existing.args,
      env: data.env !== undefined ? data.env : existing.env,
      disabled: data.enabled !== undefined ? !data.enabled : existing.disabled
    }
  }

  await writeConfigFile(config)
}

/**
 * Enable or disable an MCP server by name.
 */
export async function toggleMcpServer(
  name: string,
  enabled: boolean
): Promise<void> {
  const config = await readConfigFile()

  if (!config.mcpServers || !config.mcpServers[name]) {
    throw new Error(`MCP server "${name}" not found`)
  }

  config.mcpServers[name].disabled = !enabled
  await writeConfigFile(config)
}
