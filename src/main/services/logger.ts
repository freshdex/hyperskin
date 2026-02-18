import { BrowserWindow } from 'electron'
import { writeFile, appendFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { app } from 'electron'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  timestamp: string
  level: LogLevel
  source: string
  message: string
  data?: unknown
}

const logBuffer: LogEntry[] = []
const MAX_BUFFER = 2000
let logFilePath: string | null = null

function getLogFilePath(): string {
  if (!logFilePath) {
    const logDir = join(app.getPath('userData'), 'logs')
    mkdir(logDir, { recursive: true }).catch(() => {})
    const date = new Date().toISOString().split('T')[0]
    logFilePath = join(logDir, `hyperskin-${date}.log`)
  }
  return logFilePath
}

function formatEntry(entry: LogEntry): string {
  const dataStr = entry.data !== undefined ? ` | ${JSON.stringify(entry.data)}` : ''
  return `[${entry.timestamp}] [${entry.level.toUpperCase().padEnd(5)}] [${entry.source}] ${entry.message}${dataStr}`
}

function broadcastToRenderer(entry: LogEntry): void {
  try {
    const windows = BrowserWindow.getAllWindows()
    for (const win of windows) {
      if (!win.isDestroyed()) {
        win.webContents.send('log:entry', entry)
      }
    }
  } catch {
    // Window might not be ready yet
  }
}

async function writeToFile(formatted: string): Promise<void> {
  try {
    await appendFile(getLogFilePath(), formatted + '\n', 'utf-8')
  } catch {
    // Ignore file write errors
  }
}

function log(level: LogLevel, source: string, message: string, data?: unknown): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    source,
    message,
    data
  }

  logBuffer.push(entry)
  if (logBuffer.length > MAX_BUFFER) {
    logBuffer.shift()
  }

  const formatted = formatEntry(entry)

  // Console output
  switch (level) {
    case 'error':
      console.error(formatted)
      break
    case 'warn':
      console.warn(formatted)
      break
    case 'debug':
      console.debug(formatted)
      break
    default:
      console.log(formatted)
  }

  // Write to file
  writeToFile(formatted)

  // Broadcast to renderer for live log viewer
  broadcastToRenderer(entry)
}

export const logger = {
  debug: (source: string, message: string, data?: unknown) => log('debug', source, message, data),
  info: (source: string, message: string, data?: unknown) => log('info', source, message, data),
  warn: (source: string, message: string, data?: unknown) => log('warn', source, message, data),
  error: (source: string, message: string, data?: unknown) => log('error', source, message, data),

  getBuffer: (): LogEntry[] => [...logBuffer],
  getLogFilePath,

  /** Clear the in-memory buffer */
  clear: (): void => {
    logBuffer.length = 0
  }
}

export type { LogEntry }
