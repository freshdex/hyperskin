import { useState, useEffect, useCallback } from 'react'
import type { UpdateInfo } from '@shared/types'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  RefreshCw,
  CheckCircle2,
  Download,
  ArrowUpCircle,
  ExternalLink,
  Monitor,
  Package,
  Calendar,
  Tag
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Windows Terminal Channel Card                                      */
/* ------------------------------------------------------------------ */

interface WtChannelCardProps {
  channel: string
  description: string
  storeId: string
  color: string
}

function WtChannelCard({ channel, description, storeId, color }: WtChannelCardProps): JSX.Element {
  const handleOpen = (): void => {
    window.open(`ms-windows-store://pdp/?productid=${storeId}`, '_blank')
  }

  return (
    <Card className="transition-all duration-200 hover:border-neon-cyan/30">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Monitor className="h-4 w-4" style={{ color }} />
          <CardTitle className="font-mono text-sm" style={{ color }}>
            {channel}
          </CardTitle>
        </div>
        <CardDescription className="font-mono text-xs">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2 font-mono text-xs"
          onClick={handleOpen}
        >
          <ExternalLink className="h-3 w-3" />
          Open in Microsoft Store
        </Button>
      </CardContent>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/*  Updates Page                                                       */
/* ------------------------------------------------------------------ */

export function UpdatesPage(): JSX.Element {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const checkForUpdates = useCallback(async () => {
    setChecking(true)
    try {
      const result = await window.api.updates.check()
      if (result.success && result.data) {
        setUpdateInfo(result.data)
      }
    } finally {
      setChecking(false)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkForUpdates()
  }, [checkForUpdates])

  const handleDownload = async (): Promise<void> => {
    if (!updateInfo?.releaseUrl) return
    setDownloading(true)
    try {
      window.open(updateInfo.releaseUrl, '_blank')
    } finally {
      setDownloading(false)
    }
  }

  const wtChannels: WtChannelCardProps[] = [
    {
      channel: 'Stable',
      description: 'Recommended for most users. Receives well-tested updates.',
      storeId: '9N0DX20HK701',
      color: '#00d4ff'
    },
    {
      channel: 'Preview',
      description: 'Early access to upcoming features. May contain bugs.',
      storeId: '9N8G5RFZ9XK3',
      color: '#ffaa00'
    },
    {
      channel: 'Canary',
      description: 'Bleeding-edge builds. Expect instability.',
      storeId: '9N3CZBPX4R69',
      color: '#ff0088'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-mono text-2xl font-bold tracking-tight text-foreground">
            Updates
          </h1>
          <p className="mt-1 font-mono text-sm text-muted-foreground">
            Check for HyperSkin updates and manage Windows Terminal installations
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2 font-mono text-sm"
          onClick={checkForUpdates}
          disabled={checking}
        >
          {checking ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Check for Updates
        </Button>
      </div>

      <Separator />

      {/* Current version card */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <p className="font-mono text-sm text-muted-foreground animate-pulse">
            Checking for updates...
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Version display */}
          <Card className="border-neon-green/20">
            <CardContent className="flex items-center gap-6 p-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-neon-green/20 bg-neon-green/5">
                <Package className="h-8 w-8 text-neon-green" />
              </div>
              <div className="flex-1">
                <h2 className="font-mono text-lg font-bold text-foreground">
                  HyperSkin
                </h2>
                <div className="mt-1 flex items-center gap-2">
                  <Badge className="bg-neon-green/10 text-neon-green border-neon-green/30 font-mono text-xs">
                    <Tag className="mr-1 h-3 w-3" />
                    v{updateInfo?.currentVersion ?? '1.0.0'}
                  </Badge>
                  {updateInfo?.hasUpdate ? (
                    <Badge className="bg-neon-amber/10 text-neon-amber border-neon-amber/30 font-mono text-xs">
                      <ArrowUpCircle className="mr-1 h-3 w-3" />
                      Update Available
                    </Badge>
                  ) : (
                    <Badge className="bg-neon-green/10 text-neon-green border-neon-green/30 font-mono text-xs">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Up to Date
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Update available section */}
          {updateInfo?.hasUpdate && (
            <Card className="border-neon-amber/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 font-mono text-base text-neon-amber">
                      <ArrowUpCircle className="h-4 w-4" />
                      Version {updateInfo.latestVersion} Available
                    </CardTitle>
                    {updateInfo.publishedAt && (
                      <CardDescription className="mt-1 flex items-center gap-1 font-mono text-xs">
                        <Calendar className="h-3 w-3" />
                        Released {new Date(updateInfo.publishedAt).toLocaleDateString()}
                      </CardDescription>
                    )}
                  </div>
                  <Button
                    className="gap-2 font-mono text-sm"
                    onClick={handleDownload}
                    disabled={downloading}
                  >
                    {downloading ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    Download Update
                  </Button>
                </div>
              </CardHeader>
              {updateInfo.releaseNotes && (
                <CardContent>
                  <Label className="font-mono text-xs text-muted-foreground mb-2 block">
                    Changelog
                  </Label>
                  <ScrollArea className="h-64 rounded-md border border-terminal-border bg-terminal-bg p-4">
                    <pre className="font-mono text-xs text-muted-foreground whitespace-pre-wrap">
                      {updateInfo.releaseNotes}
                    </pre>
                  </ScrollArea>
                </CardContent>
              )}
            </Card>
          )}

          {/* Up to date message */}
          {updateInfo && !updateInfo.hasUpdate && (
            <Card className="border-neon-green/10">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-neon-green/20 bg-neon-green/5">
                  <CheckCircle2 className="h-8 w-8 text-neon-green" />
                </div>
                <h3 className="font-mono text-lg font-semibold text-foreground">
                  You're up to date!
                </h3>
                <p className="mt-1 font-mono text-sm text-muted-foreground">
                  HyperSkin v{updateInfo.currentVersion} is the latest version.
                </p>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Windows Terminal Channels */}
          <div className="space-y-4">
            <div>
              <h2 className="font-mono text-lg font-semibold text-foreground">
                Windows Terminal Channels
              </h2>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                Install or update Windows Terminal from the Microsoft Store
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {wtChannels.map((ch) => (
                <WtChannelCard key={ch.channel} {...ch} />
              ))}
            </div>
          </div>

          {/* Changelog viewer */}
          {updateInfo?.releaseNotes && !updateInfo.hasUpdate && (
            <>
              <Separator />
              <div className="space-y-4">
                <h2 className="font-mono text-lg font-semibold text-foreground">
                  Current Version Changelog
                </h2>
                <Card>
                  <CardContent className="p-0">
                    <ScrollArea className="h-64 p-4">
                      <pre className="font-mono text-xs text-muted-foreground whitespace-pre-wrap">
                        {updateInfo.releaseNotes}
                      </pre>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

