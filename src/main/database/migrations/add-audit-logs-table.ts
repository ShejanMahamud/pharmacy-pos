import Database from 'better-sqlite3'

export function runAuditLogsMigration(db: Database.Database): void {
  console.log('Adding audit logs table...')

  try {
    // Check if audit_logs table exists
    const tableExists = db
      .prepare(
        `
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='audit_logs'
    `
      )
      .get()

    if (!tableExists) {
      // Create audit_logs table
      db.exec(`
        CREATE TABLE IF NOT EXISTS audit_logs (
          id TEXT PRIMARY KEY,
          user_id TEXT REFERENCES users(id),
          username TEXT,
          action TEXT NOT NULL,
          entity_type TEXT NOT NULL,
          entity_id TEXT,
          entity_name TEXT,
          changes TEXT,
          ip_address TEXT,
          user_agent TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
      `)

      // Create indexes for better query performance
      db.exec(`
        CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
        CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
        CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);
        CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
      `)

      console.log('Audit logs table created successfully')
    } else {
      // Table exists, add missing columns if needed
      console.log('Audit logs table exists, checking for missing columns...')

      // Check and add username column
      const usernameExists = db
        .prepare(
          `SELECT COUNT(*) as count FROM pragma_table_info('audit_logs') WHERE name='username'`
        )
        .get() as { count: number }

      if (usernameExists.count === 0) {
        db.exec(`ALTER TABLE audit_logs ADD COLUMN username TEXT;`)
        console.log('Added username column to audit_logs')
      }

      // Check and add entity_name column
      const entityNameExists = db
        .prepare(
          `SELECT COUNT(*) as count FROM pragma_table_info('audit_logs') WHERE name='entity_name'`
        )
        .get() as { count: number }

      if (entityNameExists.count === 0) {
        db.exec(`ALTER TABLE audit_logs ADD COLUMN entity_name TEXT;`)
        console.log('Added entity_name column to audit_logs')
      }

      // Check and add user_agent column
      const userAgentExists = db
        .prepare(
          `SELECT COUNT(*) as count FROM pragma_table_info('audit_logs') WHERE name='user_agent'`
        )
        .get() as { count: number }

      if (userAgentExists.count === 0) {
        db.exec(`ALTER TABLE audit_logs ADD COLUMN user_agent TEXT;`)
        console.log('Added user_agent column to audit_logs')
      }

      console.log('Audit logs table migration completed')
    }
  } catch (error) {
    console.error('Error in audit logs migration:', error)
    throw error
  }
}
