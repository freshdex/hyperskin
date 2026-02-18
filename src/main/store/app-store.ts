import Store from 'electron-store'
import { DEFAULT_APP_SETTINGS } from '@shared/defaults'
import type { AppSettings, Project, ClaudeInstance, ThemePreset } from '@shared/types'

export interface StoreSchema {
  settings: AppSettings
  projects: Project[]
  claudeInstances: ClaudeInstance[]
  themePresets: ThemePreset[]
}

const schema: Store.Schema<StoreSchema> = {
  settings: {
    type: 'object' as const,
    properties: {
      userName: { type: 'string' },
      greetingEnabled: { type: 'boolean' },
      hyperConfigPath: { type: 'string' },
      wtSettingsPath: { type: 'string' },
      defaultTerminal: { type: 'string' },
      defaultClaudeInstanceId: { type: 'string' },
      persistentHistory: { type: 'boolean' },
      historySize: { type: 'number' },
      dbHost: { type: 'string' },
      dbPort: { type: 'number' },
      dbName: { type: 'string' },
      dbUser: { type: 'string' },
      dbPassword: { type: 'string' },
      dbEnabled: { type: 'boolean' },
      scanDirectories: {
        type: 'array',
        items: { type: 'string' }
      },
      appTheme: {
        type: 'object',
        properties: {
          accentColor: { type: 'string' },
          accentColorSecondary: { type: 'string' },
          backgroundColor: { type: 'string' },
          backgroundColorLight: { type: 'string' },
          cardColor: { type: 'string' },
          borderColor: { type: 'string' },
          fontMono: { type: 'string' },
          fontSans: { type: 'string' },
          glowEnabled: { type: 'boolean' },
          scanlinesEnabled: { type: 'boolean' }
        }
      }
    },
    default: DEFAULT_APP_SETTINGS
  },
  projects: {
    type: 'array' as const,
    items: { type: 'object' },
    default: []
  },
  claudeInstances: {
    type: 'array' as const,
    items: { type: 'object' },
    default: []
  },
  themePresets: {
    type: 'array' as const,
    items: { type: 'object' },
    default: []
  }
}

export const appStore = new Store<StoreSchema>({
  name: 'hyperskin-config',
  schema,
  defaults: {
    settings: DEFAULT_APP_SETTINGS,
    projects: [],
    claudeInstances: [],
    themePresets: []
  }
})
