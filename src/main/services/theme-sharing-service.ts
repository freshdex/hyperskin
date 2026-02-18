import { v4 as uuidv4 } from 'uuid'
import type { CommunityTheme, ThemePreset } from '@shared/types'
import { getPool } from './db'
import { appStore } from '../store/app-store'

/**
 * Get or create an anonymous user ID for community interactions.
 * Stored in the electron-store settings.
 */
function getAnonymousUserId(): string {
  const settings = appStore.get('settings') as unknown as Record<string, unknown>
  if (settings._anonymousUserId && typeof settings._anonymousUserId === 'string') {
    return settings._anonymousUserId
  }
  const id = uuidv4()
  appStore.set('settings', { ...appStore.get('settings'), _anonymousUserId: id } as never)
  return id
}

/**
 * Ensure the required database tables exist.
 * Called lazily on first community interaction.
 */
async function ensureTables(): Promise<void> {
  const pool = getPool()
  if (!pool) throw new Error('Database is not enabled. Enable it in Settings.')

  await pool.query(`
    CREATE TABLE IF NOT EXISTS community_themes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      description TEXT DEFAULT '',
      author_name VARCHAR(255) DEFAULT 'Anonymous',
      author_id VARCHAR(255) NOT NULL,
      wt_scheme JSONB,
      hyper_config JSONB,
      rating NUMERIC(3,2) DEFAULT 0,
      rating_count INTEGER DEFAULT 0,
      favorite_count INTEGER DEFAULT 0,
      downloads INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS theme_ratings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      theme_id UUID NOT NULL REFERENCES community_themes(id) ON DELETE CASCADE,
      user_id VARCHAR(255) NOT NULL,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(theme_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS theme_favorites (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      theme_id UUID NOT NULL REFERENCES community_themes(id) ON DELETE CASCADE,
      user_id VARCHAR(255) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(theme_id, user_id)
    );

    CREATE INDEX IF NOT EXISTS idx_community_themes_name ON community_themes(name);
    CREATE INDEX IF NOT EXISTS idx_community_themes_rating ON community_themes(rating DESC);
    CREATE INDEX IF NOT EXISTS idx_community_themes_downloads ON community_themes(downloads DESC);
    CREATE INDEX IF NOT EXISTS idx_community_themes_created ON community_themes(created_at DESC);
  `)
}

/**
 * Map a database row to a CommunityTheme object.
 */
function rowToTheme(row: Record<string, unknown>): CommunityTheme {
  return {
    id: row.id as string,
    name: row.name as string,
    description: (row.description as string) || '',
    authorName: (row.author_name as string) || 'Anonymous',
    wtScheme: row.wt_scheme as CommunityTheme['wtScheme'],
    hyperConfig: row.hyper_config as CommunityTheme['hyperConfig'],
    rating: Number(row.rating) || 0,
    ratingCount: Number(row.rating_count) || 0,
    favoriteCount: Number(row.favorite_count) || 0,
    downloads: Number(row.downloads) || 0,
    createdAt: (row.created_at as Date)?.toISOString() || new Date().toISOString(),
    updatedAt: (row.updated_at as Date)?.toISOString() || new Date().toISOString()
  }
}

/**
 * Browse community themes with pagination and sorting.
 */
export async function browseThemes(
  page: number = 1,
  sortBy: string = 'created_at'
): Promise<CommunityTheme[]> {
  await ensureTables()
  const pool = getPool()
  if (!pool) throw new Error('Database is not enabled')

  const limit = 20
  const offset = (page - 1) * limit

  // Validate sort column to prevent SQL injection
  const validSorts: Record<string, string> = {
    'created_at': 'created_at DESC',
    'rating': 'rating DESC',
    'downloads': 'downloads DESC',
    'name': 'name ASC',
    'favorites': 'favorite_count DESC'
  }
  const orderBy = validSorts[sortBy] || 'created_at DESC'

  const result = await pool.query(
    `SELECT * FROM community_themes ORDER BY ${orderBy} LIMIT $1 OFFSET $2`,
    [limit, offset]
  )

  return result.rows.map(rowToTheme)
}

/**
 * Upload a new theme to the community.
 */
