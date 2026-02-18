import { useState, useEffect, useCallback, useRef } from 'react'
import type {
  Project,
  ClaudeLaunchFlags,
  ClaudeModel,
  PermissionMode,
  TerminalTarget
} from '@shared/types'
import {
  DEFAULT_LAUNCH_FLAGS,
  CLAUDE_MODELS,
  PERMISSION_MODES,
  LAUNCH_REMINDER
} from '@shared/defaults'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
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
  FolderOpen,
  FolderSearch,
  Plus,
  Play,
  Settings2,
  Copy,
  GitBranch,
  Monitor,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Info,
  X,
  ImageOff
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Project Card                                                       */
/* ------------------------------------------------------------------ */

interface ProjectCardProps {
  project: Project
  onLaunch: (project: Project) => void
  onCopyCommand: (project: Project) => void
  onUpdate: (project: Project) => void
}

function ProjectCard({
  project,
  onLaunch,
  onCopyCommand,
  onUpdate
}: ProjectCardProps): JSX.Element {
  const [configOpen, setConfigOpen] = useState(false)
  const [flags, setFlags] = useState<ClaudeLaunchFlags>(
    project.claudeFlags ?? { ...DEFAULT_LAUNCH_FLAGS }
  )
  const [hasImage, setHasImage] = useState(false)
  const [imageError, setImageError] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync flags state when project.claudeFlags prop changes
  useEffect(() => {
    setFlags(project.claudeFlags ?? { ...DEFAULT_LAUNCH_FLAGS })
  }, [project.claudeFlags])

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  useEffect(() => {
    window.api.projects.hasImage(project.path).then((result) => {
      if (result.success && result.data) {
        setHasImage(true)
      }
    })
  }, [project.path])

  const imageUrl = `hyperskin-file://project-image?path=${encodeURIComponent(project.path)}`

  const updateFlag = <K extends keyof ClaudeLaunchFlags>(
    key: K,
    value: ClaudeLaunchFlags[K]
  ): void => {
    const next = { ...flags, [key]: value }
    setFlags(next)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      onUpdate({ ...project, claudeFlags: next })
    }, 500)
  }

  const addCustomFlag = (): void => {
    const next = [...(flags.customFlags ?? []), { key: '', value: '' }]
    updateFlag('customFlags', next)
  }

  const updateCustomFlag = (
    idx: number,
    field: 'key' | 'value',
    val: string
  ): void => {
    const next = [...(flags.customFlags ?? [])]
    next[idx] = { ...next[idx], [field]: val }
    updateFlag('customFlags', next)
  }

  const removeCustomFlag = (idx: number): void => {
    const next = (flags.customFlags ?? []).filter((_, i) => i !== idx)
    updateFlag('customFlags', next)
  }

  return (
    <Card className="group relative overflow-hidden transition-all duration-200 hover:border-neon-green/30 hover:shadow-neon-green/10 hover:shadow-lg">
      {/* Project hero image (hyperskin.png from project root) */}
      {hasImage && !imageError ? (
        <div className="relative h-36 w-full overflow-hidden border-b border-terminal-border">
          <img
            src={imageUrl}
            alt={`${project.name} preview`}
            className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-terminal-bg-card/80 to-transparent" />
        </div>
      ) : null}

      <CardHeader className={cn('pb-3', hasImage && !imageError && 'pt-3')}>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="font-mono text-base text-neon-green truncate">
            {project.name}
          </CardTitle>
          <div className="flex shrink-0 items-center gap-1.5">
            {project.gitBranch && (
              <Badge variant="outline" className="gap-1 font-mono text-xs">
                <GitBranch className="h-3 w-3" />
                {project.gitBranch}
              </Badge>
            )}
            <Badge
              variant="secondary"
              className={cn(
                'gap-1 text-xs',
                project.terminalTarget === 'windows-terminal'
                  ? 'bg-neon-cyan/15 text-neon-cyan border-neon-cyan/30'
                  : 'bg-neon-pink/15 text-neon-pink border-neon-pink/30'
              )}
            >
              {project.terminalTarget === 'windows-terminal' ? (
                <Monitor className="h-3 w-3" />
              ) : (
                <Sparkles className="h-3 w-3" />
              )}
              {project.terminalTarget === 'windows-terminal' ? 'WT' : 'Hyper'}
            </Badge>
          </div>
        </div>
        <p className="font-mono text-xs text-muted-foreground truncate">
          {project.path}
        </p>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="flex-1 gap-1.5 font-mono text-xs"
            onClick={() => onLaunch(project)}
          >
            <Play className="h-3.5 w-3.5" />
            Launch
          </Button>
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 font-mono text-xs"
                  onClick={() => setConfigOpen(!configOpen)}
                >
                  <Settings2 className="h-3.5 w-3.5" />
                  Configure
                  {configOpen ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent className="font-mono text-xs">
                Configure launch flags
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 shrink-0"
                  onClick={() => onCopyCommand(project)}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="font-mono text-xs">
                Copy launch command
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Expandable launch config */}
        {configOpen && (
          <div className="space-y-4 rounded-md border border-terminal-border bg-terminal-bg p-4 animate-in slide-in-from-top-2 duration-200">
            <Separator />

            {/* Model */}
            <div className="grid gap-2">
              <Label className="font-mono text-xs text-muted-foreground">
                Model
              </Label>
              <Select
                value={flags.model ?? ''}
                onValueChange={(v) =>
                  updateFlag('model', (v || undefined) as ClaudeModel | undefined)
                }
              >
                <SelectTrigger className="h-8 font-mono text-xs">
                  <SelectValue placeholder="Default" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Default</SelectItem>
                  {CLAUDE_MODELS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Permission Mode */}
            <div className="grid gap-2">
              <Label className="font-mono text-xs text-muted-foreground">
                Permission Mode
              </Label>
              <Select
                value={flags.permissionMode ?? ''}
                onValueChange={(v) =>
                  updateFlag(
                    'permissionMode',
                    (v || undefined) as PermissionMode | undefined
                  )
                }
              >
                <SelectTrigger className="h-8 font-mono text-xs">
                  <SelectValue placeholder="Default" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Default</SelectItem>
                  {PERMISSION_MODES.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Verbose */}
            <div className="flex items-center justify-between">
              <Label className="font-mono text-xs text-muted-foreground">
                Verbose Output
              </Label>
              <Switch
                checked={flags.verbose ?? false}
                onCheckedChange={(v) => updateFlag('verbose', v)}
              />
            </div>

            {/* Max Turns */}
            <div className="grid gap-2">
              <Label className="font-mono text-xs text-muted-foreground">
                Max Turns
              </Label>
              <Input
                type="number"
                placeholder="Unlimited"
                className="h-8 font-mono text-xs"
                value={flags.maxTurns ?? ''}
                onChange={(e) =>
                  updateFlag(
                    'maxTurns',
                    e.target.value ? parseInt(e.target.value, 10) : undefined
                  )
                }
              />
            </div>

            {/* System Prompt */}
            <div className="grid gap-2">
              <Label className="font-mono text-xs text-muted-foreground">
                System Prompt
              </Label>
              <Textarea
                placeholder="Optional system prompt override..."
                className="min-h-[60px] resize-y font-mono text-xs"
                value={flags.systemPrompt ?? ''}
                onChange={(e) =>
                  updateFlag('systemPrompt', e.target.value || undefined)
                }
              />
            </div>

            {/* Custom Flags */}
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label className="font-mono text-xs text-muted-foreground">
                  Custom Flags
                </Label>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 gap-1 px-2 font-mono text-xs"
                  onClick={addCustomFlag}
                >
                  <Plus className="h-3 w-3" />
                  Add
                </Button>
              </div>
              {(flags.customFlags ?? []).map((flag, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    placeholder="--flag"
                    className="h-7 flex-1 font-mono text-xs"
                    value={flag.key}
                    onChange={(e) =>
                      updateCustomFlag(idx, 'key', e.target.value)
                    }
                  />
                  <Input
                    placeholder="value"
                    className="h-7 flex-1 font-mono text-xs"
                    value={flag.value}
                    onChange={(e) =>
                      updateCustomFlag(idx, 'value', e.target.value)
                    }
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => removeCustomFlag(idx)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Tip banner */}
            <div className="flex items-center gap-2 rounded border border-terminal-border bg-terminal-bg-light px-3 py-2">
              <Info className="h-3.5 w-3.5 shrink-0 text-neon-cyan" />
              <p className="font-mono text-[11px] text-muted-foreground">
                {LAUNCH_REMINDER}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/*  Empty State                                                        */
/* ------------------------------------------------------------------ */

interface EmptyStateProps {
  onAddDirectory: () => void
}

function EmptyState({ onAddDirectory }: EmptyStateProps): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-terminal-border bg-terminal-bg-card">
        <FolderOpen className="h-10 w-10 text-muted-foreground" />
      </div>
      <h2 className="mb-2 font-mono text-lg font-semibold text-foreground">
        No projects yet
      </h2>
      <p className="mb-6 max-w-sm font-mono text-sm text-muted-foreground">
        Add a directory to get started. HyperSkin will detect your projects and
        let you launch Claude Code with custom configurations.
      </p>
      <Button className="gap-2 font-mono" onClick={onAddDirectory}>
        <Plus className="h-4 w-4" />
        Add Directory
      </Button>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Projects Page                                                      */
/* ------------------------------------------------------------------ */

export function ProjectsPage(): JSX.Element {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  const loadProjects = useCallback(async () => {
    setLoading(true)
    try {
      const result = await window.api.projects.list()
      if (result.success && result.data) {
        setProjects(result.data)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  const handleScanDirectories = async (): Promise<void> => {
    await window.api.projects.scan([])
    await loadProjects()
  }

  const handleAddDirectory = async (): Promise<void> => {
    await window.api.projects.selectDir()
    await loadProjects()
  }

  const handleLaunch = async (project: Project): Promise<void> => {
    await window.api.launch.project(project.id)
  }

  const handleCopyCommand = async (project: Project): Promise<void> => {
    await window.api.launch.copyCommand(project.id)
  }

  const handleUpdateProject = async (project: Project): Promise<void> => {
    await window.api.projects.update(project.id, project)
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-mono text-2xl font-bold tracking-tight text-foreground">
            Projects
          </h1>
          <p className="mt-1 font-mono text-sm text-muted-foreground">
            Manage your development projects and Claude Code launch configs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="gap-2 font-mono text-sm"
            onClick={handleScanDirectories}
          >
            <FolderSearch className="h-4 w-4" />
            Scan Directories
          </Button>
          <Button
            className="gap-2 font-mono text-sm"
            onClick={handleAddDirectory}
          >
            <Plus className="h-4 w-4" />
            Add Directory
          </Button>
        </div>
      </div>

      <Separator />

      {/* Project grid or empty state */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <p className="font-mono text-sm text-muted-foreground animate-pulse">
            Loading projects...
          </p>
        </div>
      ) : projects.length === 0 ? (
        <EmptyState onAddDirectory={handleAddDirectory} />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onLaunch={handleLaunch}
              onCopyCommand={handleCopyCommand}
              onUpdate={handleUpdateProject}
            />
          ))}
        </div>
      )}
    </div>
  )
}
