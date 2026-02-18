import { useState, useEffect, useCallback } from 'react'
import type {
  WtConfig,
  WtProfile,
  WtColorScheme,
  WtGlobalSettings,
  WtCursorShape,
  WtFontWeight
} from '@shared/types'
import {
  DEFAULT_WT_PROFILE,
  DEFAULT_WT_COLOR_SCHEME,
  CURSOR_SHAPES_WT,
  WT_FONT_WEIGHTS,
  ANSI_COLOR_NAMES_WT
} from '@shared/defaults'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  Monitor,
  Palette,
  Settings,
  History,
  User,
  Plus,
  Trash2,
  Download,
  Upload,
  ExternalLink,
  Check,
  Edit3,
  Image,
  Store
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Profiles Tab                                                       */
/* ------------------------------------------------------------------ */

interface ProfilesTabProps {
  profiles: WtProfile[]
  defaultProfileDefaults: Partial<WtProfile>
  onUpdateProfile: (index: number, profile: WtProfile) => void
}

function ProfilesTab({
  profiles,
  defaultProfileDefaults,
  onUpdateProfile
}: ProfilesTabProps): JSX.Element {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const selectedProfile = selectedIdx !== null ? profiles[selectedIdx] : null

  const updateField = <K extends keyof WtProfile>(
    key: K,
    value: WtProfile[K]
  ): void => {
    if (selectedIdx === null || !selectedProfile) return
    onUpdateProfile(selectedIdx, { ...selectedProfile, [key]: value })
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Profile list */}
      <div className="space-y-2 lg:col-span-1">
        <h3 className="mb-3 font-mono text-sm font-semibold text-muted-foreground">
          Available Profiles
        </h3>
        <ScrollArea className="h-[600px]">
          <div className="space-y-2 pr-3">
            {profiles.map((profile, idx) => (
              <Card
                key={profile.guid ?? idx}
                className={cn(
                  'cursor-pointer transition-all duration-150',
                  selectedIdx === idx
                    ? 'border-neon-green/50 shadow-neon-green'
                    : 'hover:border-terminal-border/80'
                )}
                onClick={() => setSelectedIdx(idx)}
              >
                <CardHeader className="p-3">
                  <CardTitle className="font-mono text-sm text-foreground">
                    {profile.name}
                  </CardTitle>
                  <CardDescription className="font-mono text-xs">
                    <span className="text-muted-foreground">
                      {profile.fontFace ?? defaultProfileDefaults.fontFace ?? 'Default'} |{' '}
                      {profile.cursorShape ?? defaultProfileDefaults.cursorShape ?? 'bar'}
                    </span>
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
            {profiles.length === 0 && (
              <p className="py-8 text-center font-mono text-sm text-muted-foreground">
                No profiles found. Open Windows Terminal to create some.
              </p>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Profile editor */}
      <div className="lg:col-span-2">
        {selectedProfile ? (
          <Card>
            <CardHeader>
              <CardTitle className="font-mono text-base text-neon-green">
                {selectedProfile.name}
              </CardTitle>
              <CardDescription className="font-mono text-xs">
                {selectedProfile.guid ?? 'No GUID'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[560px]">
                <div className="space-y-5 pr-4">
                  {/* Font Face */}
                  <div className="grid gap-2">
                    <Label className="font-mono text-xs text-muted-foreground">
                      Font Face
                    </Label>
                    <Input
                      className="h-8 font-mono text-xs"
                      value={selectedProfile.fontFace ?? ''}
                      placeholder={defaultProfileDefaults.fontFace ?? 'Cascadia Code'}
                      onChange={(e) => updateField('fontFace', e.target.value)}
                    />
                  </div>

                  {/* Font Size */}
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label className="font-mono text-xs text-muted-foreground">
                        Font Size
                      </Label>
                      <span className="font-mono text-xs text-neon-green">
                        {selectedProfile.fontSize ?? defaultProfileDefaults.fontSize ?? 12}
                      </span>
                    </div>
                    <Slider
                      min={6}
                      max={36}
                      step={1}
                      value={[selectedProfile.fontSize ?? defaultProfileDefaults.fontSize ?? 12]}
                      onValueChange={([v]) => updateField('fontSize', v)}
                    />
                  </div>

                  {/* Font Weight */}
                  <div className="grid gap-2">
                    <Label className="font-mono text-xs text-muted-foreground">
                      Font Weight
                    </Label>
                    <Select
                      value={selectedProfile.fontWeight ?? defaultProfileDefaults.fontWeight ?? 'normal'}
                      onValueChange={(v) => updateField('fontWeight', v as WtFontWeight)}
                    >
                      <SelectTrigger className="h-8 font-mono text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {WT_FONT_WEIGHTS.map((w) => (
                          <SelectItem key={w} value={w}>
                            {w}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Cursor Shape */}
                  <div className="grid gap-2">
                    <Label className="font-mono text-xs text-muted-foreground">
                      Cursor Shape
                    </Label>
                    <Select
                      value={selectedProfile.cursorShape ?? defaultProfileDefaults.cursorShape ?? 'bar'}
                      onValueChange={(v) => updateField('cursorShape', v as WtCursorShape)}
                    >
                      <SelectTrigger className="h-8 font-mono text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CURSOR_SHAPES_WT.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  {/* Opacity */}
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label className="font-mono text-xs text-muted-foreground">
                        Opacity
                      </Label>
                      <span className="font-mono text-xs text-neon-green">
                        {selectedProfile.opacity ?? defaultProfileDefaults.opacity ?? 100}%
                      </span>
                    </div>
                    <Slider
                      min={0}
                      max={100}
                      step={1}
                      value={[selectedProfile.opacity ?? defaultProfileDefaults.opacity ?? 100]}
                      onValueChange={([v]) => updateField('opacity', v)}
                    />
                  </div>

                  {/* Use Acrylic */}
                  <div className="flex items-center justify-between">
                    <Label className="font-mono text-xs text-muted-foreground">
                      Use Acrylic
                    </Label>
                    <Switch
                      checked={selectedProfile.useAcrylic ?? defaultProfileDefaults.useAcrylic ?? false}
                      onCheckedChange={(v) => updateField('useAcrylic', v)}
                    />
                  </div>

                  {/* Acrylic Opacity */}
                  {(selectedProfile.useAcrylic ?? false) && (
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <Label className="font-mono text-xs text-muted-foreground">
                          Acrylic Opacity
                        </Label>
                        <span className="font-mono text-xs text-neon-green">
                          {Math.round(
                            (selectedProfile.acrylicOpacity ??
                              defaultProfileDefaults.acrylicOpacity ??
                              0.5) * 100
                          )}
                          %
                        </span>
                      </div>
                      <Slider
                        min={0}
                        max={100}
                        step={1}
                        value={[
                          Math.round(
                            (selectedProfile.acrylicOpacity ??
                              defaultProfileDefaults.acrylicOpacity ??
                              0.5) * 100
                          )
                        ]}
                        onValueChange={([v]) =>
                          updateField('acrylicOpacity', v / 100)
                        }
                      />
                    </div>
                  )}

                  {/* Padding */}
                  <div className="grid gap-2">
                    <Label className="font-mono text-xs text-muted-foreground">
                      Padding
                    </Label>
                    <Input
                      className="h-8 font-mono text-xs"
                      placeholder="8, 8, 8, 8"
                      value={selectedProfile.padding ?? ''}
                      onChange={(e) => updateField('padding', e.target.value)}
                    />
                  </div>

                  {/* Background Image */}
                  <div className="grid gap-2">
                    <Label className="font-mono text-xs text-muted-foreground">
                      Background Image
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        className="h-8 flex-1 font-mono text-xs"
                        placeholder="C:\path\to\image.png"
                        value={selectedProfile.backgroundImage ?? ''}
                        onChange={(e) =>
                          updateField('backgroundImage', e.target.value)
                        }
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 shrink-0 gap-1 font-mono text-xs"
                        onClick={() =>
                          window.api.settings
                            .selectFile()
                            .then((r) => {
                              if (r.success && r.data)
                                updateField('backgroundImage', r.data)
                            })
                        }
                      >
                        <Image className="h-3.5 w-3.5" />
                        Browse
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Bell Style */}
                  <div className="grid gap-2">
                    <Label className="font-mono text-xs text-muted-foreground">
                      Bell Style
                    </Label>
                    <Select
                      value={selectedProfile.bellStyle ?? defaultProfileDefaults.bellStyle ?? 'none'}
                      onValueChange={(v) =>
                        updateField('bellStyle', v as WtProfile['bellStyle'])
                      }
                    >
                      <SelectTrigger className="h-8 font-mono text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {['none', 'audible', 'visual', 'all'].map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Antialiasing Mode */}
                  <div className="grid gap-2">
                    <Label className="font-mono text-xs text-muted-foreground">
                      Antialiasing Mode
                    </Label>
                    <Select
                      value={
                        selectedProfile.antialiasingMode ??
                        defaultProfileDefaults.antialiasingMode ??
                        'grayscale'
                      }
                      onValueChange={(v) =>
                        updateField(
                          'antialiasingMode',
                          v as WtProfile['antialiasingMode']
                        )
                      }
                    >
                      <SelectTrigger className="h-8 font-mono text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {['grayscale', 'cleartype', 'aliased'].map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* History Size */}
                  <div className="grid gap-2">
                    <Label className="font-mono text-xs text-muted-foreground">
                      History Size
                    </Label>
                    <Input
                      type="number"
                      className="h-8 font-mono text-xs"
                      placeholder="9001"
                      value={selectedProfile.historySize ?? ''}
                      onChange={(e) =>
                        updateField(
                          'historySize',
                          e.target.value
                            ? parseInt(e.target.value, 10)
                            : undefined
                        )
                      }
                    />
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        ) : (
          <div className="flex h-[600px] items-center justify-center rounded-lg border border-dashed border-terminal-border">
            <div className="text-center">
              <User className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <p className="font-mono text-sm text-muted-foreground">
                Select a profile to edit its settings
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Color Schemes Tab                                                  */
/* ------------------------------------------------------------------ */

interface ColorSchemesTabProps {
  schemes: WtColorScheme[]
  onApply: (scheme: WtColorScheme) => void
  onDelete: (scheme: WtColorScheme) => void
  onFetchWtThemes: () => void
  onAddScheme: () => void
}

function ColorSchemesTab({
  schemes,
  onApply,
  onDelete,
  onFetchWtThemes,
  onAddScheme
}: ColorSchemesTabProps): JSX.Element {
  const colorKeys: (keyof WtColorScheme)[] = [
    'black', 'red', 'green', 'yellow', 'blue', 'purple', 'cyan', 'white',
    'brightBlack', 'brightRed', 'brightGreen', 'brightYellow',
    'brightBlue', 'brightPurple', 'brightCyan', 'brightWhite'
  ]

  return (
    <div className="space-y-4">
      {/* Actions row */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          className="gap-2 font-mono text-xs"
          onClick={onFetchWtThemes}
        >
          <Download className="h-3.5 w-3.5" />
          Import from windowsterminalthemes.dev
        </Button>
        <Button
          variant="outline"
          className="gap-2 font-mono text-xs"
          onClick={onAddScheme}
        >
          <Plus className="h-3.5 w-3.5" />
          Add Custom Scheme
        </Button>
      </div>

      {/* Scheme grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {schemes.map((scheme) => (
          <Card key={scheme.name} className="transition-all hover:border-terminal-border/80">
            <CardHeader className="pb-2">
              <CardTitle className="font-mono text-sm text-foreground">
                {scheme.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Color preview strip */}
              <div className="flex h-6 overflow-hidden rounded-md">
                {colorKeys.map((key) => (
                  <div
                    key={key}
                    className="flex-1"
                    style={{ backgroundColor: scheme[key] as string }}
                    title={`${key}: ${scheme[key]}`}
                  />
                ))}
              </div>
              {/* BG/FG preview */}
              <div
                className="flex items-center justify-center rounded-md px-3 py-2 font-mono text-xs"
                style={{
                  backgroundColor: scheme.background,
                  color: scheme.foreground
                }}
              >
                The quick brown fox jumps over the lazy dog
              </div>
              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  className="flex-1 gap-1 font-mono text-xs"
                  onClick={() => onApply(scheme)}
                >
                  <Check className="h-3 w-3" />
                  Apply
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1 font-mono text-xs"
                >
                  <Edit3 className="h-3 w-3" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="gap-1 font-mono text-xs text-muted-foreground hover:text-destructive"
                  onClick={() => onDelete(scheme)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {schemes.length === 0 && (
          <div className="col-span-full py-16 text-center">
            <Palette className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="font-mono text-sm text-muted-foreground">
              No color schemes found. Import some or add a custom scheme.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Global Settings Tab                                                */
/* ------------------------------------------------------------------ */

interface GlobalSettingsTabProps {
  globals: WtGlobalSettings
  profiles: WtProfile[]
  onChange: (globals: WtGlobalSettings) => void
}

function GlobalSettingsTab({
  globals,
  profiles,
  onChange
}: GlobalSettingsTabProps): JSX.Element {
  const update = <K extends keyof WtGlobalSettings>(
    key: K,
    value: WtGlobalSettings[K]
  ): void => {
    onChange({ ...globals, [key]: value })
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Default Profile */}
      <div className="grid gap-2">
        <Label className="font-mono text-xs text-muted-foreground">
          Default Profile
        </Label>
        <Select
          value={globals.defaultProfile ?? ''}
          onValueChange={(v) => update('defaultProfile', v)}
        >
          <SelectTrigger className="h-9 font-mono text-xs">
            <SelectValue placeholder="Select default profile" />
          </SelectTrigger>
          <SelectContent>
            {profiles.map((p) => (
              <SelectItem key={p.guid ?? p.name} value={p.guid ?? p.name}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Theme */}
      <div className="grid gap-2">
        <Label className="font-mono text-xs text-muted-foreground">
          Theme
        </Label>
        <Select
          value={globals.theme ?? 'system'}
          onValueChange={(v) =>
            update('theme', v as 'system' | 'dark' | 'light')
          }
        >
          <SelectTrigger className="h-9 font-mono text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="system">System</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="light">Light</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Toggles */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="font-mono text-xs text-muted-foreground">
            Always Show Tabs
          </Label>
          <Switch
            checked={globals.alwaysShowTabs ?? true}
            onCheckedChange={(v) => update('alwaysShowTabs', v)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label className="font-mono text-xs text-muted-foreground">
            Copy on Select
          </Label>
          <Switch
            checked={globals.copyOnSelect ?? false}
            onCheckedChange={(v) => update('copyOnSelect', v)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label className="font-mono text-xs text-muted-foreground">
            Confirm Close All Tabs
          </Label>
          <Switch
            checked={globals.confirmCloseAllTabs ?? true}
            onCheckedChange={(v) => update('confirmCloseAllTabs', v)}
          />
        </div>
      </div>

      <Separator />

      {/* Launch Mode */}
      <div className="grid gap-2">
        <Label className="font-mono text-xs text-muted-foreground">
          Launch Mode
        </Label>
        <Select
          value={globals.launchMode ?? 'default'}
          onValueChange={(v) =>
            update('launchMode', v as WtGlobalSettings['launchMode'])
          }
        >
          <SelectTrigger className="h-9 font-mono text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {['default', 'maximized', 'fullscreen', 'focus', 'minimized'].map(
              (m) => (
                <SelectItem key={m} value={m}>
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Tab Width Mode */}
      <div className="grid gap-2">
        <Label className="font-mono text-xs text-muted-foreground">
          Tab Width Mode
        </Label>
        <Select
          value={globals.tabWidthMode ?? 'equal'}
          onValueChange={(v) =>
            update('tabWidthMode', v as WtGlobalSettings['tabWidthMode'])
          }
        >
          <SelectTrigger className="h-9 font-mono text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="equal">Equal</SelectItem>
            <SelectItem value="titleLength">Title Length</SelectItem>
            <SelectItem value="compact">Compact</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  History Tab                                                        */
/* ------------------------------------------------------------------ */

interface HistoryTabProps {
  persistentHistory: boolean
  historySize: number
  onToggleHistory: (enabled: boolean) => void
  onHistorySizeChange: (size: number) => void
}

function HistoryTab({
  persistentHistory,
  historySize,
  onToggleHistory,
  onHistorySizeChange
}: HistoryTabProps): JSX.Element {
  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-mono text-base text-foreground">
            Persistent Command History
          </CardTitle>
          <CardDescription className="font-mono text-xs">
            By default, Windows Terminal does not persist command history between
            sessions. Enable this to save your command history so it is available
            when you open a new terminal window.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <Label className="font-mono text-sm text-foreground">
              Enable Persistent History
            </Label>
            <Switch
              checked={persistentHistory}
              onCheckedChange={onToggleHistory}
            />
          </div>

          <Separator />

          <div className="grid gap-2">
            <Label className="font-mono text-xs text-muted-foreground">
              History Size (number of commands to remember)
            </Label>
            <Input
              type="number"
              className="h-9 max-w-xs font-mono text-xs"
              value={historySize}
              onChange={(e) =>
                onHistorySizeChange(
                  parseInt(e.target.value, 10) || 9001
                )
              }
            />
            <p className="font-mono text-[11px] text-muted-foreground">
              Default: 9001. Higher values use slightly more memory but preserve
              more history.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export function TerminalConfigPage(): JSX.Element {
  const [config, setConfig] = useState<WtConfig | null>(null)
  const [persistentHistory, setPersistentHistory] = useState(false)
  const [historySize, setHistorySize] = useState(9001)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const loadConfig = useCallback(async () => {
    setLoading(true)
    try {
      const result = await window.api.wtConfig.read()
      if (result.success && result.data) {
        setConfig(result.data)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadConfig()
  }, [loadConfig])

  useEffect(() => {
    window.api.settings.get().then((result) => {
      if (result.success && result.data) {
        setPersistentHistory(result.data.persistentHistory)
        setHistorySize(result.data.historySize)
      }
    })
  }, [])

  const handleSave = async (): Promise<void> => {
    if (!config) return
    setSaving(true)
    try {
      await window.api.wtConfig.write(config)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateProfile = (index: number, profile: WtProfile): void => {
    if (!config) return
    const nextProfiles = [...config.profiles.list]
    nextProfiles[index] = profile
    setConfig({
      ...config,
      profiles: { ...config.profiles, list: nextProfiles }
    })
  }

  const handleApplyScheme = async (scheme: WtColorScheme): Promise<void> => {
    await window.api.wtConfig.schemeAdd(scheme)
  }

  const handleDeleteScheme = async (scheme: WtColorScheme): Promise<void> => {
    if (!config) return
    await window.api.wtConfig.schemeRemove(scheme.name)
    setConfig({
      ...config,
      schemes: config.schemes.filter((s) => s.name !== scheme.name)
    })
  }

  const handleFetchWtThemes = async (): Promise<void> => {
    await window.api.themes.fetchWtThemes()
    loadConfig()
  }

  const handleAddScheme = (): void => {
    if (!config) return
    const newScheme: WtColorScheme = {
      ...DEFAULT_WT_COLOR_SCHEME,
      name: `Custom Scheme ${config.schemes.length + 1}`
    }
    setConfig({
      ...config,
      schemes: [...config.schemes, newScheme]
    })
  }

  const handleUpdateGlobals = (globals: WtGlobalSettings): void => {
    if (!config) return
    setConfig({ ...config, globals })
  }

  const handleTogglePersistentHistory = async (
    enabled: boolean
  ): Promise<void> => {
    setPersistentHistory(enabled)
    await window.api.wtConfig.setPersistentHistory(enabled, historySize)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="font-mono text-sm text-muted-foreground animate-pulse">
          Loading Windows Terminal configuration...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-mono text-2xl font-bold tracking-tight text-foreground">
            Windows Terminal
          </h1>
          <p className="mt-1 font-mono text-sm text-muted-foreground">
            Configure profiles, color schemes, and global settings for Windows
            Terminal
          </p>
        </div>
        <Button
          className="gap-2 font-mono text-sm"
          onClick={handleSave}
          disabled={saving || !config}
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Install channels */}
      <Card className="border-neon-cyan/20">
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <Store className="h-4 w-4 text-neon-cyan" />
          <span className="font-mono text-xs text-muted-foreground">
            Install Windows Terminal:
          </span>
          <Button
            size="sm"
            variant="outline"
            className="h-7 gap-1 font-mono text-xs"
            onClick={() =>
              window.open(
                'ms-windows-store://pdp/?productid=9N0DX20HK701',
                '_blank'
              )
            }
          >
            <ExternalLink className="h-3 w-3" />
            Stable
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 gap-1 font-mono text-xs"
            onClick={() =>
              window.open(
                'ms-windows-store://pdp/?productid=9N8G5RFZ9XK3',
                '_blank'
              )
            }
          >
            <ExternalLink className="h-3 w-3" />
            Preview
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 gap-1 font-mono text-xs"
            onClick={() =>
              window.open(
                'ms-windows-store://pdp/?productid=9N3BCTBVMK5T',
                '_blank'
              )
            }
          >
            <ExternalLink className="h-3 w-3" />
            Canary
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Tabbed content */}
      <Tabs defaultValue="profiles">
        <TabsList className="font-mono">
          <TabsTrigger value="profiles" className="gap-1.5 text-xs">
            <User className="h-3.5 w-3.5" />
            Profiles
          </TabsTrigger>
          <TabsTrigger value="schemes" className="gap-1.5 text-xs">
            <Palette className="h-3.5 w-3.5" />
            Color Schemes
          </TabsTrigger>
          <TabsTrigger value="globals" className="gap-1.5 text-xs">
            <Settings className="h-3.5 w-3.5" />
            Global Settings
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-1.5 text-xs">
            <History className="h-3.5 w-3.5" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profiles" className="mt-4">
          {config && (
            <ProfilesTab
              profiles={config.profiles.list}
              defaultProfileDefaults={config.profiles.defaults}
              onUpdateProfile={handleUpdateProfile}
            />
          )}
        </TabsContent>

        <TabsContent value="schemes" className="mt-4">
          {config && (
            <ColorSchemesTab
              schemes={config.schemes}
              onApply={handleApplyScheme}
              onDelete={handleDeleteScheme}
              onFetchWtThemes={handleFetchWtThemes}
              onAddScheme={handleAddScheme}
            />
          )}
        </TabsContent>

        <TabsContent value="globals" className="mt-4">
          {config && (
            <GlobalSettingsTab
              globals={config.globals}
              profiles={config.profiles.list}
              onChange={handleUpdateGlobals}
            />
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <HistoryTab
            persistentHistory={persistentHistory}
            historySize={historySize}
            onToggleHistory={handleTogglePersistentHistory}
            onHistorySizeChange={setHistorySize}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
