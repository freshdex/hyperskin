import { useState, useEffect, useCallback } from 'react'
import type {
  ThemePreset,
  CommunityTheme,
  WtColorScheme,
  AppTheme
} from '@shared/types'
import {
  DEFAULT_APP_THEME,
  ANSI_COLOR_NAMES_WT
} from '@shared/defaults'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
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
  Palette,
  Download,
  Upload,
  Trash2,
  Check,
  Search,
  Star,
  Heart,
  ExternalLink,
  RefreshCw,
  RotateCcw,
  Paintbrush,
  Eye,
  Sparkles,
  Globe,
  Package,
  SlidersHorizontal,
  Monitor,
  Database
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Color Strip Preview                                                */
/* ------------------------------------------------------------------ */

interface ColorStripProps {
  scheme?: WtColorScheme
}

function ColorStrip({ scheme }: ColorStripProps): JSX.Element {
  if (!scheme) return <div className="h-4 rounded bg-terminal-border" />

  const colors = ANSI_COLOR_NAMES_WT.map((name) => scheme[name])

  return (
    <div className="flex h-5 overflow-hidden rounded-sm">
      {colors.map((color, i) => (
        <div
          key={i}
          className="flex-1"
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Theme Text Preview                                                 */
/* ------------------------------------------------------------------ */

interface TextPreviewProps {
  bg?: string
  fg?: string
}

function TextPreview({ bg, fg }: TextPreviewProps): JSX.Element {
  return (
    <div
      className="mt-2 rounded-sm px-3 py-2 font-mono text-xs"
      style={{
        backgroundColor: bg ?? '#0C0C0C',
        color: fg ?? '#CCCCCC'
      }}
    >
      <span>$ hyperskin --preview</span>
      <br />
      <span style={{ opacity: 0.6 }}>Hello, World!</span>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  WT Theme Card                                                      */
/* ------------------------------------------------------------------ */

interface WtThemeCardProps {
  theme: ThemePreset
  onApply: (theme: ThemePreset) => void
  onSave: (theme: ThemePreset) => void
  onDelete: (theme: ThemePreset) => void
}

function WtThemeCard({ theme, onApply, onSave, onDelete }: WtThemeCardProps): JSX.Element {
  return (
    <Card className="group transition-all duration-200 hover:border-neon-green/30 hover:shadow-neon-green/10 hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="font-mono text-sm text-neon-green truncate">
            {theme.name}
          </CardTitle>
          <Badge
            variant="outline"
            className={cn(
              'text-[10px] shrink-0',
              theme.source === 'builtin' && 'border-neon-cyan/30 text-neon-cyan',
              theme.source === 'windowsterminalthemes' && 'border-neon-amber/30 text-neon-amber',
              theme.source === 'user' && 'border-neon-green/30 text-neon-green'
            )}
          >
            {theme.source === 'builtin'
              ? 'Built-in'
              : theme.source === 'windowsterminalthemes'
                ? 'WT Themes'
                : 'User'}
          </Badge>
        </div>
        {theme.description && (
          <CardDescription className="font-mono text-xs truncate">
            {theme.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-2 pb-3">
        <ColorStrip scheme={theme.wtScheme} />
        <TextPreview bg={theme.wtScheme?.background} fg={theme.wtScheme?.foreground} />
      </CardContent>
      <CardFooter className="gap-2">
        <Button
          size="sm"
          className="flex-1 gap-1 font-mono text-xs"
          onClick={() => onApply(theme)}
        >
          <Check className="h-3 w-3" />
          Apply
        </Button>
        {!theme.builtin && (
          <>
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8 shrink-0"
                    onClick={() => onSave(theme)}
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="font-mono text-xs">Save</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => onDelete(theme)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="font-mono text-xs">Delete</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </>
        )}
      </CardFooter>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/*  Hyper Theme Card                                                   */
/* ------------------------------------------------------------------ */

interface HyperThemeCardProps {
  theme: ThemePreset
  onInstall: (theme: ThemePreset) => void
  onApply: (theme: ThemePreset) => void
  onRemove: (theme: ThemePreset) => void
}

function HyperThemeCard({ theme, onInstall, onApply, onRemove }: HyperThemeCardProps): JSX.Element {
  return (
    <Card className="group transition-all duration-200 hover:border-neon-pink/30 hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="font-mono text-sm text-neon-pink truncate">
            {theme.name}
          </CardTitle>
          <Badge
            variant="outline"
            className="text-[10px] shrink-0 border-neon-pink/30 text-neon-pink"
          >
            Hyper
          </Badge>
        </div>
        {theme.description && (
          <CardDescription className="font-mono text-xs truncate">
            {theme.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pb-3">
        {theme.hyperConfig && (
          <TextPreview
            bg={theme.hyperConfig.backgroundColor}
            fg={theme.hyperConfig.foregroundColor}
          />
        )}
      </CardContent>
      <CardFooter className="gap-2">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 gap-1 font-mono text-xs"
          onClick={() => onInstall(theme)}
        >
          <Package className="h-3 w-3" />
          Install
        </Button>
        <Button
          size="sm"
          className="flex-1 gap-1 font-mono text-xs"
          onClick={() => onApply(theme)}
        >
          <Check className="h-3 w-3" />
          Apply
        </Button>
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => onRemove(theme)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="font-mono text-xs">Remove</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardFooter>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/*  Community Theme Card                                               */
/* ------------------------------------------------------------------ */

interface CommunityThemeCardProps {
  theme: CommunityTheme
  onDownload: (theme: CommunityTheme) => void
  onFavorite: (theme: CommunityTheme) => void
  onRate: (theme: CommunityTheme, rating: number) => void
}

function CommunityThemeCard({
  theme,
  onDownload,
  onFavorite,
  onRate
}: CommunityThemeCardProps): JSX.Element {
  return (
    <Card className="group transition-all duration-200 hover:border-neon-cyan/30 hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="font-mono text-sm text-neon-cyan truncate">
              {theme.name}
            </CardTitle>
            <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
              by {theme.authorName}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Download className="h-3 w-3 text-muted-foreground" />
            <span className="font-mono text-[10px] text-muted-foreground">
              {theme.downloads}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 pb-3">
        {theme.wtScheme && <ColorStrip scheme={theme.wtScheme} />}
        <TextPreview
          bg={theme.wtScheme?.background ?? theme.hyperConfig?.backgroundColor}
          fg={theme.wtScheme?.foreground ?? theme.hyperConfig?.foregroundColor}
        />
        {/* Star rating */}
        <div className="flex items-center gap-1 pt-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => onRate(theme, star)}
              className="p-0"
            >
              <Star
                className={cn(
                  'h-3.5 w-3.5 cursor-pointer transition-colors',
                  star <= Math.round(theme.rating)
                    ? 'fill-neon-amber text-neon-amber'
                    : 'text-muted-foreground hover:text-neon-amber'
                )}
              />
            </button>
          ))}
          <span className="ml-1 font-mono text-[10px] text-muted-foreground">
            ({theme.ratingCount})
          </span>
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button
          size="sm"
          className="flex-1 gap-1 font-mono text-xs"
          onClick={() => onDownload(theme)}
        >
          <Download className="h-3 w-3" />
          Download
        </Button>
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 shrink-0"
                onClick={() => onFavorite(theme)}
              >
                <Heart
                  className={cn(
                    'h-3.5 w-3.5 transition-colors',
                    theme.favoriteCount > 0
                      ? 'fill-neon-pink text-neon-pink'
                      : 'text-muted-foreground hover:text-neon-pink'
                  )}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="font-mono text-xs">
              Favorite ({theme.favoriteCount})
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardFooter>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/*  Color Picker Field                                                 */
/* ------------------------------------------------------------------ */

interface ColorPickerFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
}

function ColorPickerField({ label, value, onChange }: ColorPickerFieldProps): JSX.Element {
  return (
    <div className="flex items-center gap-3">
      <div
        className="h-8 w-8 shrink-0 rounded-md border border-terminal-border cursor-pointer"
        style={{ backgroundColor: value }}
        onClick={() => {
          const input = document.createElement('input')
          input.type = 'color'
          input.value = value
          input.addEventListener('input', (e) => {
            onChange((e.target as HTMLInputElement).value)
          })
          input.click()
        }}
      />
      <div className="flex-1 space-y-1">
        <Label className="font-mono text-xs text-muted-foreground">{label}</Label>
        <Input
          className="h-7 font-mono text-xs"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  HyperSkin Appearance Tab                                           */
/* ------------------------------------------------------------------ */

interface AppearanceTabProps {
  appTheme: AppTheme
  onThemeChange: (theme: AppTheme) => void
  onReset: () => void
}

function AppearanceTab({ appTheme, onThemeChange, onReset }: AppearanceTabProps): JSX.Element {
  const update = <K extends keyof AppTheme>(key: K, val: AppTheme[K]): void => {
    onThemeChange({ ...appTheme, [key]: val })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-mono text-base text-foreground">
            <Paintbrush className="h-4 w-4 text-neon-green" />
            Appearance Settings
          </CardTitle>
          <CardDescription className="font-mono text-xs">
            Customize the HyperSkin application itself
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ColorPickerField
            label="Accent Color"
            value={appTheme.accentColor}
            onChange={(v) => update('accentColor', v)}
          />
          <ColorPickerField
            label="Secondary Accent Color"
            value={appTheme.accentColorSecondary}
            onChange={(v) => update('accentColorSecondary', v)}
          />
          <ColorPickerField
            label="Background Color"
            value={appTheme.backgroundColor}
            onChange={(v) => update('backgroundColor', v)}
          />
          <ColorPickerField
            label="Card Color"
            value={appTheme.cardColor}
            onChange={(v) => update('cardColor', v)}
          />
          <ColorPickerField
            label="Border Color"
            value={appTheme.borderColor}
            onChange={(v) => update('borderColor', v)}
          />

          <Separator />

          {/* Monospace Font */}
          <div className="space-y-1.5">
            <Label className="font-mono text-xs text-muted-foreground">Monospace Font</Label>
            <Select
              value={appTheme.fontMono}
              onValueChange={(v) => update('fontMono', v)}
            >
              <SelectTrigger className="h-8 font-mono text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="JetBrains Mono">JetBrains Mono</SelectItem>
                <SelectItem value="Fira Code">Fira Code</SelectItem>
                <SelectItem value="Cascadia Code">Cascadia Code</SelectItem>
                <SelectItem value="Consolas">Consolas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sans Font */}
          <div className="space-y-1.5">
            <Label className="font-mono text-xs text-muted-foreground">Sans Font</Label>
            <Select
              value={appTheme.fontSans}
              onValueChange={(v) => update('fontSans', v)}
            >
              <SelectTrigger className="h-8 font-mono text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Inter">Inter</SelectItem>
                <SelectItem value="system-ui">System UI</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Glow Effects */}
          <div className="flex items-center justify-between">
            <Label className="font-mono text-xs text-muted-foreground">Glow Effects</Label>
            <Switch
              checked={appTheme.glowEnabled}
              onCheckedChange={(v) => update('glowEnabled', v)}
            />
          </div>

          {/* Scanlines */}
          <div className="flex items-center justify-between">
            <Label className="font-mono text-xs text-muted-foreground">Scanlines Effect</Label>
            <Switch
              checked={appTheme.scanlinesEnabled}
              onCheckedChange={(v) => update('scanlinesEnabled', v)}
            />
          </div>

          <Separator />

          <Button
            variant="outline"
            className="w-full gap-2 font-mono text-xs"
            onClick={onReset}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset to Defaults
          </Button>
        </CardContent>
      </Card>

      {/* Live Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-mono text-base text-foreground">
            <Eye className="h-4 w-4 text-neon-cyan" />
            Live Preview
          </CardTitle>
          <CardDescription className="font-mono text-xs">
            See how your changes will look
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="space-y-4 rounded-lg border p-4"
            style={{
              backgroundColor: appTheme.backgroundColor,
              borderColor: appTheme.borderColor
            }}
          >
            {/* Preview Card */}
            <div
              className="rounded-lg border p-4"
              style={{
                backgroundColor: appTheme.cardColor,
                borderColor: appTheme.borderColor
              }}
            >
              <h3
                className="mb-2 text-sm font-semibold"
                style={{
                  color: appTheme.accentColor,
                  fontFamily: appTheme.fontMono
                }}
              >
                Sample Card
              </h3>
              <p
                className="text-xs"
                style={{
                  color: '#8a8a9a',
                  fontFamily: appTheme.fontSans
                }}
              >
                This is how a card looks with your chosen theme
              </p>
            </div>

            {/* Preview Buttons */}
            <div className="flex gap-2">
              <button
                className="rounded-md px-3 py-1.5 text-xs font-medium"
                style={{
                  backgroundColor: appTheme.accentColor,
                  color: appTheme.backgroundColor,
                  fontFamily: appTheme.fontMono,
                  boxShadow: appTheme.glowEnabled
                    ? `0 0 10px ${appTheme.accentColor}50, 0 0 20px ${appTheme.accentColor}20`
                    : 'none'
                }}
              >
                Primary Button
              </button>
              <button
                className="rounded-md px-3 py-1.5 text-xs font-medium"
                style={{
                  backgroundColor: appTheme.accentColorSecondary,
                  color: appTheme.backgroundColor,
                  fontFamily: appTheme.fontMono,
                  boxShadow: appTheme.glowEnabled
                    ? `0 0 10px ${appTheme.accentColorSecondary}50, 0 0 20px ${appTheme.accentColorSecondary}20`
                    : 'none'
                }}
              >
                Secondary
              </button>
            </div>

            {/* Preview Badge row */}
            <div className="flex gap-2">
              <span
                className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold"
                style={{
                  borderColor: `${appTheme.accentColor}40`,
                  color: appTheme.accentColor,
                  fontFamily: appTheme.fontMono
                }}
              >
                Active
              </span>
              <span
                className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold"
                style={{
                  borderColor: `${appTheme.accentColorSecondary}40`,
                  color: appTheme.accentColorSecondary,
                  fontFamily: appTheme.fontMono
                }}
              >
                Badge
              </span>
            </div>

            {/* Preview Terminal */}
            <div
              className={cn(
                'relative rounded-md p-3',
                appTheme.scanlinesEnabled && 'scanlines'
              )}
              style={{
                backgroundColor: appTheme.backgroundColorLight,
                fontFamily: appTheme.fontMono
              }}
            >
              <p className="text-xs" style={{ color: appTheme.accentColor }}>
                $ hyperskin --version
              </p>
              <p className="text-xs" style={{ color: '#8a8a9a' }}>
                HyperSkin v1.0.0
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Themes Page                                                        */
/* ------------------------------------------------------------------ */

export function ThemesPage(): JSX.Element {
  const [wtThemes, setWtThemes] = useState<ThemePreset[]>([])
  const [hyperThemes, setHyperThemes] = useState<ThemePreset[]>([])
  const [communityThemes, setCommunityThemes] = useState<CommunityTheme[]>([])
  const [appTheme, setAppTheme] = useState<AppTheme>({ ...DEFAULT_APP_THEME })
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(false)
  const [communitySearch, setCommunitySearch] = useState('')
  const [communitySort, setCommunitySort] = useState<'newest' | 'popular' | 'top-rated'>('newest')
  const [dbConfigured, setDbConfigured] = useState(false)
  const [selectedWtThemeId, setSelectedWtThemeId] = useState<string | null>(null)

  const loadThemes = useCallback(async () => {
    setLoading(true)
    try {
      const result = await window.api.themes.list()
      if (result.success && result.data) {
        setWtThemes(result.data.filter((t: ThemePreset) => t.wtScheme && (t.source === 'builtin' || t.source === 'user' || t.source === 'windowsterminalthemes')))
        setHyperThemes(result.data.filter((t: ThemePreset) => t.source === 'hyper-official' || t.hyperConfig))
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const loadAppTheme = useCallback(async () => {
    try {
      const result = await window.api.appTheme.get()
      if (result.success && result.data) {
        setAppTheme(result.data)
      }
    } catch {
      // use defaults
    }
  }, [])

  const loadCommunity = useCallback(async () => {
    try {
      const result = communitySearch
        ? await window.api.community.search(communitySearch, 1)
        : await window.api.community.browse(1, communitySort)
      if (result.success && result.data) {
        setCommunityThemes(result.data)
        setDbConfigured(true)
      }
    } catch {
      setDbConfigured(false)
    }
  }, [communitySearch, communitySort])

  useEffect(() => {
    loadThemes()
    loadAppTheme()
  }, [loadThemes, loadAppTheme])

  useEffect(() => {
    loadCommunity()
  }, [loadCommunity])

  /* ---- Actions ---- */

  const handleImportWtThemes = async (): Promise<void> => {
    setImporting(true)
    try {
      const result = await window.api.themes.fetchWtThemes()
      if (result.success) {
        loadThemes()
      }
    } finally {
      setImporting(false)
    }
  }

  const handleApplyTheme = async (theme: ThemePreset, target: 'windows-terminal' | 'hyper'): Promise<void> => {
    await window.api.themes.apply(theme.id, target)
  }

  const handleSaveTheme = async (theme: ThemePreset): Promise<void> => {
    await window.api.themes.save(theme)
  }

  const handleDeleteTheme = async (theme: ThemePreset): Promise<void> => {
    await window.api.themes.delete(theme.id)
    loadThemes()
  }

  const handleImportJson = async (): Promise<void> => {
    const result = await window.api.themes.importTheme()
    if (result.success) {
      loadThemes()
    }
  }

  const handleExportJson = async (themeId: string): Promise<void> => {
    await window.api.themes.exportTheme(themeId)
  }

  const handleBrowseHyperThemes = async (): Promise<void> => {
    setImporting(true)
    try {
      const result = await window.api.themes.fetchHyperThemes()
      if (result.success) {
        loadThemes()
      }
    } finally {
      setImporting(false)
    }
  }

  const handleBrowseHyperPlugins = async (): Promise<void> => {
    setImporting(true)
    try {
      const result = await window.api.themes.fetchHyperPlugins()
      if (result.success) {
        loadThemes()
      }
    } finally {
      setImporting(false)
    }
  }

  const handleInstallHyperTheme = async (theme: ThemePreset): Promise<void> => {
    await window.api.hyperPlugins.install(theme.name)
  }

  const handleAppThemeChange = async (theme: AppTheme): Promise<void> => {
    setAppTheme(theme)
    await window.api.appTheme.set(theme)
  }

  const handleResetAppTheme = async (): Promise<void> => {
    setAppTheme({ ...DEFAULT_APP_THEME })
    await window.api.appTheme.reset()
  }

  const handleCommunityDownload = async (theme: CommunityTheme): Promise<void> => {
    await window.api.community.download(theme.id)
    loadThemes()
  }

  const handleCommunityFavorite = async (theme: CommunityTheme): Promise<void> => {
    await window.api.community.favorite(theme.id)
    loadCommunity()
  }

  const handleCommunityRate = async (theme: CommunityTheme, rating: number): Promise<void> => {
    await window.api.community.rate(theme.id, rating)
    loadCommunity()
  }

  const handleUploadTheme = async (): Promise<void> => {
    // TODO: Show a theme selection dialog to pick which theme to upload.
    // For now, upload the current app theme as a community theme.
    const themePayload = {
      name: appTheme.fontMono ?? 'My Theme',
      appTheme
    }
    await window.api.community.upload(themePayload)
    loadCommunity()
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-mono text-2xl font-bold tracking-tight text-foreground">
            Themes
          </h1>
          <p className="mt-1 font-mono text-sm text-muted-foreground">
            Browse, import, and manage terminal themes across all terminals
          </p>
        </div>
      </div>

      <Separator />

      <Tabs defaultValue="wt-themes" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="wt-themes" className="gap-1.5 font-mono text-xs">
            <Monitor className="h-3.5 w-3.5" />
            Windows Terminal
          </TabsTrigger>
          <TabsTrigger value="hyper-themes" className="gap-1.5 font-mono text-xs">
            <Sparkles className="h-3.5 w-3.5" />
            Hyper Themes
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-1.5 font-mono text-xs">
            <Paintbrush className="h-3.5 w-3.5" />
            HyperSkin Appearance
          </TabsTrigger>
          <TabsTrigger value="community" className="gap-1.5 font-mono text-xs">
            <Globe className="h-3.5 w-3.5" />
            Community
          </TabsTrigger>
        </TabsList>

        {/* ---- Windows Terminal Themes ---- */}
        <TabsContent value="wt-themes" className="space-y-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="gap-2 font-mono text-xs"
              onClick={handleImportWtThemes}
              disabled={importing}
            >
              {importing ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
              Import from windowsterminalthemes.dev
            </Button>
            <Button
              variant="outline"
              className="gap-2 font-mono text-xs"
              onClick={handleImportJson}
            >
              <Upload className="h-3.5 w-3.5" />
              Import JSON
            </Button>
            <Button
              variant="outline"
              className="gap-2 font-mono text-xs"
              disabled={!selectedWtThemeId}
              onClick={() => selectedWtThemeId && handleExportJson(selectedWtThemeId)}
            >
              <Download className="h-3.5 w-3.5" />
              Export JSON
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <p className="font-mono text-sm text-muted-foreground animate-pulse">
                Loading themes...
              </p>
            </div>
          ) : wtThemes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-terminal-border bg-terminal-bg-card">
                <Palette className="h-10 w-10 text-muted-foreground" />
              </div>
              <h2 className="mb-2 font-mono text-lg font-semibold text-foreground">
                No themes found
              </h2>
              <p className="mb-6 max-w-sm font-mono text-sm text-muted-foreground">
                Import themes from windowsterminalthemes.dev or add a JSON file to get started.
              </p>
              <Button className="gap-2 font-mono" onClick={handleImportWtThemes}>
                <Download className="h-4 w-4" />
                Import Themes
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {wtThemes.map((theme) => (
                <WtThemeCard
                  key={theme.id}
                  theme={theme}
                  onApply={(t) => { setSelectedWtThemeId(t.id); handleApplyTheme(t, 'windows-terminal') }}
                  onSave={handleSaveTheme}
                  onDelete={handleDeleteTheme}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* ---- Hyper Themes ---- */}
        <TabsContent value="hyper-themes" className="space-y-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="gap-2 font-mono text-xs"
              onClick={handleBrowseHyperThemes}
              disabled={importing}
            >
              {importing ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ExternalLink className="h-3.5 w-3.5" />
              )}
              Browse Official Hyper Themes
            </Button>
            <Button
              variant="outline"
              className="gap-2 font-mono text-xs"
              onClick={handleBrowseHyperPlugins}
              disabled={importing}
            >
              <Package className="h-3.5 w-3.5" />
              Browse Official Hyper Plugins
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <p className="font-mono text-sm text-muted-foreground animate-pulse">
                Loading themes...
              </p>
            </div>
          ) : hyperThemes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-terminal-border bg-terminal-bg-card">
                <Sparkles className="h-10 w-10 text-muted-foreground" />
              </div>
              <h2 className="mb-2 font-mono text-lg font-semibold text-foreground">
                No Hyper themes found
              </h2>
              <p className="mb-6 max-w-sm font-mono text-sm text-muted-foreground">
                Browse official Hyper themes from hyper.is to get started.
              </p>
              <Button className="gap-2 font-mono" onClick={handleBrowseHyperThemes}>
                <ExternalLink className="h-4 w-4" />
                Browse Themes
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {hyperThemes.map((theme) => (
                <HyperThemeCard
                  key={theme.id}
                  theme={theme}
                  onInstall={handleInstallHyperTheme}
                  onApply={(t) => handleApplyTheme(t, 'hyper')}
                  onRemove={handleDeleteTheme}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* ---- HyperSkin Appearance ---- */}
        <TabsContent value="appearance">
          <AppearanceTab
            appTheme={appTheme}
            onThemeChange={handleAppThemeChange}
            onReset={handleResetAppTheme}
          />
        </TabsContent>

        {/* ---- Community ---- */}
        <TabsContent value="community" className="space-y-4">
          {!dbConfigured ? (
            <Card className="border-neon-amber/20">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-neon-amber/30 bg-neon-amber/5">
                  <Database className="h-8 w-8 text-neon-amber" />
                </div>
                <h2 className="mb-2 font-mono text-lg font-semibold text-foreground">
                  Database Connection Required
                </h2>
                <p className="mb-4 max-w-md font-mono text-sm text-muted-foreground">
                  Community theme sharing requires a PostgreSQL database connection.
                  Configure your database in Settings to enable community features.
                </p>
                <Badge variant="outline" className="border-neon-amber/30 text-neon-amber font-mono text-xs">
                  Settings &rarr; Database
                </Badge>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search community themes..."
                    className="h-9 pl-9 font-mono text-xs"
                    value={communitySearch}
                    onChange={(e) => setCommunitySearch(e.target.value)}
                  />
                </div>
                <Select
                  value={communitySort}
                  onValueChange={(v) => setCommunitySort(v as typeof communitySort)}
                >
                  <SelectTrigger className="h-9 w-40 font-mono text-xs">
                    <SlidersHorizontal className="mr-1.5 h-3 w-3" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="popular">Popular</SelectItem>
                    <SelectItem value="top-rated">Top Rated</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  className="gap-2 font-mono text-xs"
                  onClick={handleUploadTheme}
                >
                  <Upload className="h-3.5 w-3.5" />
                  Upload Theme
                </Button>
              </div>

              {communityThemes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-terminal-border bg-terminal-bg-card">
                    <Globe className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h2 className="mb-2 font-mono text-lg font-semibold text-foreground">
                    No community themes yet
                  </h2>
                  <p className="mb-6 max-w-sm font-mono text-sm text-muted-foreground">
                    Be the first to share a theme with the community!
                  </p>
                  <Button className="gap-2 font-mono" onClick={handleUploadTheme}>
                    <Upload className="h-4 w-4" />
                    Upload Theme
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {communityThemes.map((theme) => (
                    <CommunityThemeCard
                      key={theme.id}
                      theme={theme}
                      onDownload={handleCommunityDownload}
                      onFavorite={handleCommunityFavorite}
                      onRate={handleCommunityRate}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
