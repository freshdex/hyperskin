import type { PageId } from '@shared/types'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import {
  FolderOpen,
  Monitor,
  Sparkles,
  Palette,
  Wand2,
  Bot,
  Plug,
  RefreshCw,
  Settings,
  type LucideIcon
} from 'lucide-react'

interface SidebarProps {
  activePage: PageId
  onNavigate: (page: PageId) => void
}

interface NavItem {
  id: PageId
  icon: LucideIcon
  label: string
}

const navItems: NavItem[] = [
  { id: 'projects', icon: FolderOpen, label: 'Projects' },
  { id: 'terminal-config', icon: Monitor, label: 'Windows Terminal' },
  { id: 'hyper-config', icon: Sparkles, label: 'Hyper (Effects)' },
  { id: 'themes', icon: Palette, label: 'Themes' },
  { id: 'oh-my-posh', icon: Wand2, label: 'Oh My Posh' },
  { id: 'claude-instances', icon: Bot, label: 'Claude Instances' },
  { id: 'mcp-plugins', icon: Plug, label: 'MCP & Plugins' },
  { id: 'updates', icon: RefreshCw, label: 'Updates' },
  { id: 'settings', icon: Settings, label: 'Settings' }
]

export function Sidebar({ activePage, onNavigate }: SidebarProps): JSX.Element {
  return (
    <TooltipProvider delayDuration={300}>
      <aside className="flex h-full w-16 flex-col items-center border-r border-terminal-border bg-[#0a0a0f] py-4">
        {/* Logo */}
        <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg font-mono text-sm font-bold text-neon-green select-none">
          HS
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col items-center gap-1">
          {navItems.map((item) => {
            const isActive = activePage === item.id
            const Icon = item.icon

            return (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onNavigate(item.id)}
                    className={cn(
                      'titlebar-no-drag relative flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200',
                      'hover:bg-terminal-bg-light hover:text-foreground',
                      isActive
                        ? 'text-neon-green shadow-[0_0_12px_rgba(0,255,136,0.25)] bg-terminal-bg-light'
                        : 'text-muted-foreground'
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-5 w-5 transition-all duration-200',
                        isActive && 'drop-shadow-[0_0_6px_rgba(0,255,136,0.5)]'
                      )}
                    />
                    {isActive && (
                      <span className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-r-full bg-neon-green shadow-[0_0_8px_rgba(0,255,136,0.6)]" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="font-mono text-xs">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            )
          })}
        </nav>
      </aside>
    </TooltipProvider>
  )
}
