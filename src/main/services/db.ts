import { Pool } from 'pg'
import { appStore } from '../store/app-store'

let pool: Pool | null = null

/**
 * Get or create the PostgreSQL connection pool using settings from electron-store.
 * Returns null if the database feature is not enabled in settings.
 */
export function getPool(): Pool | null {
  const settings = appStore.get('settings')

  if (!settings.dbEnabled) {
    return null
  }

  if (pool) {
    return pool
  }

  pool = new Pool({
    host: settings.dbHost || 'localhost',
    port: settings.dbPort || 5432,
    database: settings.dbName || 'hyperskin',
    user: settings.dbUser || 'hyperskin',
    password: settings.dbPassword || '',
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000
  })

  // Handle pool errors to prevent unhandled rejections
  pool.on('error', (err) => {
    console.error('Unexpected PostgreSQL pool error:', err.message)
  })

  return pool
}

/**
 * Test a database connection with the given configuration.
 * Returns true if the connection succeeds, false otherwise.
 */
export async function testConnection(config: {
  host: string
  port: number
  database: string
  user: string
  password: string
}): Promise<boolean> {
  const testPool = new Pool({
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    password: config.password,
    max: 1,
    connectionTimeoutMillis: 5000
  })

  try {
    const client = await testPool.connect()
    await client.query('SELECT 1')
    client.release()
    await testPool.end()
    return true
  } catch {
    try {
      await testPool.end()
    } catch {
      // Ignore cleanup errors
    }
    return false
  }
}

/**
 * Close the connection pool gracefully.
 * Should be called when the app is shutting down.
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end()
    pool = null
  }
}
