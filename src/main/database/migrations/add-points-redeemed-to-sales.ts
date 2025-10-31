import { getDatabase } from '../index'

export async function addPointsRedeemedToSales(): Promise<void> {
  const db = getDatabase()

  try {
    console.log('Adding points_redeemed field to sales table...')

    // Check if column already exists
    const tableInfo = db.$client.prepare('PRAGMA table_info(sales)').all() as Array<{
      name: string
    }>
    const columnNames = tableInfo.map((col) => col.name)

    // Add points_redeemed if it doesn't exist
    if (!columnNames.includes('points_redeemed')) {
      db.$client.exec('ALTER TABLE sales ADD COLUMN points_redeemed INTEGER DEFAULT 0')
      console.log('Added points_redeemed column to sales table')
    } else {
      console.log('points_redeemed column already exists in sales table')
    }

    console.log('Sales points redeemed migration completed successfully')
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  }
}
