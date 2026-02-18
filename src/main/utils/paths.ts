import { app } from 'electron'
import { join } from 'path'
import { homedir, tmpdir } from 'os'

/**
 * Returns the default path to the Hyper terminal configuration file.
 * On all platforms this is ~/.hyper.js in the user's home directory.
 */
export function getHyperConfigPath(): string {
  return join(homedir(), '.hyper.js')
}

/**
 * Returns the path to the Claude configuration directory (~/.claude).
 * This is where Claude Code stores its settings, MCP config, etc.
 */
export function getClaudeConfigDir(): string {
  return join(homedir(), '.claude')
}

/**
 * Returns a temporary directory for HyperSkin launch scripts and ephemeral files.
 * Creates a dedicated subdirectory under the OS temp folder to avoid collisions.
 */
export function getTempDir(): string {
  return join(tmpdir(), 'hyperskin')
}

/**
 * Returns the path to the built-in themes directory bundled with the app.
 * In development this resolves relative to the project root resources folder.
 * In production it resolves inside the asar-unpacked resources directory.
 */
export function getBuiltinThemesDir(): string {
  if (app.isPackaged) {
    return join(process.resourcesPath, 'builtin-themes')
  }
  return join(app.getAppPath(), 'resources', 'builtin-themes')
}

/**
 * Returns the user data directory where HyperSkin stores its own
 * persistent data (settings, custom themes, project database, etc.).
 * On Windows: %APPDATA%/hyperskin
 * On macOS:   ~/Library/Application Support/hyperskin
 * On Linux:   ~/.config/hyperskin
 */
export function getUserDataDir(): string {
  return app.getPath('userData')
}

/**
 * Returns the path to the Claude MCP settings file.
 * This is the JSON file where MCP server configurations are stored.
 */
export function getClaudeMcpConfigPath(): string {
  return join(getClaudeConfigDir(), 'claude_desktop_config.json')
}

/**
 * Returns the path to HyperSkin's own themes storage directory
 * inside the user data folder.
 */
export function getCustomThemesDir(): string {
  return join(getUserDataDir(), 'themes')
}
