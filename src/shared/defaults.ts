import type {
  HyperConfig, AppSettings, ClaudeLaunchFlags, ClaudeModel,
  PermissionMode, OutputFormat, WtColorScheme, WtProfile, AppTheme
} from './types'

export const GREETING_TEMPLATES = [
  'Good {time} {name} - What are we going to build today?',
  'Good {time} {name} - Ready to ship something amazing?',
  "Good {time} {name} - Let's turn coffee into code!",
  'Good {time} {name} - The terminal awaits your command.',
  'Good {time} {name} - Time to make something extraordinary.',
  'Good {time} {name} - Your projects missed you!',
  'Good {time} {name} - Another day, another feature.',
  "Good {time} {name} - Let's push some boundaries.",
  'Good {time} {name} - The code won\'t write itself... or will it?',
  'Good {time} {name} - Shall we refactor the world today?'
]

export const DEFAULT_APP_THEME: AppTheme = {
  accentColor: '#00ff88',
  accentColorSecondary: '#00d4ff',
  backgroundColor: '#0a0a0f',
  backgroundColorLight: '#111118',
  cardColor: '#16161e',
  borderColor: '#1e1e2e',
  fontMono: 'JetBrains Mono',
  fontSans: 'Inter',
  glowEnabled: true,
  scanlinesEnabled: true
}

export const DEFAULT_WT_COLOR_SCHEME: WtColorScheme = {
  name: 'HyperSkin Default',
  background: '#0C0C0C',
  foreground: '#CCCCCC',
  cursorColor: '#FFFFFF',
  selectionBackground: '#FFFFFF',
  black: '#0C0C0C',
  red: '#C50F1F',
  green: '#13A10E',
  yellow: '#C19C00',
  blue: '#0037DA',
  purple: '#881798',
  cyan: '#3A96DD',
  white: '#CCCCCC',
  brightBlack: '#767676',
  brightRed: '#E74856',
  brightGreen: '#16C60C',
  brightYellow: '#F9F1A5',
  brightBlue: '#3B78FF',
  brightPurple: '#B4009E',
  brightCyan: '#61D6D6',
  brightWhite: '#F2F2F2'
}

export const DEFAULT_WT_PROFILE: Partial<WtProfile> = {
  fontFace: 'Cascadia Code',
  fontSize: 12,
  fontWeight: 'normal',
  cursorShape: 'bar',
  useAcrylic: false,
  acrylicOpacity: 0.5,
  opacity: 100,
  padding: '8, 8, 8, 8',
  scrollbarState: 'visible',
  bellStyle: 'none',
  closeOnExit: 'graceful',
  antialiasingMode: 'grayscale',
  historySize: 9001
}

export const DEFAULT_HYPER_CONFIG: HyperConfig = {
  config: {
    fontSize: 14,
    fontFamily: '"JetBrains Mono", Menlo, "DejaVu Sans Mono", Consolas, "Lucida Console", monospace',
    fontWeight: 'normal',
    fontWeightBold: 'bold',
    lineHeight: 1.2,
    letterSpacing: 0,
    cursorColor: 'rgba(248,28,229,0.8)',
    cursorAccentColor: '#000',
    cursorShape: 'BLOCK',
    cursorBlink: false,
    foregroundColor: '#fff',
    backgroundColor: '#000',
    selectionColor: 'rgba(248,28,229,0.3)',
    borderColor: '#333',
    css: '',
    termCSS: '',
    workingDirectory: '',
    showHamburgerMenu: '',
    showWindowControls: '',
    padding: '12px 14px',
    colors: {
      black: '#000000',
      red: '#C51E14',
      green: '#1DC121',
      yellow: '#C7C329',
      blue: '#0A2FC4',
      magenta: '#C839C5',
      cyan: '#20C5C6',
      white: '#C7C7C7',
      lightBlack: '#686868',
      lightRed: '#FD6F6B',
      lightGreen: '#67F86F',
      lightYellow: '#FFFA72',
      lightBlue: '#6A76FB',
      lightMagenta: '#FD7CFC',
      lightCyan: '#68FDFE',
      lightWhite: '#FFFFFF'
    },
    shell: '',
    shellArgs: [],
    env: {},
    bell: 'SOUND',
    copyOnSelect: false,
    defaultSSHApp: true,
    quickEdit: false,
    webGLRenderer: true,
    disableLigatures: false,
    disableAutoUpdates: false,
    screenReaderMode: false,
    preserveCWD: true,
    macOptionSelectionMode: 'vertical',
    webLinksActivationKey: ''
  },
  plugins: [],
  localPlugins: [],
  keymaps: {}
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  userName: 'Developer',
  greetingEnabled: true,
  hyperConfigPath: '',
  wtSettingsPath: '',
  defaultTerminal: 'windows-terminal',
  persistentHistory: false,
  historySize: 9001,
  dbHost: 'localhost',
  dbPort: 5432,
  dbName: 'hyperskin',
  dbUser: 'hyperskin',
  dbPassword: '',
  dbEnabled: false,
  scanDirectories: [],
  appTheme: DEFAULT_APP_THEME
}

