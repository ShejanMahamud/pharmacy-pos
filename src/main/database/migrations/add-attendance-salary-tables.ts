import Database from 'better-sqlite3'

export function addAttendanceSalaryTables(db: Database.Database): void {
  console.log('Adding attendance and salary tables...')

  try {
    // Check if user_salaries table exists
    const userSalariesExists = db
      .prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='user_salaries'`)
      .get()

    if (!userSalariesExists) {
      // Create user_salaries table
      db.exec(`
        CREATE TABLE IF NOT EXISTS user_salaries (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          basic_salary REAL NOT NULL DEFAULT 0,
          allowances REAL DEFAULT 0,
          deductions REAL DEFAULT 0,
          net_salary REAL NOT NULL DEFAULT 0,
          payment_frequency TEXT NOT NULL DEFAULT 'monthly',
          bank_account_number TEXT,
          bank_name TEXT,
          notes TEXT,
          effective_from TEXT NOT NULL,
          created_by TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (created_by) REFERENCES users(id)
        );
      `)
      console.log('user_salaries table created successfully')
    } else {
      console.log('user_salaries table already exists')
    }

    // Check if salary_payments table exists
    const salaryPaymentsExists = db
      .prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='salary_payments'`)
      .get()

    if (!salaryPaymentsExists) {
      // Create salary_payments table
      db.exec(`
        CREATE TABLE IF NOT EXISTS salary_payments (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          salary_id TEXT NOT NULL,
          payment_date TEXT NOT NULL,
          pay_period_start TEXT NOT NULL,
          pay_period_end TEXT NOT NULL,
          basic_amount REAL NOT NULL,
          allowances REAL DEFAULT 0,
          deductions REAL DEFAULT 0,
          bonuses REAL DEFAULT 0,
          total_amount REAL NOT NULL,
          payment_method TEXT NOT NULL,
          account_id TEXT,
          transaction_reference TEXT,
          notes TEXT,
          status TEXT NOT NULL DEFAULT 'paid',
          paid_by TEXT NOT NULL,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (salary_id) REFERENCES user_salaries(id),
          FOREIGN KEY (account_id) REFERENCES bank_accounts(id),
          FOREIGN KEY (paid_by) REFERENCES users(id)
        );
      `)
      console.log('salary_payments table created successfully')
    } else {
      console.log('salary_payments table already exists')
    }

    // Check if attendance table exists
    const attendanceExists = db
      .prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='attendance'`)
      .get()

    if (!attendanceExists) {
      // Create attendance table
      db.exec(`
        CREATE TABLE IF NOT EXISTS attendance (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          date TEXT NOT NULL,
          check_in TEXT,
          check_out TEXT,
          status TEXT NOT NULL,
          leave_type TEXT,
          work_hours REAL DEFAULT 0,
          overtime REAL DEFAULT 0,
          notes TEXT,
          marked_by TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (marked_by) REFERENCES users(id)
        );
      `)
      console.log('attendance table created successfully')

      // Create index for faster queries
      db.exec(`
        CREATE INDEX IF NOT EXISTS idx_attendance_user_date ON attendance(user_id, date);
        CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
      `)
    } else {
      console.log('attendance table already exists')
    }

    // Check if leave_requests table exists
    const leaveRequestsExists = db
      .prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='leave_requests'`)
      .get()

    if (!leaveRequestsExists) {
      // Create leave_requests table
      db.exec(`
        CREATE TABLE IF NOT EXISTS leave_requests (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          leave_type TEXT NOT NULL,
          start_date TEXT NOT NULL,
          end_date TEXT NOT NULL,
          total_days INTEGER NOT NULL,
          reason TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          approved_by TEXT,
          approved_at TEXT,
          rejection_reason TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (approved_by) REFERENCES users(id)
        );
      `)
      console.log('leave_requests table created successfully')

      // Create index for faster queries
      db.exec(`
        CREATE INDEX IF NOT EXISTS idx_leave_requests_user ON leave_requests(user_id);
        CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
      `)
    } else {
      console.log('leave_requests table already exists')
    }

    console.log('Attendance and salary tables migration completed successfully')
  } catch (error) {
    console.error('Error in attendance and salary tables migration:', error)
    throw error
  }
}
