import { useState, useEffect, useCallback } from 'react'
import type { AppSettings, TerminalTarget } from '@shared/types'
import { DEFAULT_APP_SETTINGS } from '@shared/defaults'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import {
  Save,
  User,
  Monitor,
  Sparkles,
  FolderOpen,
  Database,
  History,
  Info,
  Plus,
  Trash2,
  Search,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ExternalLink,
  Zap
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Settings Page                                                      */
/* ------------------------------------------------------------------ */

export function SettingsPage(): JSX.Element {
  const [settings, setSettings] = useState<AppSettings>({ ...DEFAULT_APP_SETTINGS })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dbTesting, setDbTesting] = useState(false)
  const [dbTestResult, setDbTestResult] = useState<'success' | 'error' | null>(null)
  const loadSettings = useCallback(async () => {
    setLoading(true)
    try {
      const result = await window.api.settings.get()
      if (result.success && result.data) {
        setSettings(result.data)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const update = <K extends keyof AppSettings>(key: K, val: AppSettings[K]): void => {
    setSettings((prev) => ({ ...prev, [key]: val }))
  }

  const handleSave = async (): Promise<void> => {
    setSaving(true)
    try {
      await window.api.settings.set(settings)
    } finally {
      setSaving(false)
    }
  }

  const handleBrowseWtSettings = async (): Promise<void> => {
    const result = await window.api.settings.selectFile()
    if (result.success && result.data) {
      update('wtSettingsPath', result.data)
    }
  }

  const handleAutoDetectWt = async (): Promise<void> => {
    const result = await window.api.wtConfig.getPath()
    if (result.success && result.data) {
      update('wtSettingsPath', result.data)
    }
  }

  const handleBrowseHyperConfig = async (): Promise<void> => {
    const result = await window.api.settings.selectFile()
    if (result.success && result.data) {
      update('hyperConfigPath', result.data)
    }
  }

  const handleTestDbConnection = async (): Promise<void> => {
    setDbTesting(true)
    setDbTestResult(null)
    try {
      const result = await window.api.db.testConnection({
        host: settings.dbHost,
        port: settings.dbPort,
        database: settings.dbName,
        user: settings.dbUser,
        password: settings.dbPassword
      })
      setDbTestResult(result.success ? 'success' : 'error')
    } catch {
      setDbTestResult('error')
    } finally {
      setDbTesting(false)
    }
  }

  const handleAddScanDir = async (): Promise<void> => {
    const result = await window.api.settings.selectDir()
    if (result.success && result.data) {
      const dir = result.data
      if (!settings.scanDirectories.includes(dir)) {
        update('scanDirectories', [...settings.scanDirectories, dir])
      }
    }
  }

  const handleRemoveScanDir = (dir: string): void => {
    update(
      'scanDirectories',
      settings.scanDirectories.filter((d) => d !== dir)
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="font-mono text-sm text-muted-foreground animate-pulse">
          Loading settings...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-mono text-2xl font-bold tracking-tight text-foreground">
            Settings
          </h1>
          <p className="mt-1 font-mono text-sm text-muted-foreground">
            Configure HyperSkin preferences, paths, and integrations
          </p>
        </div>
        <Button
          className="gap-2 font-mono text-sm"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Settings
        </Button>
      </div>

      <Separator />

      <div className="space-y-6">
        {/* ---- General ---- */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-mono text-base text-foreground">
              <User className="h-4 w-4 text-neon-green" />
              General
            </CardTitle>
            <CardDescription className="font-mono text-xs">
              Basic application preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* User Name */}
            <div className="grid gap-1.5">
              <Label className="font-mono text-xs text-muted-foreground">
                User Name
              </Label>
              <Input
                placeholder="Your name for greetings"
                className="font-mono text-sm"
                value={settings.userName}
                onChange={(e) => update('userName', e.target.value)}
              />
            </div>

            {/* Greeting Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-mono text-xs text-muted-foreground">
                  Show Greeting
                </Label>
                <p className="font-mono text-[10px] text-muted-foreground/70">
                  Display a personalized greeting on startup
                </p>
              </div>
              <Switch
                checked={settings.greetingEnabled}
                onCheckedChange={(v) => update('greetingEnabled', v)}
              />
            </div>

            {/* Default Terminal */}
            <div className="grid gap-1.5">
              <Label className="font-mono text-xs text-muted-foreground">
                Default Terminal
              </Label>
              <Select
                value={settings.defaultTerminal}
                onValueChange={(v) => update('defaultTerminal', v as TerminalTarget)}
              >
                <SelectTrigger className="h-9 font-mono text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="windows-terminal">
                    <span className="flex items-center gap-2">
                      <Monitor className="h-3 w-3" />
                      Windows Terminal
                    </span>
                  </SelectItem>
                  <SelectItem value="hyper">
                    <span className="flex items-center gap-2">
                      <Sparkles className="h-3 w-3" />
                      Hyper
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* ---- Windows Terminal ---- */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-mono text-base text-foreground">
              <Monitor className="h-4 w-4 text-neon-cyan" />
              Windows Terminal
            </CardTitle>
            <CardDescription className="font-mono text-xs">
              Path to Windows Terminal settings.json
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-1.5">
              <Label className="font-mono text-xs text-muted-foreground">
                Settings Path
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="C:\\Users\\...\\settings.json"
                  className="flex-1 font-mono text-xs"
                  value={settings.wtSettingsPath}
                  onChange={(e) => update('wtSettingsPath', e.target.value)}
                />
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-9 w-9 shrink-0"
                        onClick={handleBrowseWtSettings}
                      >
                        <FolderOpen className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="font-mono text-xs">
                      Browse for settings.json
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-9 w-9 shrink-0"
                        onClick={handleAutoDetectWt}
                      >
                        <Zap className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="font-mono text-xs">
                      Auto-detect settings path
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ---- Hyper Terminal ---- */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-mono text-base text-foreground">
              <Sparkles className="h-4 w-4 text-neon-pink" />
              Hyper Terminal
            </CardTitle>
            <CardDescription className="font-mono text-xs">
              Path to .hyper.js configuration file
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-1.5">
              <Label className="font-mono text-xs text-muted-foreground">
                Config Path
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="C:\\Users\\...\\AppData\\Roaming\\Hyper\\.hyper.js"
                  className="flex-1 font-mono text-xs"
                  value={settings.hyperConfigPath}
                  onChange={(e) => update('hyperConfigPath', e.target.value)}
                />
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-9 w-9 shrink-0"
                        onClick={handleBrowseHyperConfig}
                      >
                        <FolderOpen className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="font-mono text-xs">
                      Browse for .hyper.js
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ---- History ---- */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-mono text-base text-foreground">
              <History className="h-4 w-4 text-neon-amber" />
              History
            </CardTitle>
            <CardDescription className="font-mono text-xs">
              Configure command history persistence
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-mono text-xs text-muted-foreground">
                  Persistent Command History
                </Label>
                <p className="font-mono text-[10px] text-muted-foreground/70">
                  Save command history between sessions
                </p>
              </div>
              <Switch
                checked={settings.persistentHistory}
                onCheckedChange={(v) => update('persistentHistory', v)}
              />
            </div>

            <div className="grid gap-1.5">
              <Label className="font-mono text-xs text-muted-foreground">
                History Size
              </Label>
              <Input
                type="number"
                placeholder="9001"
                className="font-mono text-sm"
                value={settings.historySize}
                onChange={(e) =>
                  update('historySize', parseInt(e.target.value, 10) || 9001)
                }
              />
              <p className="font-mono text-[10px] text-muted-foreground/70">
                Maximum number of commands to store in the terminal scrollback buffer.
                Higher values use more memory.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ---- Database (Community Features) ---- */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-mono text-base text-foreground">
              <Database className="h-4 w-4 text-neon-cyan" />
              Database
              <Badge variant="outline" className="ml-2 font-mono text-[10px]">
                Community Features
              </Badge>
            </CardTitle>
            <CardDescription className="font-mono text-xs">
              PostgreSQL connection for community theme sharing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Enable Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-mono text-xs text-muted-foreground">
                  Enable Database Connection
                </Label>
                <p className="font-mono text-[10px] text-muted-foreground/70">
                  Required for community theme sharing features
                </p>
              </div>
              <Switch
                checked={settings.dbEnabled}
                onCheckedChange={(v) => update('dbEnabled', v)}
              />
            </div>

            <div className={cn('space-y-3', !settings.dbEnabled && 'opacity-50 pointer-events-none')}>
              <div className="grid grid-cols-2 gap-3">
                {/* Host */}
                <div className="grid gap-1.5">
                  <Label className="font-mono text-xs text-muted-foreground">Host</Label>
                  <Input
                    placeholder="localhost"
                    className="font-mono text-xs"
                    value={settings.dbHost}
                    onChange={(e) => update('dbHost', e.target.value)}
                  />
                </div>
                {/* Port */}
                <div className="grid gap-1.5">
                  <Label className="font-mono text-xs text-muted-foreground">Port</Label>
                  <Input
                    type="number"
                    placeholder="5432"
                    className="font-mono text-xs"
                    value={settings.dbPort}
                    onChange={(e) =>
                      update('dbPort', parseInt(e.target.value, 10) || 5432)
                    }
                  />
                </div>
              </div>

              {/* Database Name */}
              <div className="grid gap-1.5">
                <Label className="font-mono text-xs text-muted-foreground">Database Name</Label>
                <Input
                  placeholder="hyperskin"
                  className="font-mono text-xs"
                  value={settings.dbName}
                  onChange={(e) => update('dbName', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* User */}
                <div className="grid gap-1.5">
                  <Label className="font-mono text-xs text-muted-foreground">User</Label>
                  <Input
                    placeholder="hyperskin"
                    className="font-mono text-xs"
                    value={settings.dbUser}
                    onChange={(e) => update('dbUser', e.target.value)}
                  />
                </div>
                {/* Password */}
                <div className="grid gap-1.5">
                  <Label className="font-mono text-xs text-muted-foreground">Password</Label>
                  <Input
                    type="password"
                    placeholder="Enter password"
                    className="font-mono text-xs"
                    value={settings.dbPassword}
                    onChange={(e) => update('dbPassword', e.target.value)}
                  />
                </div>
              </div>

              {/* Test Connection */}
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 font-mono text-xs"
                  onClick={handleTestDbConnection}
                  disabled={dbTesting}
                >
                  {dbTesting ? (
                    <RefreshCw className="h-3 w-3 animate-spin" />
                  ) : (
                    <Zap className="h-3 w-3" />
                  )}
                  Test Connection
                </Button>
                {dbTestResult === 'success' && (
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-neon-green" />
                    <span className="font-mono text-xs text-neon-green">
                      Connection successful
                    </span>
                  </div>
                )}
                {dbTestResult === 'error' && (
                  <div className="flex items-center gap-1.5">
                    <XCircle className="h-4 w-4 text-destructive" />
                    <span className="font-mono text-xs text-destructive">
                      Connection failed
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ---- Scan Directories ---- */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-mono text-base text-foreground">
              <Search className="h-4 w-4 text-neon-green" />
              Scan Directories
            </CardTitle>
            <CardDescription className="font-mono text-xs">
              Directories to scan for projects when using auto-discovery
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {settings.scanDirectories.length === 0 ? (
              <div className="flex items-center gap-2 rounded border border-dashed border-terminal-border px-3 py-4">
                <Info className="h-4 w-4 shrink-0 text-muted-foreground" />
                <p className="font-mono text-xs text-muted-foreground">
                  No scan directories configured. Add directories where your projects live.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {settings.scanDirectories.map((dir) => (
                  <div
                    key={dir}
                    className="flex items-center gap-2 rounded border border-terminal-border bg-terminal-bg px-3 py-2"
                  >
                    <FolderOpen className="h-3.5 w-3.5 shrink-0 text-neon-green" />
                    <span className="flex-1 truncate font-mono text-xs text-foreground">
                      {dir}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveScanDir(dir)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              className="gap-2 font-mono text-xs"
              onClick={handleAddScanDir}
            >
              <Plus className="h-3.5 w-3.5" />
              Add Directory
            </Button>
          </CardContent>
        </Card>

        {/* ---- About ---- */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-mono text-base text-foreground">
              <Info className="h-4 w-4 text-muted-foreground" />
              About
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-muted-foreground">Version</span>
              <Badge variant="outline" className="font-mono text-xs">
                v1.0.0
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-muted-foreground">Platform</span>
              <Badge variant="outline" className="font-mono text-xs">
                Windows (Electron)
              </Badge>
            </div>
            <Separator />
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 font-mono text-xs"
                onClick={() => window.open('https://github.com/hyperskin/hyperskin', '_blank')}
              >
                <ExternalLink className="h-3 w-3" />
                GitHub
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 font-mono text-xs"
                onClick={() =>
                  window.open('https://github.com/hyperskin/hyperskin/issues', '_blank')
                }
              >
                <ExternalLink className="h-3 w-3" />
                Report Issue
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
