import { useState, useEffect, useCallback } from 'react'
import type { McpServer, HyperPlugin, Plugin } from '@shared/types'
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
  Search,
  Server,
  Package,
  Puzzle,
  X,
  RefreshCw,
  Download,
  ExternalLink,
  Sparkles
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  MCP Server Card                                                    */
/* ------------------------------------------------------------------ */

interface McpServerCardProps {
  server: McpServer
  onToggle: (server: McpServer) => void
  onRemove: (server: McpServer) => void
}

function McpServerCard({ server, onToggle, onRemove }: McpServerCardProps): JSX.Element {
  return (
    <Card
      className={cn(
        'transition-all duration-200',
        server.enabled
          ? 'border-neon-green/20 hover:border-neon-green/40'
          : 'opacity-60 hover:opacity-80'
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <CardTitle className="flex items-center gap-2 font-mono text-sm text-neon-green">
              <Server className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{server.name}</span>
            </CardTitle>
            <p className="mt-1 font-mono text-xs text-muted-foreground truncate">
              {server.command}
            </p>
          </div>
          <Switch
            checked={server.enabled}
            onCheckedChange={() => onToggle(server)}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-2 pb-3">
        {/* Args */}
        {server.args.length > 0 && (
          <div className="space-y-1">
            <Label className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
              Arguments
            </Label>
            <div className="flex flex-wrap gap-1">
              {server.args.map((arg, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="font-mono text-[10px] bg-terminal-bg"
                >
                  {arg}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {/* Env vars */}
        {server.env && Object.keys(server.env).length > 0 && (
          <div className="space-y-1">
            <Label className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
              Environment
            </Label>
            <div className="space-y-0.5">
              {Object.entries(server.env).map(([key, val]) => (
                <p key={key} className="font-mono text-[10px] text-muted-foreground">
                  <span className="text-neon-cyan">{key}</span>
                  <span className="text-muted-foreground">=</span>
                  <span className="text-foreground">{val}</span>
                </p>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="ml-auto gap-1 font-mono text-xs text-muted-foreground hover:text-destructive"
                onClick={() => onRemove(server)}
              >
                <Trash2 className="h-3 w-3" />
                Remove
              </Button>
            </TooltipTrigger>
            <TooltipContent className="font-mono text-xs">
              Remove MCP server
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardFooter>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/*  Add MCP Server Dialog                                              */
/* ------------------------------------------------------------------ */

interface AddMcpDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (server: Omit<McpServer, 'enabled'>) => void
}

function AddMcpDialog({ open, onOpenChange, onAdd }: AddMcpDialogProps): JSX.Element {
  const [name, setName] = useState('')
  const [command, setCommand] = useState('')
  const [args, setArgs] = useState<string[]>([])
  const [argInput, setArgInput] = useState('')
  const [envPairs, setEnvPairs] = useState<Array<{ key: string; value: string }>>([])

  const handleAddArg = (): void => {
    if (!argInput.trim()) return
    setArgs([...args, argInput.trim()])
    setArgInput('')
  }

  const handleArgKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddArg()
    }
  }

  const handleRemoveArg = (idx: number): void => {
    setArgs(args.filter((_, i) => i !== idx))
  }

  const handleAddEnvPair = (): void => {
    setEnvPairs([...envPairs, { key: '', value: '' }])
  }

  const handleUpdateEnvPair = (idx: number, field: 'key' | 'value', val: string): void => {
    const next = [...envPairs]
    next[idx] = { ...next[idx], [field]: val }
    setEnvPairs(next)
  }

  const handleRemoveEnvPair = (idx: number): void => {
    setEnvPairs(envPairs.filter((_, i) => i !== idx))
  }

  const handleSubmit = (): void => {
    if (!name.trim() || !command.trim()) return
    const env: Record<string, string> = {}
    envPairs.forEach((p) => {
      if (p.key.trim()) env[p.key.trim()] = p.value
    })
    onAdd({
      name: name.trim(),
      command: command.trim(),
      args,
      env: Object.keys(env).length > 0 ? env : undefined
    })
    setName('')
    setCommand('')
    setArgs([])
    setArgInput('')
    setEnvPairs([])
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-mono text-foreground">Add MCP Server</DialogTitle>
          <DialogDescription className="font-mono text-xs">
            Configure a new Model Context Protocol server connection.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label className="font-mono text-xs text-muted-foreground">Name</Label>
            <Input
              placeholder="e.g., filesystem, github, slack..."
              className="font-mono text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Command */}
          <div className="space-y-1.5">
            <Label className="font-mono text-xs text-muted-foreground">Command</Label>
            <Input
              placeholder="e.g., npx, uvx, node..."
              className="font-mono text-sm"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
            />
          </div>

          {/* Args (tag input) */}
          <div className="space-y-1.5">
            <Label className="font-mono text-xs text-muted-foreground">Arguments</Label>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Add argument and press Enter"
                className="flex-1 font-mono text-sm"
                value={argInput}
                onChange={(e) => setArgInput(e.target.value)}
                onKeyDown={handleArgKeyDown}
              />
              <Button
                size="icon"
                variant="outline"
                className="h-10 w-10 shrink-0"
                onClick={handleAddArg}
                disabled={!argInput.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {args.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {args.map((arg, i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="gap-1 font-mono text-[10px] bg-terminal-bg cursor-pointer hover:border-destructive"
                    onClick={() => handleRemoveArg(i)}
                  >
                    {arg}
                    <X className="h-2.5 w-2.5" />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Env Vars (key-value editor) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="font-mono text-xs text-muted-foreground">
                Environment Variables
              </Label>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 gap-1 px-2 font-mono text-xs"
                onClick={handleAddEnvPair}
              >
                <Plus className="h-3 w-3" />
                Add
              </Button>
            </div>
            {envPairs.map((pair, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  placeholder="KEY"
                  className="h-8 flex-1 font-mono text-xs"
                  value={pair.key}
                  onChange={(e) => handleUpdateEnvPair(idx, 'key', e.target.value)}
                />
                <span className="font-mono text-xs text-muted-foreground">=</span>
                <Input
                  placeholder="value"
                  className="h-8 flex-1 font-mono text-xs"
                  value={pair.value}
                  onChange={(e) => handleUpdateEnvPair(idx, 'value', e.target.value)}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => handleRemoveEnvPair(idx)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="font-mono text-xs">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || !command.trim()}
            className="gap-1.5 font-mono text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Server
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ------------------------------------------------------------------ */
/*  Hyper Plugin Card                                                  */
/* ------------------------------------------------------------------ */

interface HyperPluginCardProps {
  plugin: HyperPlugin
  onInstall: (plugin: HyperPlugin) => void
  onUninstall: (plugin: HyperPlugin) => void
}

function HyperPluginCard({ plugin, onInstall, onUninstall }: HyperPluginCardProps): JSX.Element {
  return (
    <Card className="transition-all duration-200 hover:border-neon-pink/30">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <CardTitle className="font-mono text-sm text-neon-pink truncate">
              {plugin.name}
            </CardTitle>
            {plugin.description && (
              <CardDescription className="mt-1 font-mono text-xs line-clamp-2">
                {plugin.description}
              </CardDescription>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <Badge variant="outline" className="font-mono text-[10px]">
              {plugin.version}
            </Badge>
            <Badge
              variant="outline"
              className={cn(
                'font-mono text-[10px]',
                plugin.type === 'theme'
                  ? 'border-neon-amber/30 text-neon-amber'
                  : 'border-neon-cyan/30 text-neon-cyan'
              )}
            >
              {plugin.type === 'theme' ? 'Theme' : 'Plugin'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardFooter className="pt-2">
        {plugin.installed ? (
          <Button
            size="sm"
            variant="outline"
            className="gap-1 font-mono text-xs text-muted-foreground hover:text-destructive hover:border-destructive/50"
            onClick={() => onUninstall(plugin)}
          >
            <Trash2 className="h-3 w-3" />
            Uninstall
          </Button>
        ) : (
          <Button
            size="sm"
            className="gap-1 font-mono text-xs"
            onClick={() => onInstall(plugin)}
          >
            <Download className="h-3 w-3" />
            Install
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/*  Claude Plugin Card                                                 */
/* ------------------------------------------------------------------ */

interface ClaudePluginCardProps {
  plugin: Plugin
  onInstall: (plugin: Plugin) => void
  onUninstall: (plugin: Plugin) => void
}

function ClaudePluginCard({ plugin, onInstall, onUninstall }: ClaudePluginCardProps): JSX.Element {
  return (
    <Card className="transition-all duration-200 hover:border-neon-green/30">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <CardTitle className="font-mono text-sm text-neon-green truncate">
              {plugin.name}
            </CardTitle>
            {plugin.description && (
              <CardDescription className="mt-1 font-mono text-xs line-clamp-2">
                {plugin.description}
              </CardDescription>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {plugin.version && (
              <Badge variant="outline" className="font-mono text-[10px]">
                v{plugin.version}
              </Badge>
            )}
            {plugin.installed && (
              <Badge className="bg-neon-green/10 text-neon-green border-neon-green/30 font-mono text-[10px]">
                Installed
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardFooter className="pt-2">
        {plugin.installed ? (
          <Button
            size="sm"
            variant="outline"
            className="gap-1 font-mono text-xs text-muted-foreground hover:text-destructive hover:border-destructive/50"
            onClick={() => onUninstall(plugin)}
          >
            <Trash2 className="h-3 w-3" />
            Uninstall
          </Button>
        ) : (
          <Button
            size="sm"
            className="gap-1 font-mono text-xs"
            onClick={() => onInstall(plugin)}
          >
            <Download className="h-3 w-3" />
            Install
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/*  MCP & Plugins Page                                                 */
/* ------------------------------------------------------------------ */

export function McpPluginsPage(): JSX.Element {
  const [mcpServers, setMcpServers] = useState<McpServer[]>([])
  const [hyperPlugins, setHyperPlugins] = useState<HyperPlugin[]>([])
  const [marketplacePlugins, setMarketplacePlugins] = useState<HyperPlugin[]>([])
  const [claudePlugins, setClaudePlugins] = useState<Plugin[]>([])
  const [loading, setLoading] = useState(true)
  const [addMcpOpen, setAddMcpOpen] = useState(false)
  const [marketplaceSearch, setMarketplaceSearch] = useState('')
  const [browsingMarketplace, setBrowsingMarketplace] = useState(false)

  const loadMcpServers = useCallback(async () => {
    try {
      const result = await window.api.mcp.list()
      if (result.success && result.data) {
        setMcpServers(result.data)
      }
    } catch {
      // handle error
    }
  }, [])

  const loadHyperPlugins = useCallback(async () => {
    try {
      const result = await window.api.hyperPlugins.listInstalled()
      if (result.success && result.data) {
        setHyperPlugins(result.data)
      }
    } catch {
      // handle error
    }
  }, [])

  const loadClaudePlugins = useCallback(async () => {
    try {
      const result = await window.api.plugins.list()
      if (result.success && result.data) {
        setClaudePlugins(result.data)
      }
    } catch {
      // handle error
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    Promise.all([loadMcpServers(), loadHyperPlugins(), loadClaudePlugins()]).finally(() =>
      setLoading(false)
    )
  }, [loadMcpServers, loadHyperPlugins, loadClaudePlugins])

  /* ---- MCP Actions ---- */

  const handleAddMcp = async (server: Omit<McpServer, 'enabled'>): Promise<void> => {
    await window.api.mcp.add({ ...server, enabled: true })
    loadMcpServers()
  }

  const handleToggleMcp = async (server: McpServer): Promise<void> => {
    await window.api.mcp.toggle(server.name)
    loadMcpServers()
  }

  const handleRemoveMcp = async (server: McpServer): Promise<void> => {
    await window.api.mcp.remove(server.name)
    loadMcpServers()
  }

  /* ---- Hyper Plugin Actions ---- */

  const handleBrowseMarketplace = async (): Promise<void> => {
    setBrowsingMarketplace(true)
    try {
      const result = await window.api.hyperPlugins.browse(marketplaceSearch)
      if (result.success && result.data) {
        setMarketplacePlugins(result.data)
      }
    } finally {
      setBrowsingMarketplace(false)
    }
  }

  const handleInstallHyperPlugin = async (plugin: HyperPlugin): Promise<void> => {
    await window.api.hyperPlugins.install(plugin.name)
    loadHyperPlugins()
    handleBrowseMarketplace()
  }

  const handleUninstallHyperPlugin = async (plugin: HyperPlugin): Promise<void> => {
    await window.api.hyperPlugins.uninstall(plugin.name)
    loadHyperPlugins()
    handleBrowseMarketplace()
  }

  /* ---- Claude Plugin Actions ---- */

  const handleInstallClaudePlugin = async (plugin: Plugin): Promise<void> => {
    await window.api.plugins.install(plugin.name)
    loadClaudePlugins()
  }

  const handleUninstallClaudePlugin = async (plugin: Plugin): Promise<void> => {
    await window.api.plugins.uninstall(plugin.name)
    loadClaudePlugins()
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-mono text-2xl font-bold tracking-tight text-foreground">
            MCP & Plugins
          </h1>
          <p className="mt-1 font-mono text-sm text-muted-foreground">
            Manage MCP servers, Hyper plugins, and Claude plugins
          </p>
        </div>
      </div>

      <Separator />

      <Tabs defaultValue="mcp" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="mcp" className="gap-1.5 font-mono text-xs">
            <Server className="h-3.5 w-3.5" />
            MCP Servers
          </TabsTrigger>
          <TabsTrigger value="hyper-plugins" className="gap-1.5 font-mono text-xs">
            <Sparkles className="h-3.5 w-3.5" />
            Hyper Plugins
          </TabsTrigger>
          <TabsTrigger value="claude-plugins" className="gap-1.5 font-mono text-xs">
            <Puzzle className="h-3.5 w-3.5" />
            Claude Plugins
          </TabsTrigger>
        </TabsList>

        {/* ---- MCP Servers ---- */}
        <TabsContent value="mcp" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-mono text-xs text-muted-foreground">
              {mcpServers.length} server{mcpServers.length !== 1 ? 's' : ''} configured
            </p>
            <Button
              className="gap-2 font-mono text-xs"
              onClick={() => setAddMcpOpen(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              Add MCP Server
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <p className="font-mono text-sm text-muted-foreground animate-pulse">
                Loading servers...
              </p>
            </div>
          ) : mcpServers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-terminal-border bg-terminal-bg-card">
                <Server className="h-10 w-10 text-muted-foreground" />
              </div>
              <h2 className="mb-2 font-mono text-lg font-semibold text-foreground">
                No MCP servers configured
              </h2>
              <p className="mb-6 max-w-sm font-mono text-sm text-muted-foreground">
                Add a Model Context Protocol server to extend Claude's capabilities
                with external tools and data sources.
              </p>
              <Button className="gap-2 font-mono" onClick={() => setAddMcpOpen(true)}>
                <Plus className="h-4 w-4" />
                Add Server
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mcpServers.map((server) => (
                <McpServerCard
                  key={server.name}
                  server={server}
                  onToggle={handleToggleMcp}
                  onRemove={handleRemoveMcp}
                />
              ))}
            </div>
          )}

          <AddMcpDialog
            open={addMcpOpen}
            onOpenChange={setAddMcpOpen}
            onAdd={handleAddMcp}
          />
        </TabsContent>

        {/* ---- Hyper Plugins ---- */}
        <TabsContent value="hyper-plugins" className="space-y-6">
          {/* Installed Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-sm font-semibold text-foreground">
                Installed Plugins
              </h3>
              <Badge variant="outline" className="font-mono text-[10px]">
                {hyperPlugins.length} installed
              </Badge>
            </div>
            {hyperPlugins.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex items-center justify-center py-8">
                  <p className="font-mono text-sm text-muted-foreground">
                    No Hyper plugins installed
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                {hyperPlugins.map((plugin) => (
                  <HyperPluginCard
                    key={plugin.name}
                    plugin={plugin}
                    onInstall={handleInstallHyperPlugin}
                    onUninstall={handleUninstallHyperPlugin}
                  />
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Browse Marketplace Section */}
          <div className="space-y-4">
            <h3 className="font-mono text-sm font-semibold text-foreground">
              Browse Marketplace
            </h3>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search Hyper plugins..."
                  className="h-9 pl-9 font-mono text-xs"
                  value={marketplaceSearch}
                  onChange={(e) => setMarketplaceSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleBrowseMarketplace()
                  }}
                />
              </div>
              <Button
                variant="outline"
                className="gap-2 font-mono text-xs"
                onClick={handleBrowseMarketplace}
                disabled={browsingMarketplace}
              >
                {browsingMarketplace ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ExternalLink className="h-3.5 w-3.5" />
                )}
                Browse
              </Button>
            </div>

            {marketplacePlugins.length > 0 && (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                {marketplacePlugins.map((plugin) => (
                  <HyperPluginCard
                    key={plugin.name}
                    plugin={plugin}
                    onInstall={handleInstallHyperPlugin}
                    onUninstall={handleUninstallHyperPlugin}
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ---- Claude Plugins ---- */}
        <TabsContent value="claude-plugins" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-mono text-xs text-muted-foreground">
              {claudePlugins.filter((p) => p.installed).length} of {claudePlugins.length} plugin{claudePlugins.length !== 1 ? 's' : ''} installed
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <p className="font-mono text-sm text-muted-foreground animate-pulse">
                Loading plugins...
              </p>
            </div>
          ) : claudePlugins.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-terminal-border bg-terminal-bg-card">
                <Puzzle className="h-10 w-10 text-muted-foreground" />
              </div>
              <h2 className="mb-2 font-mono text-lg font-semibold text-foreground">
                No Claude plugins available
              </h2>
              <p className="mb-6 max-w-sm font-mono text-sm text-muted-foreground">
                Claude plugins extend functionality with additional capabilities.
                Check back later for available plugins.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {claudePlugins.map((plugin) => (
                <ClaudePluginCard
                  key={plugin.name}
                  plugin={plugin}
                  onInstall={handleInstallClaudePlugin}
                  onUninstall={handleUninstallClaudePlugin}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
