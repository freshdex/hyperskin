import { useState, useEffect, useCallback } from 'react'
import type { ClaudeInstance, InstanceStatus } from '@shared/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import {
  Plus,
  Trash2,
  Star,
  Search,
  Terminal,
  RefreshCw,
  FolderOpen,
  CircleDot,
  AlertTriangle,
  HelpCircle,
  Zap
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Status Badge                                                       */
/* ------------------------------------------------------------------ */

interface StatusBadgeProps {
  status: InstanceStatus
}

function StatusBadge({ status }: StatusBadgeProps): JSX.Element {
  return (
    <Badge
      variant="outline"
      className={cn(
        'gap-1 font-mono text-[10px]',
        status === 'active' && 'border-neon-green/40 text-neon-green bg-neon-green/5',
        status === 'rate-limited' && 'border-neon-amber/40 text-neon-amber bg-neon-amber/5',
        status === 'unknown' && 'border-muted-foreground/40 text-muted-foreground bg-muted/20'
      )}
    >
      {status === 'active' && <CircleDot className="h-2.5 w-2.5" />}
      {status === 'rate-limited' && <AlertTriangle className="h-2.5 w-2.5" />}
      {status === 'unknown' && <HelpCircle className="h-2.5 w-2.5" />}
      {status === 'active' ? 'Active' : status === 'rate-limited' ? 'Rate Limited' : 'Unknown'}
    </Badge>
  )
}

/* ------------------------------------------------------------------ */
/*  Instance Card                                                      */
/* ------------------------------------------------------------------ */

interface InstanceCardProps {
  instance: ClaudeInstance
  onSetDefault: (instance: ClaudeInstance) => void
  onRemove: (instance: ClaudeInstance) => void
  onStatusChange: (instance: ClaudeInstance, status: InstanceStatus) => void
}

