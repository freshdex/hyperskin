import { useState, useEffect, useCallback, useMemo } from 'react'
import type { OhMyPoshConfig, OhMyPoshTheme } from '@shared/types'
import { OMP_SHELL_OPTIONS } from '@shared/defaults'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
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
  Wand2,
  Download,
  Check,
  Eye,
  Search,
  ExternalLink,
  Terminal,
  Palette,
  Sparkles,
  CheckCircle2,
  XCircle,
  RefreshCw
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Status Card                                                        */
/* ------------------------------------------------------------------ */

interface StatusCardProps {
  status: OhMyPoshConfig | null
  onInstall: () => void
  onRefresh: () => void
}

function StatusCard({
  status,
  onInstall,
  onRefresh
}: StatusCardProps): JSX.Element {
  return (
    <Card
      className={cn(
        'transition-all',
        status?.installed
          ? 'border-neon-green/20'
          : 'border-neon-amber/20'
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 font-mono text-base">
            <Wand2 className="h-5 w-5 text-neon-green" />
            Oh My Posh Status
          </CardTitle>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 gap-1 font-mono text-xs text-muted-foreground"
            onClick={onRefresh}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {status ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {/* Installed */}
            <div className="space-y-1">
              <Label className="font-mono text-[11px] text-muted-foreground">
                Status
              </Label>
              <div className="flex items-center gap-1.5">
                {status.installed ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-neon-green" />
                    <span className="font-mono text-sm text-neon-green">
                      Installed
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-neon-amber" />
                    <span className="font-mono text-sm text-neon-amber">
                      Not Installed
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Executable Path */}
            {status.installed && status.executablePath && (
              <div className="space-y-1">
                <Label className="font-mono text-[11px] text-muted-foreground">
                  Executable
                </Label>
                <p className="truncate font-mono text-xs text-foreground">
                  {status.executablePath}
                </p>
              </div>
            )}

            {/* Active Theme */}
            {status.installed && (
              <div className="space-y-1">
                <Label className="font-mono text-[11px] text-muted-foreground">
                  Active Theme
                </Label>
                <p className="font-mono text-sm text-foreground">
                  {status.activeTheme ?? 'None'}
                </p>
              </div>
            )}

            {/* Shell Integration */}
            {status.installed && (
              <div className="space-y-1">
                <Label className="font-mono text-[11px] text-muted-foreground">
                  Active Shell
                </Label>
                <Badge variant="outline" className="font-mono text-xs">
                  <Terminal className="mr-1 h-3 w-3" />
                  {status.shellIntegration}
                </Badge>
              </div>
            )}

            {/* Install button if not installed */}
            {!status.installed && (
              <div className="col-span-full mt-2">
                <Button
                  className="gap-2 font-mono text-sm"
                  onClick={onInstall}
                >
                  <Download className="h-4 w-4" />
                  Install Oh My Posh
                </Button>
              </div>
            )}
          </div>
        ) : (
          <p className="font-mono text-sm text-muted-foreground animate-pulse">
            Checking Oh My Posh status...
          </p>
        )}
      </CardContent>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/*  Theme Card                                                         */
/* ------------------------------------------------------------------ */

interface ThemeCardProps {
  theme: OhMyPoshTheme
  isActive: boolean
  onApply: (theme: OhMyPoshTheme) => void
  onPreview: (theme: OhMyPoshTheme) => void
}

function ThemeCard({
  theme,
  isActive,
  onApply,
  onPreview
}: ThemeCardProps): JSX.Element {
  return (
    <Card
      className={cn(
        'transition-all duration-200',
        isActive
          ? 'border-neon-green/60 shadow-neon-green'
          : 'hover:border-terminal-border/80'
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="font-mono text-sm text-foreground">
            {theme.name}
          </CardTitle>
          {isActive && (
            <Badge className="gap-1 bg-neon-green/15 text-neon-green border-neon-green/30 text-xs">
              <Check className="h-2.5 w-2.5" />
              Active
            </Badge>
          )}
          {theme.isCustom && (
            <Badge variant="outline" className="text-xs font-mono">
              Custom
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {theme.description && (
          <p className="font-mono text-[11px] text-muted-foreground line-clamp-2">
            {theme.description}
          </p>
        )}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className={cn(
              'flex-1 gap-1.5 font-mono text-xs',
              isActive && 'opacity-50'
            )}
            disabled={isActive}
            onClick={() => onApply(theme)}
          >
            <Check className="h-3 w-3" />
            {isActive ? 'Applied' : 'Apply'}
          </Button>
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 font-mono text-xs"
                  onClick={() => onPreview(theme)}
                >
                  <Eye className="h-3 w-3" />
                  Preview
                </Button>
              </TooltipTrigger>
              <TooltipContent className="font-mono text-xs">
                Preview this theme in the terminal
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export function OhMyPoshPage(): JSX.Element {
  const [status, setStatus] = useState<OhMyPoshConfig | null>(null)
  const [themes, setThemes] = useState<OhMyPoshTheme[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedShell, setSelectedShell] = useState<string>('powershell')
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [statusResult, themesResult] = await Promise.all([
        window.api.omp.getStatus(),
        window.api.omp.listThemes()
      ])
      if (statusResult.success && statusResult.data) {
        setStatus(statusResult.data)
        setSelectedShell(statusResult.data.shellIntegration ?? 'powershell')
      }
      if (themesResult.success && themesResult.data) {
        setThemes(themesResult.data)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleInstall = async (): Promise<void> => {
    await window.api.omp.install()
    loadData()
  }

  const handleApplyTheme = async (theme: OhMyPoshTheme): Promise<void> => {
    await window.api.omp.applyTheme(theme.fileName)
    loadData()
  }

  const handlePreviewTheme = async (theme: OhMyPoshTheme): Promise<void> => {
    await window.api.omp.getPreview(theme.fileName)
  }

  const handleShellChange = async (shell: string): Promise<void> => {
    setSelectedShell(shell)
    await window.api.omp.setShell(shell as OhMyPoshConfig['shellIntegration'])
    loadData()
  }

  const filteredThemes = useMemo(() => {
    if (!searchQuery.trim()) return themes
    const query = searchQuery.toLowerCase()
    return themes.filter(
      (t) =>
        t.name.toLowerCase().includes(query) ||
        (t.description?.toLowerCase().includes(query) ?? false)
    )
  }, [themes, searchQuery])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="font-mono text-sm text-muted-foreground animate-pulse">
          Loading Oh My Posh...
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
            Oh My Posh
          </h1>
          <p className="mt-1 font-mono text-sm text-muted-foreground">
            Customize your terminal prompt with beautiful themes
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2 font-mono text-xs"
          onClick={() =>
            window.open('https://ohmyposh.dev/docs/themes', '_blank')
          }
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Theme Documentation
        </Button>
      </div>

      {/* Status card */}
      <StatusCard
        status={status}
        onInstall={handleInstall}
        onRefresh={loadData}
      />

      <Separator />

      {/* Shell selector and search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="grid gap-2">
          <Label className="font-mono text-xs text-muted-foreground">
            Shell
          </Label>
          <Select value={selectedShell} onValueChange={handleShellChange}>
            <SelectTrigger className="h-9 w-48 font-mono text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {OMP_SHELL_OPTIONS.map((shell) => (
                <SelectItem key={shell} value={shell}>
                  <span className="flex items-center gap-1.5">
                    <Terminal className="h-3 w-3" />
                    {shell.charAt(0).toUpperCase() + shell.slice(1)}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-9 pl-9 font-mono text-xs"
            placeholder="Search themes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="font-mono text-xs text-muted-foreground">
          {filteredThemes.length} theme{filteredThemes.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Theme grid */}
      {filteredThemes.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredThemes.map((theme) => (
            <ThemeCard
              key={theme.fileName}
              theme={theme}
              isActive={status?.activeTheme === theme.fileName}
              onApply={handleApplyTheme}
              onPreview={handlePreviewTheme}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Palette className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-1 font-mono text-base font-semibold text-foreground">
            {searchQuery ? 'No themes match your search' : 'No themes available'}
          </h3>
          <p className="max-w-sm font-mono text-sm text-muted-foreground">
            {searchQuery
              ? 'Try adjusting your search query or clearing the filter.'
              : 'Install Oh My Posh to browse available themes.'}
          </p>
          {searchQuery && (
            <Button
              variant="outline"
              className="mt-4 gap-2 font-mono text-xs"
              onClick={() => setSearchQuery('')}
            >
              Clear Search
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