export async function uploadTheme(theme: unknown): Promise<CommunityTheme> {
  await ensureTables()
  const pool = getPool()
  if (!pool) throw new Error('Database is not enabled')

  const t = theme as {
    name?: string
    description?: string
    authorName?: string
    wtScheme?: unknown
    hyperConfig?: unknown
  }

  if (!t.name) {
    throw new Error('Theme name is required')
  }

  const userId = getAnonymousUserId()

  const result = await pool.query(
    `INSERT INTO community_themes (name, description, author_name, author_id, wt_scheme, hyper_config)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      t.name,
      t.description || '',
      t.authorName || 'Anonymous',
      userId,
      t.wtScheme ? JSON.stringify(t.wtScheme) : null,
      t.hyperConfig ? JSON.stringify(t.hyperConfig) : null
    ]
  )

  return rowToTheme(result.rows[0])
}

/**
 * Download a community theme and convert it to a ThemePreset.
 * Increments the download counter.
 */
export async function downloadTheme(id: string): Promise<ThemePreset> {
  await ensureTables()
  const pool = getPool()
  if (!pool) throw new Error('Database is not enabled')

  // Increment download count
  await pool.query(
    'UPDATE community_themes SET downloads = downloads + 1 WHERE id = $1',
    [id]
  )

  const result = await pool.query(
    'SELECT * FROM community_themes WHERE id = $1',
    [id]
  )

  if (result.rows.length === 0) {
    throw new Error(`Theme with id "${id}" not found`)
  }

  const row = result.rows[0]
  const now = new Date().toISOString()

  return {
    id: uuidv4(),
    name: row.name as string,
    description: (row.description as string) || '',
    builtin: false,
    source: 'community',
    wtScheme: row.wt_scheme as ThemePreset['wtScheme'],
    hyperConfig: row.hyper_config as ThemePreset['hyperConfig'],
    createdAt: now,
    updatedAt: now
  }
}

/**
 * Rate a community theme (1-5).
 * Updates or inserts the user's rating and recalculates the average.
 */
export async function rateTheme(themeId: string, rating: number): Promise<void> {
  await ensureTables()
  const pool = getPool()
  if (!pool) throw new Error('Database is not enabled')

  if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    throw new Error('Rating must be an integer between 1 and 5')
  }

  const userId = getAnonymousUserId()

  // Upsert the rating
  await pool.query(
    `INSERT INTO theme_ratings (theme_id, user_id, rating)
     VALUES ($1, $2, $3)
     ON CONFLICT (theme_id, user_id)
     DO UPDATE SET rating = $3`,
    [themeId, userId, rating]
  )

  // Recalculate average rating
  await pool.query(
    `UPDATE community_themes
     SET rating = (SELECT COALESCE(AVG(rating), 0) FROM theme_ratings WHERE theme_id = $1),
         rating_count = (SELECT COUNT(*) FROM theme_ratings WHERE theme_id = $1),
         updated_at = NOW()
     WHERE id = $1`,
    [themeId]
  )
}

/**
 * Add a theme to the user's favorites.
 */
export async function favoriteTheme(themeId: string): Promise<void> {
  await ensureTables()
  const pool = getPool()
  if (!pool) throw new Error('Database is not enabled')

  const userId = getAnonymousUserId()

  await pool.query(
    `INSERT INTO theme_favorites (theme_id, user_id)
     VALUES ($1, $2)
     ON CONFLICT (theme_id, user_id) DO NOTHING`,
    [themeId, userId]
  )

  // Update favorite count
  await pool.query(
    `UPDATE community_themes
     SET favorite_count = (SELECT COUNT(*) FROM theme_favorites WHERE theme_id = $1),
         updated_at = NOW()
     WHERE id = $1`,
    [themeId]
  )
}

/**
 * Remove a theme from the user's favorites.
 */
export async function unfavoriteTheme(themeId: string): Promise<void> {
  await ensureTables()
  const pool = getPool()
  if (!pool) throw new Error('Database is not enabled')

  const userId = getAnonymousUserId()

  await pool.query(
    'DELETE FROM theme_favorites WHERE theme_id = $1 AND user_id = $2',
    [themeId, userId]
  )

  // Update favorite count
  await pool.query(
    `UPDATE community_themes
     SET favorite_count = (SELECT COUNT(*) FROM theme_favorites WHERE theme_id = $1),
         updated_at = NOW()
     WHERE id = $1`,
    [themeId]
  )
}

/**
 * Get the current user's favorited themes.
 */
export async function getMyFavorites(): Promise<CommunityTheme[]> {
  await ensureTables()
  const pool = getPool()
  if (!pool) throw new Error('Database is not enabled')

  const userId = getAnonymousUserId()

  const result = await pool.query(
    `SELECT ct.* FROM community_themes ct
     INNER JOIN theme_favorites tf ON ct.id = tf.theme_id
     WHERE tf.user_id = $1
     ORDER BY tf.created_at DESC`,
    [userId]
  )

  return result.rows.map(rowToTheme)
}

/**
 * Full-text search for community themes by name or description.
 */
export async function searchThemes(query: string): Promise<CommunityTheme[]> {
  await ensureTables()
  const pool = getPool()
  if (!pool) throw new Error('Database is not enabled')

  const searchPattern = `%${query}%`

  const result = await pool.query(
    `SELECT * FROM community_themes
     WHERE name ILIKE $1 OR description ILIKE $1
     ORDER BY rating DESC, downloads DESC
     LIMIT 50`,
    [searchPattern]
  )

  return result.rows.map(rowToTheme)
}