export const DEFAULT_LAUNCH_FLAGS: ClaudeLaunchFlags = {
  model: undefined,
  permissionMode: undefined,
  dangerouslySkipPermissions: false,
  maxTurns: undefined,
  maxBudgetUsd: undefined,
  verbose: false,
  mcpConfig: undefined,
  systemPrompt: undefined,
  appendSystemPrompt: undefined,
  addDirs: [],
  outputFormat: undefined,
  agent: undefined,
  chrome: false,
  continueSession: false,
  resumeSession: undefined,
  customFlags: []
}

export const CLAUDE_MODELS: { value: ClaudeModel; label: string }[] = [
  { value: 'opus', label: 'Claude Opus' },
  { value: 'sonnet', label: 'Claude Sonnet' },
  { value: 'haiku', label: 'Claude Haiku' }
]

export const PERMISSION_MODES: { value: PermissionMode; label: string }[] = [
  { value: 'plan', label: 'Plan Mode' },
  { value: 'ask', label: 'Ask Mode' },
  { value: 'allow', label: 'Allow Mode' }
]

export const OUTPUT_FORMATS: { value: OutputFormat; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'json', label: 'JSON' },
  { value: 'stream-json', label: 'Stream JSON' }
]

export const CURSOR_SHAPES_WT = ['bar', 'emptyBox', 'filledBox', 'underscore', 'vintage'] as const
export const CURSOR_SHAPES_HYPER = ['BEAM', 'UNDERLINE', 'BLOCK'] as const
export const FONT_WEIGHTS = ['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900'] as const
export const WT_FONT_WEIGHTS = ['thin', 'extra-light', 'light', 'semi-light', 'normal', 'medium', 'semi-bold', 'bold', 'extra-bold', 'black', 'extra-black'] as const
export const BELL_TYPES = [{ value: 'SOUND', label: 'Sound' }, { value: 'false', label: 'Off' }] as const
export const WEB_LINKS_KEYS = ['', 'ctrl', 'alt', 'meta', 'shift'] as const

export const ANSI_COLOR_NAMES_WT = [
  'black', 'red', 'green', 'yellow', 'blue', 'purple', 'cyan', 'white',
  'brightBlack', 'brightRed', 'brightGreen', 'brightYellow', 'brightBlue', 'brightPurple', 'brightCyan', 'brightWhite'
] as const

export const ANSI_COLOR_NAMES_HYPER = [
  'black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white',
  'lightBlack', 'lightRed', 'lightGreen', 'lightYellow', 'lightBlue', 'lightMagenta', 'lightCyan', 'lightWhite'
] as const

export const OMP_SHELL_OPTIONS = ['powershell', 'cmd', 'bash', 'zsh', 'fish', 'nushell'] as const

export const LAUNCH_REMINDER = 'Tip: Press Alt+Return for a line break in the terminal'
