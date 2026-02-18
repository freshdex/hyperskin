import { app } from 'electron'
import { net } from 'electron'
import type { UpdateInfo } from '@shared/types'

/** The GitHub repository for HyperSkin releases */
const GITHUB_REPO = 'hyperskin/hyperskin'

/** npm package name for checking the registry */
const NPM_PACKAGE = 'hyperskin'

/**
 * Make an HTTPS GET request and return the response body as a string.
 * Uses Electron's net module which respects proxy settings.
 */
function fetchUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const request = net.request({
      url,
      method: 'GET'
    })

    request.setHeader('User-Agent', `HyperSkin/${app.getVersion()}`)
    request.setHeader('Accept', 'application/vnd.github.v3+json')

    let body = ''

    request.on('response', (response) => {
      response.on('data', (chunk) => {
        body += chunk.toString()
      })
      response.on('end', () => {
        if (response.statusCode && response.statusCode >= 200 && response.statusCode < 300) {
          resolve(body)
        } else {
          reject(new Error(`HTTP ${response.statusCode}: ${body.slice(0, 200)}`))
        }
      })
      response.on('error', reject)
    })

    request.on('error', reject)
    request.end()
  })
}

/**
 * Compare two semver version strings.
 * Returns true if remoteVersion is newer than localVersion.
 */
function isNewer(localVersion: string, remoteVersion: string): boolean {
  const local = localVersion.replace(/^v/, '').split('.').map(Number)
  const remote = remoteVersion.replace(/^v/, '').split('.').map(Number)

  for (let i = 0; i < 3; i++) {
    const l = local[i] || 0
    const r = remote[i] || 0
    if (r > l) return true
    if (r < l) return false
  }
  return false
}

/**
 * Check for updates by querying the GitHub releases API.
 * Falls back to the npm registry if GitHub is unavailable.
 * Compares the latest version with app.getVersion().
 */
export async function checkForUpdates(): Promise<UpdateInfo> {
  const currentVersion = app.getVersion()

  // Try GitHub releases first
  try {
    const body = await fetchUrl(
      `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`
    )
    const release = JSON.parse(body)

    const latestVersion = (release.tag_name as string || '').replace(/^v/, '')

    return {
      currentVersion,
      latestVersion,
      hasUpdate: isNewer(currentVersion, latestVersion),
      releaseNotes: release.body as string || undefined,
      releaseUrl: release.html_url as string || undefined,
      publishedAt: release.published_at as string || undefined
    }
  } catch {
    // GitHub unavailable, try npm registry
  }

  // Fallback: npm registry
  try {
    const body = await fetchUrl(
      `https://registry.npmjs.org/${NPM_PACKAGE}/latest`
    )
    const pkg = JSON.parse(body)
    const latestVersion = pkg.version as string

    return {
      currentVersion,
      latestVersion,
      hasUpdate: isNewer(currentVersion, latestVersion),
      releaseUrl: `https://www.npmjs.com/package/${NPM_PACKAGE}`
    }
  } catch {
    // Neither source is available
  }

  return {
    currentVersion,
    latestVersion: currentVersion,
    hasUpdate: false
  }
}

/**
 * Fetch the changelog from the latest GitHub release.
 * Returns the release body (markdown) or a message if unavailable.
 */
export async function getChangelog(): Promise<string> {
  try {
    const body = await fetchUrl(
      `https://api.github.com/repos/${GITHUB_REPO}/releases`
    )
    const releases = JSON.parse(body)

    if (!Array.isArray(releases) || releases.length === 0) {
      return 'No releases found.'
    }

    // Build a changelog from the most recent releases
    const entries: string[] = []
    const limit = Math.min(releases.length, 10)

    for (let i = 0; i < limit; i++) {
      const release = releases[i]
      const version = (release.tag_name as string) || 'unknown'
      const date = release.published_at
        ? new Date(release.published_at as string).toLocaleDateString()
        : 'unknown date'
      const notes = (release.body as string) || 'No release notes.'

      entries.push(`## ${version} (${date})\n\n${notes}`)
    }

    return entries.join('\n\n---\n\n')
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return `Unable to fetch changelog: ${message}`
  }
}