function InstanceCard({
  instance,
  onSetDefault,
  onRemove,
  onStatusChange
}: InstanceCardProps): JSX.Element {
  const statuses: InstanceStatus[] = ['active', 'rate-limited', 'unknown']

  return (
    <Card
      className={cn(
        'group relative transition-all duration-200 hover:shadow-lg',
        instance.isDefault
          ? 'border-neon-green/30 hover:border-neon-green/50 shadow-neon-green/10'
          : 'hover:border-neon-green/20 hover:shadow-neon-green/5'
      )}
    >
      {/* Default star badge */}
      {instance.isDefault && (
        <div className="absolute -right-1 -top-1">
          <Badge className="gap-1 bg-neon-green text-terminal-bg font-mono text-[10px] shadow-neon-green">
            <Star className="h-2.5 w-2.5 fill-current" />
            Default
          </Badge>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <CardTitle className="font-mono text-base text-neon-green truncate">
              {instance.label}
            </CardTitle>
            <p className="mt-1 font-mono text-xs text-muted-foreground truncate">
              {instance.executablePath}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {instance.version && (
              <Badge variant="outline" className="font-mono text-[10px]">
                v{instance.version}
              </Badge>
            )}
            <StatusBadge status={instance.status} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Status toggle buttons */}
        <div className="space-y-1.5">
          <Label className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
            Status
          </Label>
          <div className="flex items-center gap-1.5">
            {statuses.map((s) => (
              <Button
                key={s}
                size="sm"
                variant={instance.status === s ? 'default' : 'outline'}
                className={cn(
                  'h-7 flex-1 font-mono text-[10px]',
                  instance.status === s && s === 'active' && 'bg-neon-green text-terminal-bg hover:bg-neon-green/90',
                  instance.status === s && s === 'rate-limited' && 'bg-neon-amber text-terminal-bg hover:bg-neon-amber/90',
                  instance.status === s && s === 'unknown' && 'bg-muted text-muted-foreground hover:bg-muted/90'
                )}
                onClick={() => onStatusChange(instance, s)}
              >
                {s === 'active' ? 'Active' : s === 'rate-limited' ? 'Rate Limited' : 'Unknown'}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {!instance.isDefault && (
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 gap-1.5 font-mono text-xs"
                    onClick={() => onSetDefault(instance)}
                  >
                    <Star className="h-3 w-3" />
                    Set as Default
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="font-mono text-xs">
                  Use this instance by default for all projects
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => onRemove(instance)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="font-mono text-xs">
                Remove instance
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/*  Empty State                                                        */
/* ------------------------------------------------------------------ */

interface EmptyStateProps {
  onAutoDetect: () => void
}

function EmptyState({ onAutoDetect }: EmptyStateProps): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-terminal-border bg-terminal-bg-card">
        <Terminal className="h-10 w-10 text-muted-foreground" />
      </div>
      <h2 className="mb-2 font-mono text-lg font-semibold text-foreground">
        No Claude instances configured
      </h2>
      <p className="mb-6 max-w-sm font-mono text-sm text-muted-foreground">
        Add a Claude Code instance manually or use auto-detect to find
        installed instances on your system.
      </p>
      <Button className="gap-2 font-mono" onClick={onAutoDetect}>
        <Search className="h-4 w-4" />
        Auto-Detect Instances
      </Button>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Add Instance Dialog                                                */
/* ------------------------------------------------------------------ */

interface AddInstanceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (label: string, executablePath: string, version?: string) => void
}

function AddInstanceDialog({ open, onOpenChange, onAdd }: AddInstanceDialogProps): JSX.Element {
  const [label, setLabel] = useState('')
  const [executablePath, setExecutablePath] = useState('')
  const [version, setVersion] = useState('')
  const [detecting, setDetecting] = useState(false)

  const handleBrowse = async (): Promise<void> => {
    const result = await window.api.settings.selectFile()
    if (result.success && result.data) {
      setExecutablePath(result.data)
    }
  }

  const handleAutoDetectVersion = async (): Promise<void> => {
    if (!executablePath) return
    setDetecting(true)
    try {
      const result = await window.api.claudeInstances.detect()
      if (result.success && result.data && result.data.length > 0) {
        const detected = result.data[0]
        if (detected.version) setVersion(detected.version)
      }
    } finally {
      setDetecting(false)
    }
  }

  const handleSubmit = (): void => {
    if (!label.trim() || !executablePath.trim()) return
    onAdd(label.trim(), executablePath.trim(), version.trim() || undefined)
    setLabel('')
    setExecutablePath('')
    setVersion('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-mono text-foreground">Add Claude Instance</DialogTitle>
          <DialogDescription className="font-mono text-xs">
            Configure a new Claude Code executable instance.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Label */}
          <div className="space-y-1.5">
            <Label className="font-mono text-xs text-muted-foreground">Label</Label>
            <Input
              placeholder="e.g., Claude Main, Claude Beta..."
              className="font-mono text-sm"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>

          {/* Executable Path */}
          <div className="space-y-1.5">
            <Label className="font-mono text-xs text-muted-foreground">Executable Path</Label>
            <div className="flex items-center gap-2">
              <Input
                placeholder="C:\\Users\\...\\claude.exe"
                className="flex-1 font-mono text-sm"
                value={executablePath}
                onChange={(e) => setExecutablePath(e.target.value)}
              />
              <Button
                size="icon"
                variant="outline"
                className="h-10 w-10 shrink-0"
                onClick={handleBrowse}
              >
                <FolderOpen className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Version */}
          <div className="space-y-1.5">
            <Label className="font-mono text-xs text-muted-foreground">Version</Label>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Auto-detected or manual"
                className="flex-1 font-mono text-sm"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
              />
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 font-mono text-xs shrink-0"
                onClick={handleAutoDetectVersion}
                disabled={detecting || !executablePath}
              >
                {detecting ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                  <Zap className="h-3 w-3" />
                )}
                Detect
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="font-mono text-xs">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!label.trim() || !executablePath.trim()}
            className="gap-1.5 font-mono text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Instance
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ------------------------------------------------------------------ */
/*  Claude Instances Page                                              */
/* ------------------------------------------------------------------ */

export function ClaudeInstancesPage(): JSX.Element {
  const [instances, setInstances] = useState<ClaudeInstance[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [autoDetecting, setAutoDetecting] = useState(false)

  const loadInstances = useCallback(async () => {
    setLoading(true)
    try {
      const result = await window.api.claudeInstances.list()
      if (result.success && result.data) {
        setInstances(result.data)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadInstances()
  }, [loadInstances])

  const handleAutoDetect = async (): Promise<void> => {
    setAutoDetecting(true)
    try {
      const result = await window.api.claudeInstances.detect()
      if (result.success) {
        loadInstances()
      }
    } finally {
      setAutoDetecting(false)
    }
  }

  const handleAdd = async (
    label: string,
    executablePath: string,
    version?: string
  ): Promise<void> => {
    await window.api.claudeInstances.add({ label, executablePath, version })
    loadInstances()
  }

  const handleRemove = async (instance: ClaudeInstance): Promise<void> => {
    await window.api.claudeInstances.remove(instance.id)
    loadInstances()
  }

  const handleSetDefault = async (instance: ClaudeInstance): Promise<void> => {
    await window.api.claudeInstances.setDefault(instance.id)
    loadInstances()
  }

  const handleStatusChange = async (
    instance: ClaudeInstance,
    status: InstanceStatus
  ): Promise<void> => {
    await window.api.claudeInstances.update({ ...instance, status })
    loadInstances()
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-mono text-2xl font-bold tracking-tight text-foreground">
            Claude Instances
          </h1>
          <p className="mt-1 font-mono text-sm text-muted-foreground">
            Manage Claude Code executable instances and their status
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="gap-2 font-mono text-sm"
            onClick={handleAutoDetect}
            disabled={autoDetecting}
          >
            {autoDetecting ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            Auto-Detect
          </Button>
          <Button
            className="gap-2 font-mono text-sm"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add Instance
          </Button>
        </div>
      </div>

      <Separator />

      {/* Instance grid or empty state */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <p className="font-mono text-sm text-muted-foreground animate-pulse">
            Loading instances...
          </p>
        </div>
      ) : instances.length === 0 ? (
        <EmptyState onAutoDetect={handleAutoDetect} />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {instances.map((instance) => (
            <InstanceCard
              key={instance.id}
              instance={instance}
              onSetDefault={handleSetDefault}
              onRemove={handleRemove}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* Add Instance Dialog */}
      <AddInstanceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAdd={handleAdd}
      />
    </div>
  )
}
