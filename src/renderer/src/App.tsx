import { useState, useEffect } from 'react'
import type { PageId, Greeting } from '@shared/types'
import { Sidebar } from './components/layout/Sidebar'
import { Header } from './components/layout/Header'
import { PageShell } from './components/layout/PageShell'
import { ProjectsPage } from './components/projects/ProjectsPage'
import { TerminalConfigPage } from './components/terminal-config/TerminalConfigPage'
import { HyperConfigPage } from './components/hyper-config/HyperConfigPage'
import { ThemesPage } from './components/themes/ThemesPage'
import { OhMyPoshPage } from './components/oh-my-posh/OhMyPoshPage'
import { ClaudeInstancesPage } from './components/claude/ClaudeInstancesPage'
import { McpPluginsPage } from './components/mcp/McpPluginsPage'
import { UpdatesPage } from './components/updates/UpdatesPage'
import { SettingsPage } from './components/settings/SettingsPage'
import { Toaster } from './components/ui/toaster'
import { WelcomeDialog } from './components/layout/WelcomeDialog'
import { DebugLogViewer } from './components/layout/DebugLogViewer'
import { Bug } from 'lucide-react'

function App(): JSX.Element {
  const [activePage, setActivePage] = useState<PageId>('projects')
  const [greeting, setGreeting] = useState<Greeting | null>(null)
  const [showWelcome, setShowWelcome] = useState(false)
  const [showDebugLog, setShowDebugLog] = useState(false)

  const loadGreeting = (): void => {
    window.api.settings.getGreeting().then((result) => {
      if (result.success && result.data) {
        setGreeting(result.data)
      }
    })
  }

  useEffect(() => {
    loadGreeting()

    // Check if user needs onboarding
    window.api.settings.get().then((result) => {
      if (result.success && result.data) {
        if (result.data.userName === 'Developer') {
          setShowWelcome(true)
        }
      }
    })
  }, [])

  const handleWelcomeComplete = (): void => {
    setShowWelcome(false)
    // Reload greeting and trigger a page refresh
    loadGreeting()
    // Force projects page to re-render by toggling away and back
    setActivePage('settings')
    setTimeout(() => setActivePage('projects'), 0)
  }

  const renderPage = (): JSX.Element => {
    switch (activePage) {
      case 'projects':
        return <ProjectsPage />
      case 'terminal-config':
        return <TerminalConfigPage />
      case 'hyper-config':
        return <HyperConfigPage />
      case 'themes':
        return <ThemesPage />
      case 'oh-my-posh':
        return <OhMyPoshPage />
      case 'claude-instances':
        return <ClaudeInstancesPage />
      case 'mcp-plugins':
        return <McpPluginsPage />
      case 'updates':
        return <UpdatesPage />
      case 'settings':
        return <SettingsPage />
      default:
        return <ProjectsPage />
    }
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-terminal-bg">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header greeting={greeting} />
        <PageShell>{renderPage()}</PageShell>
      </div>
      <Toaster />

      {/* Welcome dialog for first-time setup */}
      <WelcomeDialog open={showWelcome} onComplete={handleWelcomeComplete} />

      {/* Debug log viewer */}
      <DebugLogViewer
        open={showDebugLog}
        onToggle={() => setShowDebugLog(!showDebugLog)}
      />

      {/* Debug log toggle button */}
      <button
        className="fixed bottom-4 right-4 z-50 flex h-9 w-9 items-center justify-center rounded-full border border-terminal-border bg-terminal-bg-card text-muted-foreground shadow-lg transition-colors hover:border-neon-green/30 hover:text-neon-green"
        onClick={() => setShowDebugLog(!showDebugLog)}
        title="Toggle debug log"
      >
        <Bug className="h-4 w-4" />
      </button>
    </div>
  )
}

export default App
