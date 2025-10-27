import { getDatabase } from '../index'

export async function addBankAccountsTable(): Promise<void> {
  const db = getDatabase()

  try {
    console.log('Creating bank_accounts table...')

    // Create bank_accounts table if it doesn't exist
    db.$client.exec(`
      CREATE TABLE IF NOT EXISTS bank_accounts (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        account_type TEXT NOT NULL,
        account_number TEXT,
        bank_name TEXT,
        branch_name TEXT,
        account_holder TEXT,
        opening_balance REAL DEFAULT 0,
        current_balance REAL DEFAULT 0,
        total_deposits REAL DEFAULT 0,
        total_withdrawals REAL DEFAULT 0,
        description TEXT,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `)

    console.log('Bank accounts table created successfully')

    // Insert default accounts
    const existingAccounts = db.$client
      .prepare('SELECT COUNT(*) as count FROM bank_accounts')
      .get() as { count: number }

    if (existingAccounts.count === 0) {
      console.log('Inserting default bank accounts...')

      const defaultAccounts = [
        {
          id: 'cash-' + Date.now(),
          name: 'Cash in Hand',
          account_type: 'cash',
          opening_balance: 0,
          current_balance: 0,
          description: 'Cash transactions'
        },
        {
          id: 'bank-' + Date.now(),
          name: 'Main Bank Account',
          account_type: 'bank',
          opening_balance: 0,
          current_balance: 0,
          description: 'Primary bank account'
        }
      ]

      const insertStmt = db.$client.prepare(`
        INSERT INTO bank_accounts (id, name, account_type, opening_balance, current_balance, description)
        VALUES (?, ?, ?, ?, ?, ?)
      `)

      for (const account of defaultAccounts) {
        insertStmt.run(
          account.id,
          account.name,
          account.account_type,
          account.opening_balance,
          account.current_balance,
          account.description
        )
      }

      console.log('Default bank accounts inserted successfully')
    }

    console.log('Bank accounts table migration completed successfully')
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  }
}
