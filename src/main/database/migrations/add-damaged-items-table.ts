import type { Database } from 'better-sqlite3'

export function addDamagedItemsTable(db: Database): void {
  console.log('Adding damaged_items table...')

  try {
    // Check if table exists
    const tableExists = db
      .prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='damaged_items'`)
      .get()

    if (!tableExists) {
      // Create damaged_items table
      db.exec(`
        CREATE TABLE damaged_items (
          id TEXT PRIMARY KEY,
          product_id TEXT NOT NULL,
          product_name TEXT NOT NULL,
          quantity INTEGER NOT NULL,
          reason TEXT NOT NULL,
          batch_number TEXT,
          expiry_date TEXT,
          notes TEXT,
          reported_by TEXT NOT NULL,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (product_id) REFERENCES products(id),
          FOREIGN KEY (reported_by) REFERENCES users(id)
        )
      `)

      console.log('damaged_items table created successfully')
    } else {
      console.log('damaged_items table already exists')
    }

    console.log('Damaged items table migration completed successfully')
  } catch (error) {
    console.error('Failed to add damaged_items table:', error)
    throw error
  }
}
