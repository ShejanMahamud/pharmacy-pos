import type { Database } from 'better-sqlite3'

export function addMissingOpeningBalances(db: Database): void {
  console.log('Adding missing opening balance ledger entries...')

  // Get all suppliers
  const suppliers = db.prepare('SELECT * FROM suppliers WHERE is_active = 1').all() as Array<{
    id: string
    opening_balance: number
    created_at: string
  }>

  // Check which suppliers don't have opening balance entries
  const checkLedgerEntry = db.prepare(`
    SELECT COUNT(*) as count 
    FROM supplier_ledger_entries 
    WHERE supplier_id = ? AND type = 'opening_balance'
  `)

  const insertLedger = db.prepare(`
    INSERT INTO supplier_ledger_entries (
      id, supplier_id, type, reference_number, description, 
      debit, credit, balance, transaction_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  let addedCount = 0

  for (const supplier of suppliers) {
    // Check if opening balance entry exists
    const result = checkLedgerEntry.get(supplier.id) as { count: number }

    if (result.count === 0 && supplier.opening_balance && supplier.opening_balance !== 0) {
      // No opening balance entry exists, create one
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
      addedCount++
      console.log(`Added opening balance entry for supplier ${supplier.id}`)
    }
  }

  console.log(`Migration complete: Added ${addedCount} opening balance ledger entries`)
}
