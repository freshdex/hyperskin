import type { ElectronAPI } from '@electron-toolkit/preload'
import type {
  Project,
  HyperConfig,
  WtConfig,
  WtColorScheme,
  WtProfile,
  ThemePreset,
  CommunityTheme,
  ClaudeInstance,
  McpServer,
  Plugin,
  HyperPlugin,
  OhMyPoshConfig,
  OhMyPoshTheme,
  AppSettings,
  AppTheme,
  Greeting,
  UpdateInfo,
  IpcResult
} from '@shared/types'

interface ProjectsApi {
  list(): Promise<IpcResult<Project[]>>
  add(project: Omit<Project, 'id'>): Promise<IpcResult<Project>>
  remove(id: string): Promise<IpcResult<void>>
  update(id: string, data: Partial<Project>): Promise<IpcResult<Project>>
  scan(directories: string[]): Promise<IpcResult<Project[]>>
  selectDir(): Promise<IpcResult<string>>
  hasImage(projectPath: string): Promise<IpcResult<boolean>>
}

interface WtConfigApi {
  read(): Promise<IpcResult<WtConfig>>
  write(config: WtConfig): Promise<IpcResult<void>>
  getPath(): Promise<IpcResult<string>>
  selectPath(): Promise<IpcResult<string>>
  profilesList(): Promise<IpcResult<WtProfile[]>>
  schemesList(): Promise<IpcResult<WtColorScheme[]>>
  schemeAdd(scheme: WtColorScheme): Promise<IpcResult<void>>
  schemeRemove(name: string): Promise<IpcResult<void>>
  setPersistentHistory(enabled: boolean, size: number): Promise<IpcResult<void>>
}

interface HyperConfigApi {
  read(configPath?: string): Promise<IpcResult<HyperConfig>>
  write(config: HyperConfig, configPath?: string): Promise<IpcResult<void>>
  getPath(): Promise<IpcResult<string>>
  selectPath(): Promise<IpcResult<string>>
}

interface ThemesApi {
  list(): Promise<IpcResult<ThemePreset[]>>
  listBuiltin(): Promise<IpcResult<ThemePreset[]>>
  save(theme: unknown): Promise<IpcResult<ThemePreset>>
  delete(id: string): Promise<IpcResult<void>>
  apply(id: string, target: string): Promise<IpcResult<void>>
  exportTheme(id: string): Promise<IpcResult<string>>
  importTheme(): Promise<IpcResult<ThemePreset>>
  fetchWtThemes(): Promise<IpcResult<ThemePreset[]>>
  fetchHyperThemes(): Promise<IpcResult<HyperPlugin[]>>
  fetchHyperPlugins(): Promise<IpcResult<HyperPlugin[]>>
}

interface CommunityApi {
  browse(page?: number, sortBy?: string): Promise<IpcResult<CommunityTheme[]>>
  upload(theme: unknown): Promise<IpcResult<CommunityTheme>>
  download(id: string): Promise<IpcResult<ThemePreset>>
  rate(id: string, rating: number): Promise<IpcResult<void>>
  favorite(id: string): Promise<IpcResult<void>>
  unfavorite(id: string): Promise<IpcResult<void>>
  myFavorites(): Promise<IpcResult<CommunityTheme[]>>
  search(query: string, page?: number): Promise<IpcResult<CommunityTheme[]>>
}

interface OmpApi {
  getStatus(): Promise<IpcResult<OhMyPoshConfig>>
  install(): Promise<IpcResult<void>>
  listThemes(): Promise<IpcResult<OhMyPoshTheme[]>>
  applyTheme(theme: string): Promise<IpcResult<void>>
  getPreview(theme: string): Promise<IpcResult<string>>
  setShell(shell: string): Promise<IpcResult<void>>
}

interface ClaudeInstancesApi {
  list(): Promise<IpcResult<ClaudeInstance[]>>
  add(instance: Omit<ClaudeInstance, 'id' | 'status'>): Promise<IpcResult<ClaudeInstance>>
  remove(id: string): Promise<IpcResult<void>>
  update(id: string, data: Partial<ClaudeInstance>): Promise<IpcResult<ClaudeInstance>>
  setDefault(id: string): Promise<IpcResult<void>>
  detect(): Promise<IpcResult<ClaudeInstance[]>>
}

interface LaunchApi {
  project(projectId: string): Promise<IpcResult<void>>
  terminal(opts?: unknown): Promise<IpcResult<void>>
  copyCommand(projectId: string): Promise<IpcResult<string>>
}

interface SettingsApi {
  get(): Promise<IpcResult<AppSettings>>
  set(settings: Partial<AppSettings>): Promise<IpcResult<void>>
  getGreeting(): Promise<IpcResult<Greeting>>
  selectFile(filters?: unknown): Promise<IpcResult<string>>
  selectDir(): Promise<IpcResult<string>>
}

interface AppThemeApi {
  get(): Promise<IpcResult<AppTheme>>
  set(theme: Partial<AppTheme>): Promise<IpcResult<void>>
  reset(): Promise<IpcResult<void>>
}

interface UpdatesApi {
  check(): Promise<IpcResult<UpdateInfo>>
  getChangelog(): Promise<IpcResult<string>>
}

interface McpApi {
  list(): Promise<IpcResult<McpServer[]>>
  add(server: unknown): Promise<IpcResult<McpServer>>
  remove(name: string): Promise<IpcResult<void>>
  update(name: string, data: unknown): Promise<IpcResult<McpServer>>
  toggle(name: string, enabled: boolean): Promise<IpcResult<void>>
}

interface HyperPluginsApi {
  listInstalled(): Promise<IpcResult<HyperPlugin[]>>
  browse(type: string): Promise<IpcResult<HyperPlugin[]>>
  install(name: string): Promise<IpcResult<void>>
  uninstall(name: string): Promise<IpcResult<void>>
}

interface PluginsApi {
  list(): Promise<IpcResult<Plugin[]>>
  install(name: string): Promise<IpcResult<Plugin>>
  uninstall(name: string): Promise<IpcResult<void>>
}

interface ClaudeSettingsApi {
  read(): Promise<IpcResult<Record<string, unknown>>>
  write(settings: Record<string, unknown>): Promise<IpcResult<void>>
  updateSubagentModel(model: string): Promise<IpcResult<void>>
  getModels(): Promise<IpcResult<string[]>>
}

interface LogApi {
  getBuffer(): Promise<IpcResult<unknown[]>>
  getFilePath(): Promise<IpcResult<string>>
  clear(): Promise<IpcResult<void>>
  onEntry(callback: (entry: unknown) => void): () => void
}

interface DbApi {
  testConnection(config: unknown): Promise<IpcResult<void>>
}

interface Api {
  projects: ProjectsApi
  wtConfig: WtConfigApi
  hyperConfig: HyperConfigApi
  themes: ThemesApi
  community: CommunityApi
  omp: OmpApi
  claudeInstances: ClaudeInstancesApi
  launch: LaunchApi
  settings: SettingsApi
  appTheme: AppThemeApi
  updates: UpdatesApi
  mcp: McpApi
  hyperPlugins: HyperPluginsApi
  plugins: PluginsApi
  claudeSettings: ClaudeSettingsApi
  db: DbApi
  log: LogApi
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: Api
  }
}
