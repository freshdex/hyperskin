import type { Greeting } from '@shared/types'
import { cn } from '@/lib/utils'
import { Bell } from 'lucide-react'

interface HeaderProps {
  greeting: Greeting | null
}

export function Header({ greeting }: HeaderProps): JSX.Element {
  return (
    <header
      className={cn(
        'titlebar-drag relative flex h-14 shrink-0 items-center justify-between border-b border-terminal-border bg-terminal-bg-light px-5',
        'scanlines'
      )}
    >
      {/* Left: App name */}
      <div className="titlebar-no-drag flex items-center gap-3">
        <h1 className="font-mono text-base font-semibold tracking-wide text-neon-green">
          HyperSkin
        </h1>
      </div>

      {/* Center/right: Greeting */}
      {greeting && (
        <p className="hidden font-mono text-sm text-muted-foreground sm:block">
          {greeting.message}
        </p>
      )}

      {/* Far right: Notification bell */}
      <div className="titlebar-no-drag flex items-center">
        <button
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-md transition-colors duration-200',
            'text-muted-foreground hover:bg-terminal-bg-card hover:text-foreground'
          )}
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}
