import { readdir, stat } from 'fs/promises'
import { existsSync } from 'fs'
import { execSync } from 'child_process'
import { join, basename } from 'path'
import { v4 as uuidv4 } from 'uuid'
import type { Project } from '@shared/types'
import { DEFAULT_LAUNCH_FLAGS } from '@shared/defaults'
import { appStore } from '../store/app-store'

/**
 * Markers that indicate a directory is a project.
 */
const PROJECT_MARKERS = [
  '.git',
  'package.json',
  'Cargo.toml',
  'go.mod',
  'pyproject.toml',
  'setup.py',
  'requirements.txt',
  'pom.xml',
  'build.gradle',
  'CMakeLists.txt',
  'Makefile',
  '.sln',
  'composer.json',
  'Gemfile',
  'mix.exs',
  'pubspec.yaml',
  'deno.json',
  'bun.lockb'
]

/**
 * Check if a directory is a project by looking for known project markers.
 */
async function isProject(dirPath: string): Promise<boolean> {
  for (const marker of PROJECT_MARKERS) {
    if (existsSync(join(dirPath, marker))) {
      return true
    }
  }
  return false
}

/**
 * Detect git info for a project directory.
 * Returns branch name and remote URL if available.
 */
export async function detectGitInfo(
  projectPath: string
): Promise<{ branch?: string; remote?: string }> {
  const result: { branch?: string; remote?: string } = {}

  if (!existsSync(join(projectPath, '.git'))) {
    return result
  }

  try {
    result.branch = execSync('git branch --show-current', {
      cwd: projectPath,
      encoding: 'utf-8',
      timeout: 5000,
      windowsHide: true,
      stdio: ['pipe', 'pipe', 'pipe']
    }).trim()
  } catch {
    // Git command failed
  }

  try {
    result.remote = execSync('git remote get-url origin', {
      cwd: projectPath,
      encoding: 'utf-8',
      timeout: 5000,
      windowsHide: true,
      stdio: ['pipe', 'pipe', 'pipe']
    }).trim()
  } catch {
    // No remote configured
  }

  return result
}

/**
 * Scan a directory for project folders.
 * A project is any sub-directory containing a known project marker
 * (.git, package.json, Cargo.toml, etc.).
 *
 * Only scans one level deep (immediate children of dirPath).
 */
export async function scanDirectory(dirPath: string): Promise<Project[]> {
  if (!existsSync(dirPath)) {
    return []
  }

  const projects: Project[] = []
  const existingProjects = appStore.get('projects')
  const settings = appStore.get('settings')

  try {
    const entries = await readdir(dirPath, { withFileTypes: true })

    for (const entry of entries) {
      if (!entry.isDirectory()) continue

      // Skip hidden directories (except .git which we look for inside children)
      if (entry.name.startsWith('.')) continue

      // Skip common non-project directories
      if (['node_modules', '__pycache__', '.venv', 'venv', 'dist', 'build', 'target', 'out'].includes(entry.name)) {
        continue
      }

      const fullPath = join(dirPath, entry.name)

      if (await isProject(fullPath)) {
        // Check if we already have this project registered
        const existing = existingProjects.find(
          (p) => p.path.toLowerCase() === fullPath.toLowerCase()
        )

        if (existing) {
          // Update git info on existing project
          const gitInfo = await detectGitInfo(fullPath)
          projects.push({
            ...existing,
            gitBranch: gitInfo.branch || existing.gitBranch,
            gitRemote: gitInfo.remote || existing.gitRemote
          })
        } else {
          // Create a new project entry
          const gitInfo = await detectGitInfo(fullPath)

          projects.push({
            id: uuidv4(),
            name: entry.name,
            path: fullPath,
            gitBranch: gitInfo.branch,
            gitRemote: gitInfo.remote,
            terminalTarget: settings.defaultTerminal,
            claudeFlags: { ...DEFAULT_LAUNCH_FLAGS }
          })
        }
      }
    }
  } catch {
    // Could not read directory
  }

  return projects.sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Scan multiple directories for projects and combine the results.
 * Deduplicates by path (case-insensitive on Windows).
 */
export async function scanMultipleDirectories(dirs: string[]): Promise<Project[]> {
  const allProjects: Project[] = []
  const seenPaths = new Set<string>()

  for (const dir of dirs) {
    const projects = await scanDirectory(dir)
    for (const project of projects) {
      const normalizedPath = project.path.toLowerCase()
      if (!seenPaths.has(normalizedPath)) {
        seenPaths.add(normalizedPath)
        allProjects.push(project)
      }
    }
  }

  return allProjects.sort((a, b) => a.name.localeCompare(b.name))
}
