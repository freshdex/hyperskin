import { ipcMain } from 'electron'
import { IPC } from '@shared/ipc-channels'
import type { IpcResult, CommunityTheme, ThemePreset } from '@shared/types'
import {
  browseThemes,
  uploadTheme,
  downloadTheme,
  rateTheme,
  favoriteTheme,
  unfavoriteTheme,
  getMyFavorites,
  searchThemes
} from '../services/theme-sharing-service'

export function registerThemeSharingHandlers(): void {
  ipcMain.handle(
    IPC.COMMUNITY_BROWSE,
    async (_event, page: number, sortBy?: string): Promise<IpcResult<CommunityTheme[]>> => {
      try {
        const themes = await browseThemes(page, sortBy)
        return { success: true, data: themes }
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to browse community themes' }
      }
    }
  )

  ipcMain.handle(
    IPC.COMMUNITY_UPLOAD,
    async (_event, theme: CommunityTheme): Promise<IpcResult<CommunityTheme>> => {
      try {
        const uploaded = await uploadTheme(theme)
        return { success: true, data: uploaded }
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to upload theme' }
      }
    }
  )

  ipcMain.handle(
    IPC.COMMUNITY_DOWNLOAD,
    async (_event, themeId: string): Promise<IpcResult<ThemePreset>> => {
      try {
        const theme = await downloadTheme(themeId)
        return { success: true, data: theme }
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to download theme' }
      }
    }
  )

  ipcMain.handle(
    IPC.COMMUNITY_RATE,
    async (_event, themeId: string, rating: number): Promise<IpcResult<void>> => {
      try {
        await rateTheme(themeId, rating)
        return { success: true }
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to rate theme' }
      }
    }
  )

  ipcMain.handle(IPC.COMMUNITY_FAVORITE, async (_event, themeId: string): Promise<IpcResult<void>> => {
    try {
      await favoriteTheme(themeId)
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to favorite theme' }
    }
  })

  ipcMain.handle(IPC.COMMUNITY_UNFAVORITE, async (_event, themeId: string): Promise<IpcResult<void>> => {
    try {
      await unfavoriteTheme(themeId)
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to unfavorite theme' }
    }
  })

  ipcMain.handle(IPC.COMMUNITY_MY_FAVORITES, async (): Promise<IpcResult<CommunityTheme[]>> => {
    try {
      const favorites = await getMyFavorites()
      return { success: true, data: favorites }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to get favorites' }
    }
  })

  ipcMain.handle(
    IPC.COMMUNITY_SEARCH,
    async (_event, query: string): Promise<IpcResult<CommunityTheme[]>> => {
      try {
        const results = await searchThemes(query)
        return { success: true, data: results }
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to search themes' }
      }
    }
  )
}
