export const IPC = {
  // Projects
  PROJECTS_LIST: 'projects:list',
  PROJECTS_ADD: 'projects:add',
  PROJECTS_REMOVE: 'projects:remove',
  PROJECTS_UPDATE: 'projects:update',
  PROJECTS_SCAN: 'projects:scan',
  PROJECTS_SELECT_DIR: 'projects:select-dir',
  PROJECTS_HAS_IMAGE: 'projects:has-image',

  // Windows Terminal Config
  WT_CONFIG_READ: 'wt-config:read',
  WT_CONFIG_WRITE: 'wt-config:write',
  WT_CONFIG_GET_PATH: 'wt-config:get-path',
  WT_CONFIG_SELECT_PATH: 'wt-config:select-path',
  WT_PROFILES_LIST: 'wt-config:profiles-list',
  WT_SCHEMES_LIST: 'wt-config:schemes-list',
  WT_SCHEME_ADD: 'wt-config:scheme-add',
  WT_SCHEME_REMOVE: 'wt-config:scheme-remove',
  WT_SET_PERSISTENT_HISTORY: 'wt-config:set-persistent-history',

  // Hyper Config (secondary)
  HYPER_CONFIG_READ: 'hyper-config:read',
  HYPER_CONFIG_WRITE: 'hyper-config:write',
  HYPER_CONFIG_GET_PATH: 'hyper-config:get-path',
  HYPER_CONFIG_SELECT_PATH: 'hyper-config:select-path',

  // Themes (unified: WT + Hyper + marketplace)
  THEMES_LIST: 'themes:list',
  THEMES_LIST_BUILTIN: 'themes:list-builtin',
  THEMES_SAVE: 'themes:save',
  THEMES_DELETE: 'themes:delete',
  THEMES_APPLY: 'themes:apply',
  THEMES_EXPORT: 'themes:export',
  THEMES_IMPORT: 'themes:import',
  THEMES_FETCH_WT_THEMES: 'themes:fetch-wt-themes',
  THEMES_FETCH_HYPER_THEMES: 'themes:fetch-hyper-themes',
  THEMES_FETCH_HYPER_PLUGINS: 'themes:fetch-hyper-plugins',

  // Community Theme Sharing (PostgreSQL)
  COMMUNITY_BROWSE: 'community:browse',
  COMMUNITY_UPLOAD: 'community:upload',
  COMMUNITY_DOWNLOAD: 'community:download',
  COMMUNITY_RATE: 'community:rate',
  COMMUNITY_FAVORITE: 'community:favorite',
  COMMUNITY_UNFAVORITE: 'community:unfavorite',
  COMMUNITY_MY_FAVORITES: 'community:my-favorites',
  COMMUNITY_SEARCH: 'community:search',

  // Oh My Posh
  OMP_GET_STATUS: 'omp:get-status',
  OMP_INSTALL: 'omp:install',
  OMP_LIST_THEMES: 'omp:list-themes',
  OMP_APPLY_THEME: 'omp:apply-theme',
  OMP_GET_PREVIEW: 'omp:get-preview',
  OMP_SET_SHELL: 'omp:set-shell',

  // Claude Instances
  CLAUDE_INSTANCES_LIST: 'claude-instances:list',
  CLAUDE_INSTANCES_ADD: 'claude-instances:add',
  CLAUDE_INSTANCES_REMOVE: 'claude-instances:remove',
  CLAUDE_INSTANCES_UPDATE: 'claude-instances:update',
  CLAUDE_INSTANCES_SET_DEFAULT: 'claude-instances:set-default',
  CLAUDE_INSTANCES_DETECT: 'claude-instances:detect',

  // Launch
  LAUNCH_PROJECT: 'launch:project',
  LAUNCH_TERMINAL: 'launch:terminal',
  LAUNCH_COPY_COMMAND: 'launch:copy-command',

  // Settings
  SETTINGS_GET: 'settings:get',
  SETTINGS_SET: 'settings:set',
  SETTINGS_GET_GREETING: 'settings:get-greeting',
  SETTINGS_SELECT_FILE: 'settings:select-file',
  SETTINGS_SELECT_DIR: 'settings:select-dir',

  // App Self-Skinning
  APP_THEME_GET: 'app-theme:get',
  APP_THEME_SET: 'app-theme:set',
  APP_THEME_RESET: 'app-theme:reset',

  // Updates
  UPDATES_CHECK: 'updates:check',
  UPDATES_GET_CHANGELOG: 'updates:get-changelog',

  // MCP
  MCP_LIST: 'mcp:list',
  MCP_ADD: 'mcp:add',
  MCP_REMOVE: 'mcp:remove',
  MCP_UPDATE: 'mcp:update',
  MCP_TOGGLE: 'mcp:toggle',

  // Hyper Plugins (from hyper.is marketplace)
  HYPER_PLUGINS_LIST_INSTALLED: 'hyper-plugins:list-installed',
  HYPER_PLUGINS_BROWSE: 'hyper-plugins:browse',
  HYPER_PLUGINS_INSTALL: 'hyper-plugins:install',
  HYPER_PLUGINS_UNINSTALL: 'hyper-plugins:uninstall',

  // Plugins (Claude)
  PLUGINS_LIST: 'plugins:list',
  PLUGINS_INSTALL: 'plugins:install',
  PLUGINS_UNINSTALL: 'plugins:uninstall',

  // Claude Settings (~/.claude/settings.json)
  CLAUDE_SETTINGS_READ: 'claude-settings:read',
  CLAUDE_SETTINGS_WRITE: 'claude-settings:write',
  CLAUDE_SETTINGS_UPDATE_SUBAGENT_MODEL: 'claude-settings:update-subagent-model',
  CLAUDE_SETTINGS_GET_MODELS: 'claude-settings:get-models',

  // Debug Logging
  LOG_GET_BUFFER: 'log:get-buffer',
  LOG_GET_FILE_PATH: 'log:get-file-path',
  LOG_CLEAR: 'log:clear',

  // DB Config
  DB_TEST_CONNECTION: 'db:test-connection'
} as const

export type IpcChannel = (typeof IPC)[keyof typeof IPC]
