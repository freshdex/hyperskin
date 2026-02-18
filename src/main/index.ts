import { app, shell, BrowserWindow, protocol, net } from 'electron'
import { join } from 'path'
import { existsSync } from 'fs'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { registerAllHandlers } from './ipc'

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#0a0a0f',
    titleBarStyle: 'hiddenInset',
    frame: process.platform === 'darwin' ? false : true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// Register custom protocol to serve local project images
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'hyperskin-file',
    privileges: { secure: true, supportFetchAPI: true, stream: true }
  }
])

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.hyperskin.app')

  // Handle hyperskin-file:// protocol for serving project images
  protocol.handle('hyperskin-file', (request) => {
    // URL format: hyperskin-file://project-image?path=C:\path\to\project
    const url = new URL(request.url)
    const projectPath = url.searchParams.get('path')
    if (!projectPath) {
      return new Response('Missing path parameter', { status: 400 })
    }

    const imagePath = join(projectPath, 'hyperskin.png')
    if (!existsSync(imagePath)) {
      return new Response('Image not found', { status: 404 })
    }

    return net.fetch(`file:///${imagePath.replace(/\\/g, '/')}`)
  })

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  registerAllHandlers()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
