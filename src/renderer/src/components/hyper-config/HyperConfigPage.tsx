import { useState, useEffect, useCallback } from 'react'
import type { HyperConfig, CursorShape, FontWeight } from '@shared/types'
import {
  DEFAULT_HYPER_CONFIG,
  CURSOR_SHAPES_HYPER,
  FONT_WEIGHTS,
  BELL_TYPES,
  ANSI_COLOR_NAMES_HYPER
} from '@shared/defaults'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
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
  Save,
  Palette,
  Type,
  MousePointer2,
  Settings,
  Terminal,
  Sparkles,
  Puzzle,
  Info,
  Plus,
  X,
  Trash2,
  FolderOpen,
  ExternalLink,
  Zap,
  Scan,
  Monitor,
  Binary
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Color Picker Field                                                 */
/* ------------------------------------------------------------------ */

interface ColorFieldProps {
  label: string
  value: string
  onChange: (v: string) => void
}

function ColorField({ label, value, onChange }: ColorFieldProps): JSX.Element {
  return (
    <div className="grid gap-1.5">
      <Label className="font-mono text-[11px] text-muted-foreground">
        {label}
      </Label>
      <div className="flex items-center gap-2">
        <div className="relative">
          <input
            type="color"
            value={value || '#000000'}
            onChange={(e) => onChange(e.target.value)}
            className="h-8 w-8 cursor-pointer rounded border border-terminal-border bg-transparent p-0.5"
          />
        </div>
        <Input
          className="h-8 flex-1 font-mono text-xs"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Colors Tab                                                         */
/* ------------------------------------------------------------------ */

interface ColorsTabProps {
  config: HyperConfig['config']
  onChange: (config: HyperConfig['config']) => void
}

function ColorsTab({ config, onChange }: ColorsTabProps): JSX.Element {
  const update = (key: string, value: string): void => {
    onChange({ ...config, [key]: value })
  }

  const updateColor = (
    key: keyof HyperConfig['config']['colors'],
    value: string
  ): void => {
    onChange({
      ...config,
      colors: { ...config.colors, [key]: value }
    })
  }

  return (
    <div className="space-y-6">
      {/* Main colors */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <ColorField
          label="Foreground"
          value={config.foregroundColor}
          onChange={(v) => update('foregroundColor', v)}
        />
        <ColorField
          label="Background"
          value={config.backgroundColor}
          onChange={(v) => update('backgroundColor', v)}
        />
        <ColorField
          label="Selection"
          value={config.selectionColor}
          onChange={(v) => update('selectionColor', v)}
        />
        <ColorField
          label="Border"
          value={config.borderColor}
          onChange={(v) => update('borderColor', v)}
        />
      </div>

      <Separator />

      {/* ANSI colors grid */}
      <div>
        <h3 className="mb-3 font-mono text-sm font-semibold text-muted-foreground">
          ANSI Colors
        </h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
          {ANSI_COLOR_NAMES_HYPER.map((name) => (
            <ColorField
              key={name}
              label={name}
              value={config.colors[name]}
              onChange={(v) => updateColor(name, v)}
            />
          ))}
        </div>
      </div>

      {/* Preview */}
      <Card>
        <CardContent className="p-4">
          <div
            className="rounded-md px-4 py-3 font-mono text-sm"
            style={{
              backgroundColor: config.backgroundColor,
              color: config.foregroundColor,
              borderLeft: `3px solid ${config.borderColor}`
            }}
          >
            <span style={{ color: config.colors.green }}>user@machine</span>
            <span style={{ color: config.foregroundColor }}>:</span>
            <span style={{ color: config.colors.blue }}>~/projects</span>
            <span style={{ color: config.foregroundColor }}>$ </span>
            <span style={{ color: config.colors.yellow }}>npm </span>
            <span style={{ color: config.foregroundColor }}>run build</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Font & Layout Tab                                                  */
/* ------------------------------------------------------------------ */

interface FontLayoutTabProps {
  config: HyperConfig['config']
  onChange: (config: HyperConfig['config']) => void
}

function FontLayoutTab({
  config,
  onChange
}: FontLayoutTabProps): JSX.Element {
  const update = <K extends keyof HyperConfig['config']>(
    key: K,
    value: HyperConfig['config'][K]
  ): void => {
    onChange({ ...config, [key]: value })
  }

  return (
    <div className="max-w-2xl space-y-5">
      {/* Font Family */}
      <div className="grid gap-2">
        <Label className="font-mono text-xs text-muted-foreground">
          Font Family
        </Label>
        <Input
          className="h-9 font-mono text-xs"
          value={config.fontFamily}
          onChange={(e) => update('fontFamily', e.target.value)}
        />
      </div>

      {/* Font Size */}
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label className="font-mono text-xs text-muted-foreground">
            Font Size
          </Label>
          <span className="font-mono text-xs text-neon-green">
            {config.fontSize}px
          </span>
        </div>
        <Slider
          min={8}
          max={32}
          step={1}
          value={[config.fontSize]}
          onValueChange={([v]) => update('fontSize', v)}
        />
      </div>

      {/* Font Weight */}
      <div className="grid gap-2">
        <Label className="font-mono text-xs text-muted-foreground">
          Font Weight
        </Label>
        <Select
          value={config.fontWeight}
          onValueChange={(v) => update('fontWeight', v as FontWeight)}
        >
          <SelectTrigger className="h-9 font-mono text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONT_WEIGHTS.map((w) => (
              <SelectItem key={w} value={w}>
                {w}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Line Height */}
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label className="font-mono text-xs text-muted-foreground">
            Line Height
          </Label>
          <span className="font-mono text-xs text-neon-green">
            {config.lineHeight.toFixed(1)}
          </span>
        </div>
        <Slider
          min={0.5}
          max={3.0}
          step={0.1}
          value={[config.lineHeight]}
          onValueChange={([v]) => update('lineHeight', v)}
        />
      </div>

      {/* Letter Spacing */}
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label className="font-mono text-xs text-muted-foreground">
            Letter Spacing
          </Label>
          <span className="font-mono text-xs text-neon-green">
            {config.letterSpacing}
          </span>
        </div>
        <Slider
          min={-5}
          max={5}
          step={0.5}
          value={[config.letterSpacing]}
          onValueChange={([v]) => update('letterSpacing', v)}
        />
      </div>

      {/* Padding */}
      <div className="grid gap-2">
        <Label className="font-mono text-xs text-muted-foreground">
          Padding
        </Label>
        <Input
          className="h-9 font-mono text-xs"
          placeholder="12px 14px"
          value={config.padding}
          onChange={(e) => update('padding', e.target.value)}
        />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Cursor Tab                                                         */
/* ------------------------------------------------------------------ */

interface CursorTabProps {
  config: HyperConfig['config']
  onChange: (config: HyperConfig['config']) => void
}

function CursorTab({ config, onChange }: CursorTabProps): JSX.Element {
  const update = <K extends keyof HyperConfig['config']>(
    key: K,
    value: HyperConfig['config'][K]
  ): void => {
    onChange({ ...config, [key]: value })
  }

  return (
    <div className="max-w-2xl space-y-5">
      {/* Cursor Color */}
      <ColorField
        label="Cursor Color"
        value={config.cursorColor}
        onChange={(v) => update('cursorColor', v)}
      />

      {/* Cursor Shape */}
      <div className="grid gap-2">
        <Label className="font-mono text-xs text-muted-foreground">
          Cursor Shape
        </Label>
        <Select
          value={config.cursorShape}
          onValueChange={(v) => update('cursorShape', v as CursorShape)}
        >
          <SelectTrigger className="h-9 font-mono text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CURSOR_SHAPES_HYPER.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Cursor Blink */}
      <div className="flex items-center justify-between">
        <Label className="font-mono text-xs text-muted-foreground">
          Cursor Blink
        </Label>
        <Switch
          checked={config.cursorBlink}
          onCheckedChange={(v) => update('cursorBlink', v)}
        />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Behavior Tab                                                       */
/* ------------------------------------------------------------------ */

interface BehaviorTabProps {
  config: HyperConfig['config']
  onChange: (config: HyperConfig['config']) => void
}

function BehaviorTab({ config, onChange }: BehaviorTabProps): JSX.Element {
  const update = <K extends keyof HyperConfig['config']>(
    key: K,
    value: HyperConfig['config'][K]
  ): void => {
    onChange({ ...config, [key]: value })
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <Label className="font-mono text-xs text-foreground">
            Copy on Select
          </Label>
          <p className="font-mono text-[11px] text-muted-foreground">
            Automatically copy selected text to clipboard
          </p>
        </div>
        <Switch
          checked={config.copyOnSelect}
          onCheckedChange={(v) => update('copyOnSelect', v)}
        />
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <div>
          <Label className="font-mono text-xs text-foreground">
            Quick Edit
          </Label>
          <p className="font-mono text-[11px] text-muted-foreground">
            Right-click to paste from clipboard
          </p>
        </div>
        <Switch
          checked={config.quickEdit}
          onCheckedChange={(v) => update('quickEdit', v)}
        />
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <div>
          <Label className="font-mono text-xs text-foreground">
            WebGL Renderer
          </Label>
          <p className="font-mono text-[11px] text-muted-foreground">
            Use GPU-accelerated rendering for better performance
          </p>
        </div>
        <Switch
          checked={config.webGLRenderer}
          onCheckedChange={(v) => update('webGLRenderer', v)}
        />
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <div>
          <Label className="font-mono text-xs text-foreground">
            Disable Ligatures
          </Label>
          <p className="font-mono text-[11px] text-muted-foreground">
            Turn off font ligatures (e.g. =&gt; to arrow)
          </p>
        </div>
        <Switch
          checked={config.disableLigatures}
          onCheckedChange={(v) => update('disableLigatures', v)}
        />
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <div>
          <Label className="font-mono text-xs text-foreground">
            Preserve CWD
          </Label>
          <p className="font-mono text-[11px] text-muted-foreground">
            Keep current working directory when creating new tabs
          </p>
        </div>
        <Switch
          checked={config.preserveCWD}
          onCheckedChange={(v) => update('preserveCWD', v)}
        />
      </div>

      <Separator />

      {/* Bell */}
      <div className="grid gap-2">
        <Label className="font-mono text-xs text-muted-foreground">
          Bell
        </Label>
        <Select
          value={String(config.bell)}
          onValueChange={(v) =>
            update('bell', v === 'false' ? false : (v as 'SOUND'))
          }
        >
          <SelectTrigger className="h-9 font-mono text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {BELL_TYPES.map((b) => (
              <SelectItem key={b.value} value={b.value}>
                {b.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Shell Tab                                                          */
/* ------------------------------------------------------------------ */

interface ShellTabProps {
  config: HyperConfig['config']
  onChange: (config: HyperConfig['config']) => void
}

function ShellTab({ config, onChange }: ShellTabProps): JSX.Element {
  const update = <K extends keyof HyperConfig['config']>(
    key: K,
    value: HyperConfig['config'][K]
  ): void => {
    onChange({ ...config, [key]: value })
  }

  const [newArgValue, setNewArgValue] = useState('')
  const [newEnvKey, setNewEnvKey] = useState('')
  const [newEnvValue, setNewEnvValue] = useState('')

  const addShellArg = (): void => {
    if (!newArgValue.trim()) return
    update('shellArgs', [...config.shellArgs, newArgValue.trim()])
    setNewArgValue('')
  }

  const removeShellArg = (idx: number): void => {
    update(
      'shellArgs',
      config.shellArgs.filter((_, i) => i !== idx)
    )
  }

  const addEnvVar = (): void => {
    if (!newEnvKey.trim()) return
    update('env', { ...config.env, [newEnvKey.trim()]: newEnvValue })
    setNewEnvKey('')
    setNewEnvValue('')
  }

  const removeEnvVar = (key: string): void => {
    const next = { ...config.env }
    delete next[key]
    update('env', next)
  }

  return (
    <div className="max-w-2xl space-y-5">
      {/* Shell path */}
      <div className="grid gap-2">
        <Label className="font-mono text-xs text-muted-foreground">
          Shell
        </Label>
        <div className="flex items-center gap-2">
          <Input
            className="h-9 flex-1 font-mono text-xs"
            placeholder="C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe"
            value={config.shell}
            onChange={(e) => update('shell', e.target.value)}
          />
          <Button
            size="sm"
            variant="outline"
            className="h-9 shrink-0 gap-1 font-mono text-xs"
            onClick={() =>
              window.api.settings
                .selectFile()
                .then((r) => {
                  if (r.success && r.data) update('shell', r.data)
                })
            }
          >
            <FolderOpen className="h-3.5 w-3.5" />
            Browse
          </Button>
        </div>
      </div>

      <Separator />

      {/* Shell Args */}
      <div className="grid gap-2">
        <Label className="font-mono text-xs text-muted-foreground">
          Shell Arguments
        </Label>
        <div className="flex flex-wrap gap-1.5">
          {config.shellArgs.map((arg, idx) => (
            <Badge
              key={idx}
              variant="outline"
              className="gap-1 font-mono text-xs"
            >
              {arg}
              <button
                onClick={() => removeShellArg(idx)}
                className="ml-0.5 text-muted-foreground hover:text-destructive"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Input
            className="h-8 flex-1 font-mono text-xs"
            placeholder="--nologo"
            value={newArgValue}
            onChange={(e) => setNewArgValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addShellArg()}
          />
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1 font-mono text-xs"
            onClick={addShellArg}
          >
            <Plus className="h-3 w-3" />
            Add
          </Button>
        </div>
      </div>

      <Separator />

      {/* Environment Variables */}
      <div className="grid gap-2">
        <Label className="font-mono text-xs text-muted-foreground">
          Environment Variables
        </Label>
        <div className="space-y-1.5">
          {Object.entries(config.env).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs shrink-0">
                {key}
              </Badge>
              <span className="flex-1 truncate font-mono text-xs text-muted-foreground">
                {value}
              </span>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => removeEnvVar(key)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Input
            className="h-8 flex-1 font-mono text-xs"
            placeholder="KEY"
            value={newEnvKey}
            onChange={(e) => setNewEnvKey(e.target.value)}
          />
          <Input
            className="h-8 flex-1 font-mono text-xs"
            placeholder="value"
            value={newEnvValue}
            onChange={(e) => setNewEnvValue(e.target.value)}
          />
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1 font-mono text-xs"
            onClick={addEnvVar}
          >
            <Plus className="h-3 w-3" />
            Add
          </Button>
        </div>
      </div>

      <Separator />

      {/* Working Directory */}
      <div className="grid gap-2">
        <Label className="font-mono text-xs text-muted-foreground">
          Working Directory
        </Label>
        <div className="flex items-center gap-2">
          <Input
            className="h-9 flex-1 font-mono text-xs"
            placeholder="C:\Users\..."
            value={config.workingDirectory}
            onChange={(e) => update('workingDirectory', e.target.value)}
          />
          <Button
            size="sm"
            variant="outline"
            className="h-9 shrink-0 gap-1 font-mono text-xs"
            onClick={() =>
              window.api.settings
                .selectDir()
                .then((r) => {
                  if (r.success && r.data)
                    update('workingDirectory', r.data)
                })
            }
          >
            <FolderOpen className="h-3.5 w-3.5" />
            Browse
          </Button>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Visual Effects Tab                                                 */
/* ------------------------------------------------------------------ */

const CRT_SCANLINES_CSS = `/* CRT Scanlines */
x-screen x-row {
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.15) 0px,
    rgba(0, 0, 0, 0.15) 1px,
    transparent 1px,
    transparent 2px
  );
}
`

const RETRO_GLOW_CSS = `/* Retro Glow */
x-screen {
  text-shadow: 0 0 5px rgba(0, 255, 136, 0.5);
  filter: brightness(1.1);
}
`

const GLITCH_EFFECT_CSS = `/* Glitch Effect */
@keyframes glitch {
  0% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(-2px, -2px); }
  60% { transform: translate(2px, 2px); }
  80% { transform: translate(2px, -2px); }
  100% { transform: translate(0); }
}
.terminal { animation: glitch 0.3s infinite; }
`

const MATRIX_RAIN_CSS = `/* Matrix Rain Background */
.hyper_main {
  background: linear-gradient(180deg, #000 0%, #001a00 100%);
}
.xterm-viewport {
  background: transparent !important;
}
`

interface EffectSnippet {
  name: string
  css: string
  icon: typeof Scan
}

const EFFECT_SNIPPETS: EffectSnippet[] = [
  { name: 'CRT Scanlines', css: CRT_SCANLINES_CSS, icon: Scan },
  { name: 'Retro Glow', css: RETRO_GLOW_CSS, icon: Zap },
  { name: 'Glitch Effect', css: GLITCH_EFFECT_CSS, icon: Monitor },
  { name: 'Matrix Rain BG', css: MATRIX_RAIN_CSS, icon: Binary }
]

interface VisualEffectsTabProps {
  config: HyperConfig['config']
  onChange: (config: HyperConfig['config']) => void
}

function VisualEffectsTab({
  config,
  onChange
}: VisualEffectsTabProps): JSX.Element {
  const update = <K extends keyof HyperConfig['config']>(
    key: K,
    value: HyperConfig['config'][K]
  ): void => {
    onChange({ ...config, [key]: value })
  }

  const appendToCSS = (snippet: string): void => {
    const current = config.css || ''
    update('css', current ? `${current}\n\n${snippet}` : snippet)
  }

  return (
    <div className="space-y-6">
      {/* Explanation */}
      <Card className="border-neon-amber/20">
        <CardContent className="flex items-start gap-3 p-4">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-neon-amber" />
          <div className="space-y-1">
            <p className="font-mono text-xs text-foreground">
              Custom CSS for visual effects
            </p>
            <p className="font-mono text-[11px] text-muted-foreground">
              The <code className="text-neon-green">css</code> field applies to
              the Hyper window frame. The{' '}
              <code className="text-neon-green">termCSS</code> field applies
              directly to the terminal xterm element. Use these to add CRT
              scanlines, glitch effects, retro glow, and other visual
              customizations not available in Windows Terminal.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Pre-made effect snippets */}
      <div>
        <h3 className="mb-3 font-mono text-sm font-semibold text-muted-foreground">
          Quick Effects
        </h3>
        <div className="flex flex-wrap gap-2">
          {EFFECT_SNIPPETS.map((snippet) => {
            const Icon = snippet.icon
            return (
              <Button
                key={snippet.name}
                size="sm"
                variant="outline"
                className="gap-1.5 font-mono text-xs hover:border-neon-green/50 hover:text-neon-green"
                onClick={() => appendToCSS(snippet.css)}
              >
                <Icon className="h-3.5 w-3.5" />
                {snippet.name}
              </Button>
            )
          })}
        </div>
      </div>

      <Separator />

      {/* CSS textarea */}
      <div className="grid gap-2">
        <Label className="font-mono text-xs text-muted-foreground">
          CSS (Hyper window)
        </Label>
        <Textarea
          className="min-h-[180px] resize-y font-mono text-xs"
          placeholder="/* Custom CSS for the Hyper window frame */"
          value={config.css}
          onChange={(e) => update('css', e.target.value)}
        />
      </div>

      {/* termCSS textarea */}
      <div className="grid gap-2">
        <Label className="font-mono text-xs text-muted-foreground">
          Terminal CSS (xterm element)
        </Label>
        <Textarea
          className="min-h-[180px] resize-y font-mono text-xs"
          placeholder="/* Custom CSS applied directly to the terminal xterm element */"
          value={config.termCSS}
          onChange={(e) => update('termCSS', e.target.value)}
        />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Plugins Tab                                                        */
/* ------------------------------------------------------------------ */

interface PluginsTabProps {
  plugins: string[]
  localPlugins: string[]
  keymaps: Record<string, string>
  onUpdatePlugins: (plugins: string[]) => void
  onUpdateLocalPlugins: (plugins: string[]) => void
  onUpdateKeymaps: (keymaps: Record<string, string>) => void
}

function PluginsTab({
  plugins,
  localPlugins,
  keymaps,
  onUpdatePlugins,
  onUpdateLocalPlugins,
  onUpdateKeymaps
}: PluginsTabProps): JSX.Element {
  const [newPlugin, setNewPlugin] = useState('')
  const [newLocalPlugin, setNewLocalPlugin] = useState('')
  const [newKeymapKey, setNewKeymapKey] = useState('')
  const [newKeymapValue, setNewKeymapValue] = useState('')

  const addPlugin = (): void => {
    if (!newPlugin.trim()) return
    onUpdatePlugins([...plugins, newPlugin.trim()])
    setNewPlugin('')
  }

  const removePlugin = (idx: number): void => {
    onUpdatePlugins(plugins.filter((_, i) => i !== idx))
  }

  const addLocalPlugin = (): void => {
    if (!newLocalPlugin.trim()) return
    onUpdateLocalPlugins([...localPlugins, newLocalPlugin.trim()])
    setNewLocalPlugin('')
  }

  const removeLocalPlugin = (idx: number): void => {
    onUpdateLocalPlugins(localPlugins.filter((_, i) => i !== idx))
  }

  const addKeymap = (): void => {
    if (!newKeymapKey.trim()) return
    onUpdateKeymaps({ ...keymaps, [newKeymapKey.trim()]: newKeymapValue })
    setNewKeymapKey('')
    setNewKeymapValue('')
  }

  const removeKeymap = (key: string): void => {
    const next = { ...keymaps }
    delete next[key]
    onUpdateKeymaps(next)
  }

  return (
    <div className="space-y-6">
      {/* Browse link */}
      <Card className="border-neon-cyan/20">
        <CardContent className="flex items-center gap-3 p-4">
          <Puzzle className="h-4 w-4 text-neon-cyan" />
          <p className="flex-1 font-mono text-xs text-muted-foreground">
            Browse official Hyper plugins and themes at the Hyper marketplace.
          </p>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 font-mono text-xs"
            onClick={() => window.open('https://hyper.is/plugins', '_blank')}
          >
            <ExternalLink className="h-3 w-3" />
            hyper.is/plugins
          </Button>
        </CardContent>
      </Card>

      {/* Plugins */}
      <div className="grid gap-2">
        <Label className="font-mono text-xs text-muted-foreground">
          Plugins
        </Label>
        <div className="flex flex-wrap gap-1.5">
          {plugins.map((p, idx) => (
            <Badge
              key={idx}
              variant="outline"
              className="gap-1 font-mono text-xs"
            >
              {p}
              <button
                onClick={() => removePlugin(idx)}
                className="ml-0.5 text-muted-foreground hover:text-destructive"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </Badge>
          ))}
          {plugins.length === 0 && (
            <p className="font-mono text-[11px] text-muted-foreground">
              No plugins installed
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Input
            className="h-8 flex-1 font-mono text-xs"
            placeholder="hyper-search"
            value={newPlugin}
            onChange={(e) => setNewPlugin(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addPlugin()}
          />
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1 font-mono text-xs"
            onClick={addPlugin}
          >
            <Plus className="h-3 w-3" />
            Add
          </Button>
        </div>
      </div>

      <Separator />

      {/* Local Plugins */}
      <div className="grid gap-2">
        <Label className="font-mono text-xs text-muted-foreground">
          Local Plugins
        </Label>
        <div className="flex flex-wrap gap-1.5">
          {localPlugins.map((p, idx) => (
            <Badge
              key={idx}
              variant="outline"
              className="gap-1 font-mono text-xs"
            >
              {p}
              <button
                onClick={() => removeLocalPlugin(idx)}
                className="ml-0.5 text-muted-foreground hover:text-destructive"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </Badge>
          ))}
          {localPlugins.length === 0 && (
            <p className="font-mono text-[11px] text-muted-foreground">
              No local plugins
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Input
            className="h-8 flex-1 font-mono text-xs"
            placeholder="path/to/local-plugin"
            value={newLocalPlugin}
            onChange={(e) => setNewLocalPlugin(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addLocalPlugin()}
          />
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1 font-mono text-xs"
            onClick={addLocalPlugin}
          >
            <Plus className="h-3 w-3" />
            Add
          </Button>
        </div>
      </div>

      <Separator />

      {/* Keymaps */}
      <div className="grid gap-2">
        <Label className="font-mono text-xs text-muted-foreground">
          Keymaps
        </Label>
        <div className="space-y-1.5">
          {Object.entries(keymaps).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs shrink-0">
                {key}
              </Badge>
              <span className="flex-1 truncate font-mono text-xs text-muted-foreground">
                {value}
              </span>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => removeKeymap(key)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
          {Object.keys(keymaps).length === 0 && (
            <p className="font-mono text-[11px] text-muted-foreground">
              No custom keymaps
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Input
            className="h-8 flex-1 font-mono text-xs"
            placeholder="command"
            value={newKeymapKey}
            onChange={(e) => setNewKeymapKey(e.target.value)}
          />
          <Input
            className="h-8 flex-1 font-mono text-xs"
            placeholder="shortcut"
            value={newKeymapValue}
            onChange={(e) => setNewKeymapValue(e.target.value)}
          />
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1 font-mono text-xs"
            onClick={addKeymap}
          >
            <Plus className="h-3 w-3" />
            Add
          </Button>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export function HyperConfigPage(): JSX.Element {
  const [hyperConfig, setHyperConfig] = useState<HyperConfig>({
    ...DEFAULT_HYPER_CONFIG
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const loadConfig = useCallback(async () => {
    setLoading(true)
    try {
      const result = await window.api.hyperConfig.read()
      if (result.success && result.data) {
        setHyperConfig(result.data)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadConfig()
  }, [loadConfig])

  const handleSave = async (): Promise<void> => {
    setSaving(true)
    try {
      await window.api.hyperConfig.write(hyperConfig)
    } finally {
      setSaving(false)
    }
  }

  const updateConfig = (config: HyperConfig['config']): void => {
    setHyperConfig((prev) => ({ ...prev, config }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="font-mono text-sm text-muted-foreground animate-pulse">
          Loading Hyper configuration...
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
            Hyper Terminal
          </h1>
          <p className="mt-1 font-mono text-sm text-muted-foreground">
            Configure Hyper terminal for visual effects and custom aesthetics
          </p>
        </div>
        <Button
          className="gap-2 font-mono text-sm"
          onClick={handleSave}
          disabled={saving}
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Banner */}
      <Card className="border-neon-pink/20 bg-neon-pink/5">
        <CardContent className="flex items-center gap-3 p-4">
          <Sparkles className="h-5 w-5 shrink-0 text-neon-pink" />
          <p className="font-mono text-xs text-foreground">
            Hyper is used for visual effects (CRT, glitch, retro) not available
            in Windows Terminal. Windows Terminal is the primary terminal for
            daily use.
          </p>
        </CardContent>
      </Card>

      <Separator />

      {/* Tabbed content */}
      <Tabs defaultValue="colors">
        <TabsList className="font-mono flex-wrap">
          <TabsTrigger value="colors" className="gap-1.5 text-xs">
            <Palette className="h-3.5 w-3.5" />
            Colors
          </TabsTrigger>
          <TabsTrigger value="font" className="gap-1.5 text-xs">
            <Type className="h-3.5 w-3.5" />
            Font & Layout
          </TabsTrigger>
          <TabsTrigger value="cursor" className="gap-1.5 text-xs">
            <MousePointer2 className="h-3.5 w-3.5" />
            Cursor
          </TabsTrigger>
          <TabsTrigger value="behavior" className="gap-1.5 text-xs">
            <Settings className="h-3.5 w-3.5" />
            Behavior
          </TabsTrigger>
          <TabsTrigger value="shell" className="gap-1.5 text-xs">
            <Terminal className="h-3.5 w-3.5" />
            Shell
          </TabsTrigger>
          <TabsTrigger value="effects" className="gap-1.5 text-xs">
            <Sparkles className="h-3.5 w-3.5" />
            Visual Effects
          </TabsTrigger>
          <TabsTrigger value="plugins" className="gap-1.5 text-xs">
            <Puzzle className="h-3.5 w-3.5" />
            Plugins
          </TabsTrigger>
        </TabsList>

        <TabsContent value="colors" className="mt-4">
          <ColorsTab config={hyperConfig.config} onChange={updateConfig} />
        </TabsContent>

        <TabsContent value="font" className="mt-4">
          <FontLayoutTab config={hyperConfig.config} onChange={updateConfig} />
        </TabsContent>

        <TabsContent value="cursor" className="mt-4">
          <CursorTab config={hyperConfig.config} onChange={updateConfig} />
        </TabsContent>

        <TabsContent value="behavior" className="mt-4">
          <BehaviorTab config={hyperConfig.config} onChange={updateConfig} />
        </TabsContent>

        <TabsContent value="shell" className="mt-4">
          <ShellTab config={hyperConfig.config} onChange={updateConfig} />
        </TabsContent>

        <TabsContent value="effects" className="mt-4">
          <VisualEffectsTab
            config={hyperConfig.config}
            onChange={updateConfig}
          />
        </TabsContent>

        <TabsContent value="plugins" className="mt-4">
          <PluginsTab
            plugins={hyperConfig.plugins}
            localPlugins={hyperConfig.localPlugins}
            keymaps={hyperConfig.keymaps}
            onUpdatePlugins={(plugins) =>
              setHyperConfig((prev) => ({ ...prev, plugins }))
            }
            onUpdateLocalPlugins={(localPlugins) =>
              setHyperConfig((prev) => ({ ...prev, localPlugins }))
            }
            onUpdateKeymaps={(keymaps) =>
              setHyperConfig((prev) => ({ ...prev, keymaps }))
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
