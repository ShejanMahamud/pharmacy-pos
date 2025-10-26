import { getDatabase } from '../index'

export function migrateAddCreatedBy(): void {
  const db = getDatabase()

  try {
    // Check if the column already exists
    const tableInfo = db.$client.prepare('PRAGMA table_info(users)').all() as Array<{
      name: string
    }>
    const hasCreatedBy = tableInfo.some((col) => col.name === 'created_by')

    if (!hasCreatedBy) {
      console.log('Adding created_by column to users table...')
      db.$client.prepare('ALTER TABLE users ADD COLUMN created_by TEXT REFERENCES users(id)').run()
      console.log('Successfully added created_by column')
    } else {
      console.log('created_by column already exists')
    }
  } catch (error) {
    console.error('Migration error:', error)
    throw error
  }
}
