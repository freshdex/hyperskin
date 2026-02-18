import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FolderOpen } from 'lucide-react'

interface WelcomeDialogProps {
  open: boolean
  onComplete: () => void
}

export function WelcomeDialog({ open, onComplete }: WelcomeDialogProps): JSX.Element {
  const [userName, setUserName] = useState('')
  const [projectDir, setProjectDir] = useState('C:\\Users\\Admin\\Documents\\GitHub')
  const [submitting, setSubmitting] = useState(false)

  const handleBrowse = async (): Promise<void> => {
    const result = await window.api.settings.selectDir()
    if (result.success && result.data) {
      setProjectDir(result.data)
    }
  }

  const handleSubmit = async (): Promise<void> => {
    if (!userName.trim() || !projectDir.trim()) return
    setSubmitting(true)
    try {
      await window.api.settings.set({
        userName: userName.trim(),
        scanDirectories: [projectDir.trim()]
      })
      await window.api.projects.scan([projectDir.trim()])
      onComplete()
    } catch {
      // Allow retry on error
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open}>
      <DialogContent
        className="sm:max-w-md border-neon-green/30"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="items-center text-center">
          {/* HS Logo */}
          <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-xl border border-neon-green/30 bg-terminal-bg">
            <span className="font-mono text-2xl font-bold text-neon-green tracking-tighter">
              HS
            </span>
          </div>

          <DialogTitle className="font-mono text-xl text-neon-green">
            Welcome to HyperSkin
          </DialogTitle>
          <DialogDescription className="font-mono text-sm text-muted-foreground">
            Let&apos;s set things up
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Step 1: Name */}
          <div className="space-y-2">
            <Label className="font-mono text-xs text-muted-foreground">
              What should we call you?
            </Label>
            <Input
              placeholder="Your name"
              className="font-mono text-sm"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              autoFocus
            />
          </div>

          {/* Step 2: Project Directory */}
          <div className="space-y-2">
            <Label className="font-mono text-xs text-muted-foreground">
              Where are your projects?
            </Label>
            <div className="flex items-center gap-2">
              <Input
                className="flex-1 font-mono text-sm"
                value={projectDir}
                onChange={(e) => setProjectDir(e.target.value)}
              />
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 gap-1.5 font-mono text-xs"
                onClick={handleBrowse}
              >
                <FolderOpen className="h-3.5 w-3.5" />
                Browse
              </Button>
            </div>
          </div>
        </div>

        {/* Get Started button */}
        <Button
          className="w-full gap-2 font-mono text-sm bg-neon-green text-black hover:bg-neon-green/90 font-semibold"
          disabled={!userName.trim() || !projectDir.trim() || submitting}
          onClick={handleSubmit}
        >
          {submitting ? 'Setting up...' : 'Get Started'}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
