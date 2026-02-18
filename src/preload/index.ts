import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { IPC } from '@shared/ipc-channels'

const api = {
  // ---- Projects ----
  projects: {
    list: () => ipcRenderer.invoke(IPC.PROJECTS_LIST),
    add: (project: unknown) => ipcRenderer.invoke(IPC.PROJECTS_ADD, project),
    remove: (id: string) => ipcRenderer.invoke(IPC.PROJECTS_REMOVE, id),
    update: (id: string, data: unknown) => ipcRenderer.invoke(IPC.PROJECTS_UPDATE, id, data),
    scan: (directories: string[]) => ipcRenderer.invoke(IPC.PROJECTS_SCAN, directories),
    selectDir: () => ipcRenderer.invoke(IPC.PROJECTS_SELECT_DIR),
    hasImage: (projectPath: string) => ipcRenderer.invoke(IPC.PROJECTS_HAS_IMAGE, projectPath)
  },

  // ---- Windows Terminal Config ----
  wtConfig: {
    read: () => ipcRenderer.invoke(IPC.WT_CONFIG_READ),
    write: (config: unknown) => ipcRenderer.invoke(IPC.WT_CONFIG_WRITE, config),
    getPath: () => ipcRenderer.invoke(IPC.WT_CONFIG_GET_PATH),
    selectPath: () => ipcRenderer.invoke(IPC.WT_CONFIG_SELECT_PATH),
    profilesList: () => ipcRenderer.invoke(IPC.WT_PROFILES_LIST),
    schemesList: () => ipcRenderer.invoke(IPC.WT_SCHEMES_LIST),
    schemeAdd: (scheme: unknown) => ipcRenderer.invoke(IPC.WT_SCHEME_ADD, scheme),
    schemeRemove: (name: string) => ipcRenderer.invoke(IPC.WT_SCHEME_REMOVE, name),
    setPersistentHistory: (enabled: boolean, size: number) =>
      ipcRenderer.invoke(IPC.WT_SET_PERSISTENT_HISTORY, enabled, size)
  },

  // ---- Hyper Config (secondary) ----
  hyperConfig: {
    read: (configPath?: string) => ipcRenderer.invoke(IPC.HYPER_CONFIG_READ, configPath),
    write: (config: unknown, configPath?: string) =>
      ipcRenderer.invoke(IPC.HYPER_CONFIG_WRITE, config, configPath),
    getPath: () => ipcRenderer.invoke(IPC.HYPER_CONFIG_GET_PATH),
    selectPath: () => ipcRenderer.invoke(IPC.HYPER_CONFIG_SELECT_PATH)
  },

  // ---- Themes ----
  themes: {
    list: () => ipcRenderer.invoke(IPC.THEMES_LIST),
    listBuiltin: () => ipcRenderer.invoke(IPC.THEMES_LIST_BUILTIN),
    save: (theme: unknown) => ipcRenderer.invoke(IPC.THEMES_SAVE, theme),
    delete: (id: string) => ipcRenderer.invoke(IPC.THEMES_DELETE, id),
    apply: (id: string, target: string) => ipcRenderer.invoke(IPC.THEMES_APPLY, id, target),
    exportTheme: (id: string) => ipcRenderer.invoke(IPC.THEMES_EXPORT, id),
    importTheme: () => ipcRenderer.invoke(IPC.THEMES_IMPORT),
    fetchWtThemes: () => ipcRenderer.invoke(IPC.THEMES_FETCH_WT_THEMES),
    fetchHyperThemes: () => ipcRenderer.invoke(IPC.THEMES_FETCH_HYPER_THEMES),
    fetchHyperPlugins: () => ipcRenderer.invoke(IPC.THEMES_FETCH_HYPER_PLUGINS)
  },

  // ---- Community Theme Sharing ----
  community: {
    browse: (page?: number, sortBy?: string) =>
      ipcRenderer.invoke(IPC.COMMUNITY_BROWSE, page, sortBy),
    upload: (theme: unknown) => ipcRenderer.invoke(IPC.COMMUNITY_UPLOAD, theme),
    download: (id: string) => ipcRenderer.invoke(IPC.COMMUNITY_DOWNLOAD, id),
    rate: (id: string, rating: number) => ipcRenderer.invoke(IPC.COMMUNITY_RATE, id, rating),
    favorite: (id: string) => ipcRenderer.invoke(IPC.COMMUNITY_FAVORITE, id),
    unfavorite: (id: string) => ipcRenderer.invoke(IPC.COMMUNITY_UNFAVORITE, id),
    myFavorites: () => ipcRenderer.invoke(IPC.COMMUNITY_MY_FAVORITES),
    search: (query: string, page?: number) =>
      ipcRenderer.invoke(IPC.COMMUNITY_SEARCH, query, page)
  },

  // ---- Oh My Posh ----
  omp: {
    getStatus: () => ipcRenderer.invoke(IPC.OMP_GET_STATUS),
    install: () => ipcRenderer.invoke(IPC.OMP_INSTALL),
    listThemes: () => ipcRenderer.invoke(IPC.OMP_LIST_THEMES),
    applyTheme: (theme: string) => ipcRenderer.invoke(IPC.OMP_APPLY_THEME, theme),
    getPreview: (theme: string) => ipcRenderer.invoke(IPC.OMP_GET_PREVIEW, theme),
    setShell: (shell: string) => ipcRenderer.invoke(IPC.OMP_SET_SHELL, shell)
  },

  // ---- Claude Instances ----
  claudeInstances: {
    list: () => ipcRenderer.invoke(IPC.CLAUDE_INSTANCES_LIST),
    add: (instance: unknown) => ipcRenderer.invoke(IPC.CLAUDE_INSTANCES_ADD, instance),
    remove: (id: string) => ipcRenderer.invoke(IPC.CLAUDE_INSTANCES_REMOVE, id),
    update: (id: string, data: unknown) =>
      ipcRenderer.invoke(IPC.CLAUDE_INSTANCES_UPDATE, id, data),
    setDefault: (id: string) => ipcRenderer.invoke(IPC.CLAUDE_INSTANCES_SET_DEFAULT, id),
    detect: () => ipcRenderer.invoke(IPC.CLAUDE_INSTANCES_DETECT)
  },

  // ---- Launch ----
  launch: {
    project: (projectId: string) => ipcRenderer.invoke(IPC.LAUNCH_PROJECT, projectId),
    terminal: (opts?: unknown) => ipcRenderer.invoke(IPC.LAUNCH_TERMINAL, opts),
    copyCommand: (projectId: string) => ipcRenderer.invoke(IPC.LAUNCH_COPY_COMMAND, projectId)
  },

  // ---- Settings ----
  settings: {
    get: () => ipcRenderer.invoke(IPC.SETTINGS_GET),
    set: (settings: unknown) => ipcRenderer.invoke(IPC.SETTINGS_SET, settings),
    getGreeting: () => ipcRenderer.invoke(IPC.SETTINGS_GET_GREETING),
    selectFile: (filters?: unknown) => ipcRenderer.invoke(IPC.SETTINGS_SELECT_FILE, filters),
    selectDir: () => ipcRenderer.invoke(IPC.SETTINGS_SELECT_DIR)
  },

  // ---- App Self-Skinning ----
  appTheme: {
    get: () => ipcRenderer.invoke(IPC.APP_THEME_GET),
    set: (theme: unknown) => ipcRenderer.invoke(IPC.APP_THEME_SET, theme),
    reset: () => ipcRenderer.invoke(IPC.APP_THEME_RESET)
  },

  // ---- Updates ----
  updates: {
    check: () => ipcRenderer.invoke(IPC.UPDATES_CHECK),
    getChangelog: () => ipcRenderer.invoke(IPC.UPDATES_GET_CHANGELOG)
  },

  // ---- MCP ----
  mcp: {
    list: () => ipcRenderer.invoke(IPC.MCP_LIST),
    add: (server: unknown) => ipcRenderer.invoke(IPC.MCP_ADD, server),
    remove: (name: string) => ipcRenderer.invoke(IPC.MCP_REMOVE, name),
    update: (name: string, data: unknown) => ipcRenderer.invoke(IPC.MCP_UPDATE, name, data),
    toggle: (name: string, enabled: boolean) =>
      ipcRenderer.invoke(IPC.MCP_TOGGLE, name, enabled)
  },

  // ---- Hyper Plugins (from hyper.is marketplace) ----
  hyperPlugins: {
    listInstalled: () => ipcRenderer.invoke(IPC.HYPER_PLUGINS_LIST_INSTALLED),
    browse: (type: string) => ipcRenderer.invoke(IPC.HYPER_PLUGINS_BROWSE, type),
    install: (name: string) => ipcRenderer.invoke(IPC.HYPER_PLUGINS_INSTALL, name),
    uninstall: (name: string) => ipcRenderer.invoke(IPC.HYPER_PLUGINS_UNINSTALL, name)
  },

  // ---- Plugins (Claude) ----
  plugins: {
    list: () => ipcRenderer.invoke(IPC.PLUGINS_LIST),
    install: (name: string) => ipcRenderer.invoke(IPC.PLUGINS_INSTALL, name),
    uninstall: (name: string) => ipcRenderer.invoke(IPC.PLUGINS_UNINSTALL, name)
  },

  // ---- Claude Settings (~/.claude/settings.json) ----
  claudeSettings: {
    read: () => ipcRenderer.invoke(IPC.CLAUDE_SETTINGS_READ),
    write: (settings: unknown) => ipcRenderer.invoke(IPC.CLAUDE_SETTINGS_WRITE, settings),
    updateSubagentModel: (model: string) =>
      ipcRenderer.invoke(IPC.CLAUDE_SETTINGS_UPDATE_SUBAGENT_MODEL, model),
    getModels: () => ipcRenderer.invoke(IPC.CLAUDE_SETTINGS_GET_MODELS)
  },

  // ---- Debug Logging ----
  log: {
    getBuffer: () => ipcRenderer.invoke(IPC.LOG_GET_BUFFER),
    getFilePath: () => ipcRenderer.invoke(IPC.LOG_GET_FILE_PATH),
    clear: () => ipcRenderer.invoke(IPC.LOG_CLEAR),
    onEntry: (callback: (entry: unknown) => void) => {
      ipcRenderer.on('log:entry', (_event, entry) => callback(entry))
      return () => { ipcRenderer.removeAllListeners('log:entry') }
    }
  },

  // ---- DB ----
  db: {
    testConnection: (config: unknown) => ipcRenderer.invoke(IPC.DB_TEST_CONNECTION, config)
  }
}

export type ExposedApi = typeof api

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error('Failed to expose API via contextBridge:', error)
  }
} else {
  // @ts-ignore
  window.electron = electronAPI
  // @ts-ignore
  window.api = api
}
