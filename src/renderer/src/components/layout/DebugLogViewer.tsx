import { useState, useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Trash2, FileText, Copy, ChevronDown } from 'lucide-react'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  timestamp: string
  level: LogLevel
  source: string
  message: string
}

interface DebugLogViewerProps {
  open: boolean
  onToggle: () => void
}

const LEVEL_STYLES: Record<LogLevel, string> = {
  debug: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
  info: 'bg-neon-cyan/15 text-neon-cyan border-neon-cyan/30',
  warn: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  error: 'bg-red-500/15 text-red-400 border-red-500/30'
}

function formatTimestamp(ts: string): string {
  try {
    const d = new Date(ts)
    return d.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  } catch {
    return ts
  }
}

export function DebugLogViewer({ open, onToggle }: DebugLogViewerProps): JSX.Element {
  const [entries, setEntries] = useState<LogEntry[]>([])
  const [activeFilters, setActiveFilters] = useState<Set<LogLevel>>(
    new Set(['debug', 'info', 'warn', 'error'])
  )
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new entries arrive
  useEffect(() => {
    if (open && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [entries, open])

  // Load existing buffer on mount
  useEffect(() => {
    window.api.log.getBuffer().then((result) => {
      if (result.success && result.data) {
        setEntries(result.data as LogEntry[])
      }
    })
  }, [])

  // Listen for new log entries
  useEffect(() => {
    const unsubscribe = window.api.log.onEntry((entry: unknown) => {
      setEntries((prev) => [...prev, entry as LogEntry])
    })
    return unsubscribe
  }, [])

  const handleClear = useCallback((): void => {
    setEntries([])
    window.api.log.clear()
  }, [])

  const handleOpenLogFile = useCallback(async (): Promise<void> => {
    const result = await window.api.log.getFilePath()
    if (result.success && result.data) {
      // Open the file path using the shell
      window.electron.process.env
    }
  }, [])

  const handleCopyAll = useCallback((): void => {
    const text = entries
      .map(
        (e) =>
          `[${formatTimestamp(e.timestamp)}] [${e.level.toUpperCase()}] [${e.source}] ${e.message}`
      )
      .join('\n')
    navigator.clipboard.writeText(text)
  }, [entries])

  const toggleFilter = useCallback((level: LogLevel): void => {
    setActiveFilters((prev) => {
      const next = new Set(prev)
      if (next.has(level)) {
        next.delete(level)
      } else {
        next.add(level)
      }
      return next
    })
  }, [])

  const filteredEntries = entries.filter((e) => activeFilters.has(e.level))

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40 border-t border-terminal-border bg-terminal-bg transition-all duration-300',
        open ? 'h-72' : 'h-0'
      )}
    >
      {open && (
        <div className="flex h-full flex-col">
          {/* Toolbar */}
          <div className="flex shrink-0 items-center justify-between border-b border-terminal-border px-4 py-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-muted-foreground">
                Debug Log
              </span>
              <span className="font-mono text-xs text-muted-foreground/60">
                ({filteredEntries.length} entries)
              </span>

              {/* Level filters */}
              <div className="ml-2 flex items-center gap-1">
                {(['debug', 'info', 'warn', 'error'] as LogLevel[]).map((level) => (
                  <button
                    key={level}
                    className={cn(
                      'rounded px-2 py-0.5 font-mono text-[10px] uppercase transition-all',
                      activeFilters.has(level)
                        ? LEVEL_STYLES[level]
                        : 'text-muted-foreground/40 opacity-50'
                    )}
                    onClick={() => toggleFilter(level)}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 gap-1.5 px-2 font-mono text-xs text-muted-foreground"
                onClick={handleCopyAll}
              >
                <Copy className="h-3 w-3" />
                Copy All
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 gap-1.5 px-2 font-mono text-xs text-muted-foreground"
                onClick={handleOpenLogFile}
              >
                <FileText className="h-3 w-3" />
                Open Log File
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 gap-1.5 px-2 font-mono text-xs text-muted-foreground"
                onClick={handleClear}
              >
                <Trash2 className="h-3 w-3" />
                Clear Logs
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 text-muted-foreground"
                onClick={onToggle}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Log entries */}
          <ScrollArea className="flex-1">
            <div className="p-2 font-mono text-xs">
              {filteredEntries.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground/50">
                  No log entries
                </div>
              ) : (
                filteredEntries.map((entry, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 rounded px-2 py-0.5 hover:bg-terminal-bg-light"
                  >
                    <span className="shrink-0 text-muted-foreground/50">
                      {formatTimestamp(entry.timestamp)}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        'shrink-0 px-1.5 py-0 text-[10px] uppercase',
                        LEVEL_STYLES[entry.level]
                      )}
                    >
                      {entry.level}
                    </Badge>
                    <span className="shrink-0 text-muted-foreground">
                      [{entry.source}]
                    </span>
                    <span
                      className={cn(
                        'break-all',
                        entry.level === 'error'
                          ? 'text-red-400'
                          : entry.level === 'warn'
                            ? 'text-amber-400'
                            : 'text-foreground'
                      )}
                    >
                      {entry.message}
                    </span>
                  </div>
                ))
              )}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  )
}
