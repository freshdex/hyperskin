import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'

interface PageShellProps {
  children: ReactNode
}

export function PageShell({ children }: PageShellProps): JSX.Element {
  return (
    <ScrollArea className="flex-1">
      <main
        className={cn(
          'animate-in fade-in-0 slide-in-from-bottom-2 duration-300 ease-out',
          'p-6'
        )}
      >
        {children}
      </main>
    </ScrollArea>
  )
}
