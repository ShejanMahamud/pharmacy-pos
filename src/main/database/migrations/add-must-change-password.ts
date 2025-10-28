import { getDatabase } from '../index'

export async function addMustChangePassword(): Promise<void> {
  const db = getDatabase()

  try {
    console.log('Adding must_change_password column to users table...')

    // Check if column exists
    const tableInfo = db.$client.prepare('PRAGMA table_info(users)').all() as Array<{
      name: string
    }>

    const hasMustChangePassword = tableInfo.some((col) => col.name === 'must_change_password')

    if (!hasMustChangePassword) {
      db.$client.exec(`
        ALTER TABLE users ADD COLUMN must_change_password INTEGER DEFAULT 0
      `)
      console.log('must_change_password column added to users table')
    } else {
      console.log('must_change_password column already exists in users table')
    }

    console.log('Must change password migration completed successfully')
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  }
}
