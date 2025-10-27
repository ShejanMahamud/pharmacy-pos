import { getDatabase } from '../index'

export async function addSupplierAccountingFields(): Promise<void> {
  const db = getDatabase()

  try {
    console.log('Adding accounting fields to suppliers table...')

    // Check if columns already exist
    const tableInfo = db.$client.prepare('PRAGMA table_info(suppliers)').all() as Array<{
      name: string
    }>
    const columnNames = tableInfo.map((col) => col.name)

    // Add opening_balance if it doesn't exist
    if (!columnNames.includes('opening_balance')) {
      db.$client.exec('ALTER TABLE suppliers ADD COLUMN opening_balance REAL DEFAULT 0')
      console.log('Added opening_balance column')
    }

    // Add current_balance if it doesn't exist
    if (!columnNames.includes('current_balance')) {
      db.$client.exec('ALTER TABLE suppliers ADD COLUMN current_balance REAL DEFAULT 0')
      console.log('Added current_balance column')
    }

    // Add total_purchases if it doesn't exist
    if (!columnNames.includes('total_purchases')) {
      db.$client.exec('ALTER TABLE suppliers ADD COLUMN total_purchases REAL DEFAULT 0')
      console.log('Added total_purchases column')
    }

    // Add total_payments if it doesn't exist
    if (!columnNames.includes('total_payments')) {
      db.$client.exec('ALTER TABLE suppliers ADD COLUMN total_payments REAL DEFAULT 0')
      console.log('Added total_payments column')
    }

    // Add credit_limit if it doesn't exist
    if (!columnNames.includes('credit_limit')) {
      db.$client.exec('ALTER TABLE suppliers ADD COLUMN credit_limit REAL DEFAULT 0')
      console.log('Added credit_limit column')
    }

    // Add credit_days if it doesn't exist
    if (!columnNames.includes('credit_days')) {
      db.$client.exec('ALTER TABLE suppliers ADD COLUMN credit_days INTEGER DEFAULT 0')
      console.log('Added credit_days column')
    }

    console.log('Supplier accounting fields migration completed successfully')
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  }
}
