import { registerProjectHandlers } from './projects.ipc'
import { registerWtConfigHandlers } from './wt-config.ipc'
import { registerHyperConfigHandlers } from './hyper-config.ipc'
import { registerThemeHandlers } from './themes.ipc'
import { registerThemeSharingHandlers } from './theme-sharing.ipc'
import { registerOmpHandlers } from './omp.ipc'
import { registerClaudeInstanceHandlers } from './claude-instances.ipc'
import { registerLaunchHandlers } from './launch.ipc'
import { registerSettingsHandlers } from './settings.ipc'
import { registerAppThemeHandlers } from './app-theme.ipc'
import { registerUpdateHandlers } from './updates.ipc'
import { registerMcpHandlers } from './mcp.ipc'
import { registerHyperPluginHandlers } from './hyper-plugins.ipc'
import { registerPluginHandlers } from './plugins.ipc'
import { registerClaudeSettingsHandlers } from './claude-settings.ipc'
import { registerLogHandlers } from './log.ipc'

export function registerAllHandlers(): void {
  registerProjectHandlers()
  registerWtConfigHandlers()
  registerHyperConfigHandlers()
  registerThemeHandlers()
  registerThemeSharingHandlers()
  registerOmpHandlers()
  registerClaudeInstanceHandlers()
  registerLaunchHandlers()
  registerSettingsHandlers()
  registerAppThemeHandlers()
  registerUpdateHandlers()
  registerMcpHandlers()
  registerHyperPluginHandlers()
  registerPluginHandlers()
  registerClaudeSettingsHandlers()
  registerLogHandlers()
}
