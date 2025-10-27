import type { Database } from 'better-sqlite3'

export function migrateSupplierPaymentsLedger(db: Database): void {
  // Create supplier payments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS supplier_payments (
      id TEXT PRIMARY KEY,
      supplier_id TEXT NOT NULL REFERENCES suppliers(id),
      account_id TEXT REFERENCES bank_accounts(id),
      user_id TEXT NOT NULL REFERENCES users(id),
      reference_number TEXT NOT NULL UNIQUE,
      amount REAL NOT NULL,
      payment_method TEXT NOT NULL,
      payment_date TEXT NOT NULL,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Create supplier ledger entries table
  db.exec(`
    CREATE TABLE IF NOT EXISTS supplier_ledger_entries (
      id TEXT PRIMARY KEY,
      supplier_id TEXT NOT NULL REFERENCES suppliers(id),
      type TEXT NOT NULL,
      reference_id TEXT,
      reference_number TEXT NOT NULL,
      description TEXT NOT NULL,
      debit REAL DEFAULT 0,
      credit REAL DEFAULT 0,
      balance REAL NOT NULL,
      transaction_date TEXT NOT NULL,
      created_by TEXT REFERENCES users(id),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Create opening balance entries for existing suppliers
  const suppliers = db.prepare('SELECT * FROM suppliers').all() as Array<{
    id: string
    opening_balance: number
    created_at: string
  }>

  const insertLedger = db.prepare(`
    INSERT INTO supplier_ledger_entries (
      id, supplier_id, type, reference_number, description, 
      debit, credit, balance, transaction_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  for (const supplier of suppliers) {
    if (supplier.opening_balance && supplier.opening_balance !== 0) {
      const ledgerId = crypto.randomUUID()
      insertLedger.run(
        ledgerId,
        supplier.id,
        'opening_balance',
        'OPENING',
        'Opening Balance',
        supplier.opening_balance > 0 ? supplier.opening_balance : 0,
        supplier.opening_balance < 0 ? Math.abs(supplier.opening_balance) : 0,
        supplier.opening_balance,
        supplier.created_at?.split('T')[0] || new Date().toISOString().split('T')[0]
      )
    }
  }

  console.log('Supplier payments and ledger tables created successfully')
}
