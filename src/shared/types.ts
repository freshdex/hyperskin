// ---- Page Navigation ----
export type PageId =
  | 'projects'
  | 'terminal-config'
  | 'hyper-config'
  | 'themes'
  | 'oh-my-posh'
  | 'claude-instances'
  | 'mcp-plugins'
  | 'updates'
  | 'settings'

// ---- Windows Terminal Config (settings.json) ----
export type WtCursorShape = 'bar' | 'emptyBox' | 'filledBox' | 'underscore' | 'vintage'
export type WtFontWeight = 'thin' | 'extra-light' | 'light' | 'semi-light' | 'normal' | 'medium' | 'semi-bold' | 'bold' | 'extra-bold' | 'black' | 'extra-black'
export type WtCopyFormat = 'html' | 'plainText' | 'rtf'
export type WtScrollbarState = 'visible' | 'hidden' | 'always'

export interface WtColorScheme {
  name: string
  background: string
  foreground: string
  cursorColor: string
  selectionBackground: string
  black: string
  red: string
  green: string
  yellow: string
  blue: string
  purple: string
  cyan: string
  white: string
  brightBlack: string
  brightRed: string
  brightGreen: string
  brightYellow: string
  brightBlue: string
  brightPurple: string
  brightCyan: string
  brightWhite: string
}

export interface WtProfile {
  name: string
  guid?: string
  commandline?: string
  startingDirectory?: string
  fontFace?: string
  fontSize?: number
  fontWeight?: WtFontWeight
  cursorShape?: WtCursorShape
  cursorColor?: string
  colorScheme?: string
  background?: string
  foreground?: string
  backgroundImage?: string
  backgroundImageOpacity?: number
  backgroundImageStretchMode?: 'none' | 'fill' | 'uniform' | 'uniformToFill'
  useAcrylic?: boolean
  acrylicOpacity?: number
  opacity?: number
  padding?: string
  scrollbarState?: WtScrollbarState
  hidden?: boolean
  tabTitle?: string
  icon?: string
  bellStyle?: 'none' | 'audible' | 'visual' | 'all'
  closeOnExit?: 'always' | 'graceful' | 'never'
  antialiasingMode?: 'grayscale' | 'cleartype' | 'aliased'
  historySize?: number
}

export interface WtGlobalSettings {
  defaultProfile?: string
  theme?: 'system' | 'dark' | 'light'
  alwaysShowTabs?: boolean
  showTabsInTitlebar?: boolean
  copyOnSelect?: boolean
  copyFormatting?: WtCopyFormat
  wordDelimiters?: string
  confirmCloseAllTabs?: boolean
  startOnUserLogin?: boolean
  initialPosition?: string
  initialCols?: number
  initialRows?: number
  launchMode?: 'default' | 'maximized' | 'fullscreen' | 'focus' | 'minimized'
  snapToGridOnResize?: boolean
  useAcrylicInTabRow?: boolean
  showTerminalTitleInTitlebar?: boolean
  tabWidthMode?: 'equal' | 'titleLength' | 'compact'
  disableAnimations?: boolean
}

export interface WtConfig {
  globals: WtGlobalSettings
  profiles: {
    defaults: Partial<WtProfile>
    list: WtProfile[]
  }
  schemes: WtColorScheme[]
  actions: Array<{ command: string; keys?: string }>
}

// ---- Hyper Config (secondary terminal) ----
export type CursorShape = 'BEAM' | 'UNDERLINE' | 'BLOCK'
export type FontWeight = 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900'
export type BellType = 'SOUND' | false
export type MenuVisibility = true | false | ''
export type MacOptionSelectionMode = 'vertical' | 'force'
export type WebLinksActivationKey = 'ctrl' | 'alt' | 'meta' | 'shift' | ''

export interface HyperConfig {
  config: {
    fontSize: number
    fontFamily: string
    fontWeight: FontWeight
    fontWeightBold: FontWeight
    lineHeight: number
    letterSpacing: number
    cursorColor: string
    cursorAccentColor: string
    cursorShape: CursorShape
    cursorBlink: boolean
    foregroundColor: string
    backgroundColor: string
    selectionColor: string
    borderColor: string
    css: string
    termCSS: string
    workingDirectory: string
    showHamburgerMenu: MenuVisibility
    showWindowControls: MenuVisibility
    padding: string
    colors: {
      black: string
      red: string
      green: string
      yellow: string
      blue: string
      magenta: string
      cyan: string
      white: string
      lightBlack: string
      lightRed: string
      lightGreen: string
      lightYellow: string
      lightBlue: string
      lightMagenta: string
      lightCyan: string
      lightWhite: string
    }
    shell: string
    shellArgs: string[]
    env: Record<string, string>
    bell: BellType
    copyOnSelect: boolean
    defaultSSHApp: boolean
    quickEdit: boolean
    webGLRenderer: boolean
    disableLigatures: boolean
    disableAutoUpdates: boolean
    screenReaderMode: boolean
    preserveCWD: boolean
    macOptionSelectionMode: MacOptionSelectionMode
    webLinksActivationKey: WebLinksActivationKey
  }
  plugins: string[]
  localPlugins: string[]
  keymaps: Record<string, string>
}

