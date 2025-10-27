import { getDatabase } from '../index'

export async function addAccountToPurchases(): Promise<void> {
  const db = getDatabase()

  try {
    console.log('Adding account_id to purchases table...')

    // Check if column exists
    const tableInfo = db.$client.prepare('PRAGMA table_info(purchases)').all() as Array<{
      name: string
    }>

    const hasAccountId = tableInfo.some((col) => col.name === 'account_id')

    if (!hasAccountId) {
      db.$client.exec(`
        ALTER TABLE purchases ADD COLUMN account_id TEXT REFERENCES bank_accounts(id)
      `)
      console.log('account_id column added to purchases table')
    } else {
      console.log('account_id column already exists in purchases table')
    }

    // Create purchase_returns table if it doesn't exist
    console.log('Creating purchase_returns table...')

    db.$client.exec(`
      CREATE TABLE IF NOT EXISTS purchase_returns (
        id TEXT PRIMARY KEY,
        return_number TEXT NOT NULL UNIQUE,
        purchase_id TEXT NOT NULL REFERENCES purchases(id),
        supplier_id TEXT NOT NULL REFERENCES suppliers(id),
        account_id TEXT REFERENCES bank_accounts(id),
        user_id TEXT NOT NULL REFERENCES users(id),
        subtotal REAL NOT NULL,
        tax_amount REAL DEFAULT 0,
        discount_amount REAL DEFAULT 0,
        total_amount REAL NOT NULL,
        refund_amount REAL DEFAULT 0,
        refund_status TEXT NOT NULL DEFAULT 'pending',
        reason TEXT,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `)

    console.log('purchase_returns table created successfully')

    // Create purchase_return_items table if it doesn't exist
    console.log('Creating purchase_return_items table...')

    db.$client.exec(`
      CREATE TABLE IF NOT EXISTS purchase_return_items (
        id TEXT PRIMARY KEY,
        return_id TEXT NOT NULL REFERENCES purchase_returns(id) ON DELETE CASCADE,
        purchase_item_id TEXT NOT NULL REFERENCES purchase_items(id),
        product_id TEXT NOT NULL REFERENCES products(id),
        product_name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price REAL NOT NULL,
        discount_percent REAL DEFAULT 0,
        tax_rate REAL DEFAULT 0,
        subtotal REAL NOT NULL,
        batch_number TEXT,
        expiry_date TEXT,
        reason TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `)

    console.log('purchase_return_items table created successfully')
    console.log('Purchase account migration completed successfully')
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  }
}
