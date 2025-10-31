import { getDatabase } from '../index'

export async function addCustomerTotalPurchases(): Promise<void> {
  const db = getDatabase()

  try {
    console.log('Adding total_purchases field to customers table...')

    // Check if column already exists
    const tableInfo = db.$client.prepare('PRAGMA table_info(customers)').all() as Array<{
      name: string
    }>
    const columnNames = tableInfo.map((col) => col.name)

    // Add total_purchases if it doesn't exist
    if (!columnNames.includes('total_purchases')) {
      db.$client.exec('ALTER TABLE customers ADD COLUMN total_purchases REAL DEFAULT 0')
      console.log('Added total_purchases column to customers table')
    } else {
      console.log('total_purchases column already exists in customers table')
    }

    console.log('Customer total purchases migration completed successfully')
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  }
}