// ---- Oh My Posh ----
export interface OhMyPoshTheme {
  name: string
  fileName: string
  description?: string
  preview?: string
  isCustom: boolean
}

export interface OhMyPoshConfig {
  installed: boolean
  executablePath?: string
  activeTheme?: string
  shellIntegration: 'powershell' | 'cmd' | 'bash' | 'zsh' | 'fish' | 'nushell'
}

// ---- Terminal Target ----
export type TerminalTarget = 'windows-terminal' | 'hyper'

// ---- Claude Code Launch Flags ----
export type ClaudeModel = 'opus' | 'sonnet' | 'haiku'
export type PermissionMode = 'plan' | 'ask' | 'allow'
export type OutputFormat = 'text' | 'json' | 'stream-json'

export interface ClaudeLaunchFlags {
  model?: ClaudeModel
  permissionMode?: PermissionMode
  dangerouslySkipPermissions?: boolean
  maxTurns?: number
  maxBudgetUsd?: number
  verbose?: boolean
  mcpConfig?: string
  systemPrompt?: string
  appendSystemPrompt?: string
  addDirs?: string[]
  outputFormat?: OutputFormat
  agent?: string
  chrome?: boolean
  continueSession?: boolean
  resumeSession?: string
  customFlags?: Array<{ key: string; value: string }>
}

// ---- Projects ----
export interface Project {
  id: string
  name: string
  path: string
  gitBranch?: string
  gitRemote?: string
  lastOpened?: string
  terminalTarget: TerminalTarget
  claudeFlags: ClaudeLaunchFlags
  claudeInstanceId?: string
  wtProfileGuid?: string
  hyperConfigOverrides?: Partial<HyperConfig['config']>
}

// ---- Claude Instances ----
export type InstanceStatus = 'active' | 'rate-limited' | 'unknown'

export interface ClaudeInstance {
  id: string
  label: string
  executablePath: string
  version?: string
  isDefault: boolean
  status: InstanceStatus
}

// ---- Theme Presets (unified: works for WT color schemes + Hyper) ----
export interface ThemePreset {
  id: string
  name: string
  description: string
  builtin: boolean
  source: 'builtin' | 'user' | 'windowsterminalthemes' | 'hyper-official' | 'community'
  wtScheme?: WtColorScheme
  hyperConfig?: Partial<HyperConfig['config']>
  createdAt: string
  updatedAt: string
}

// ---- Community Themes ----
export interface CommunityTheme {
  id: string
  name: string
  description: string
  authorName: string
  wtScheme?: WtColorScheme
  hyperConfig?: Partial<HyperConfig['config']>
  rating: number
  ratingCount: number
  favoriteCount: number
  downloads: number
  createdAt: string
  updatedAt: string
}

export interface CommunityUser {
  id: string
  anonymousId: string
  displayName: string
}

// ---- Hyper Marketplace ----
export interface HyperPlugin {
  name: string
  description: string
  version: string
  homepage?: string
  installed: boolean
  preview?: string
  type: 'plugin' | 'theme'
}

// ---- MCP / Plugins ----
export interface McpServer {
  name: string
  command: string
  args: string[]
  env?: Record<string, string>
  enabled: boolean
}

export interface Plugin {
  name: string
  description: string
  installed: boolean
  version?: string
  source: 'marketplace' | 'local'
}

// ---- Updates ----
export interface UpdateInfo {
  currentVersion: string
  latestVersion: string
  hasUpdate: boolean
  releaseNotes?: string
  releaseUrl?: string
  publishedAt?: string
}

// ---- App Self-Skinning ----
export interface AppTheme {
  accentColor: string
  accentColorSecondary: string
  backgroundColor: string
  backgroundColorLight: string
  cardColor: string
  borderColor: string
  fontMono: string
  fontSans: string
  glowEnabled: boolean
  scanlinesEnabled: boolean
}

// ---- Settings ----
export interface AppSettings {
  userName: string
  greetingEnabled: boolean
  hyperConfigPath: string
  wtSettingsPath: string
  defaultTerminal: TerminalTarget
  defaultClaudeInstanceId?: string
  persistentHistory: boolean
  historySize: number
  dbHost: string
  dbPort: number
  dbName: string
  dbUser: string
  dbPassword: string
  dbEnabled: boolean
  scanDirectories: string[]
  appTheme: AppTheme
}

// ---- Greeting ----
export type TimeOfDay = 'Morning' | 'Afternoon' | 'Evening'

export interface Greeting {
  message: string
  timeOfDay: TimeOfDay
}

// ---- IPC Result Wrapper ----
export interface IpcResult<T> {
  success: boolean
  data?: T
  error?: string
}
