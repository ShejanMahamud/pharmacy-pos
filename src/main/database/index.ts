import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { app } from 'electron'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { migrateAddCreatedBy } from './migrations/add-created-by'
import * as schema from './schema'

let db: ReturnType<typeof drizzle>

export function initDatabase() {
  const userDataPath = app.getPath('userData')
  const dbPath = path.join(userDataPath, 'pharmacy.db')

  const sqlite = new Database(dbPath)
  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('foreign_keys = ON')

  db = drizzle(sqlite, { schema })

  // Create tables if they don't exist
  createTables(sqlite)

  // Run migrations
  runMigrations()

  // Initialize default data
  initializeDefaultData()

  return db
}

function runMigrations(): void {
  try {
    console.log('Running database migrations...')
    migrateAddCreatedBy()
    console.log('Database migrations completed successfully')
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

function createTables(sqlite: Database.Database) {
  // Create branches table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS branches (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT NOT NULL UNIQUE,
      address TEXT,
      phone TEXT,
      email TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Create users table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      full_name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      role TEXT NOT NULL,
      branch_id TEXT REFERENCES branches(id),
      created_by TEXT REFERENCES users(id),
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Create categories table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      parent_id TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Create suppliers table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS suppliers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT NOT NULL UNIQUE,
      contact_person TEXT,
      phone TEXT,
      email TEXT,
      address TEXT,
      tax_number TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Create products table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      generic_name TEXT,
      barcode TEXT UNIQUE,
      sku TEXT NOT NULL UNIQUE,
      category_id TEXT REFERENCES categories(id),
      supplier_id TEXT REFERENCES suppliers(id),
      description TEXT,
      manufacturer TEXT,
      unit TEXT NOT NULL,
      prescription_required INTEGER DEFAULT 0,
      reorder_level INTEGER DEFAULT 10,
      selling_price REAL NOT NULL,
      cost_price REAL NOT NULL,
      tax_rate REAL DEFAULT 0,
      discount_percent REAL DEFAULT 0,
      image_url TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Create inventory table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS inventory (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL REFERENCES products(id),
      branch_id TEXT NOT NULL REFERENCES branches(id),
      batch_number TEXT,
      quantity INTEGER NOT NULL DEFAULT 0,
      expiry_date TEXT,
      manufacture_date TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Create customers table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT UNIQUE,
      email TEXT,
      address TEXT,
      date_of_birth TEXT,
      gender TEXT,
      loyalty_points INTEGER DEFAULT 0,
      allergies TEXT,
      notes TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Create sales table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS sales (
      id TEXT PRIMARY KEY,
      invoice_number TEXT NOT NULL UNIQUE,
      branch_id TEXT NOT NULL REFERENCES branches(id),
      customer_id TEXT REFERENCES customers(id),
      user_id TEXT NOT NULL REFERENCES users(id),
      subtotal REAL NOT NULL,
      tax_amount REAL DEFAULT 0,
      discount_amount REAL DEFAULT 0,
      total_amount REAL NOT NULL,
      paid_amount REAL NOT NULL,
      change_amount REAL DEFAULT 0,
      payment_method TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'completed',
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Create sale_items table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS sale_items (
      id TEXT PRIMARY KEY,
      sale_id TEXT NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL REFERENCES products(id),
      product_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      discount_percent REAL DEFAULT 0,
      tax_rate REAL DEFAULT 0,
      subtotal REAL NOT NULL,
      batch_number TEXT,
      expiry_date TEXT
    )
  `)

  // Create purchases table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS purchases (
      id TEXT PRIMARY KEY,
      invoice_number TEXT NOT NULL UNIQUE,
      branch_id TEXT NOT NULL REFERENCES branches(id),
      supplier_id TEXT NOT NULL REFERENCES suppliers(id),
      user_id TEXT NOT NULL REFERENCES users(id),
      subtotal REAL NOT NULL,
      tax_amount REAL DEFAULT 0,
      discount_amount REAL DEFAULT 0,
      total_amount REAL NOT NULL,
      paid_amount REAL DEFAULT 0,
      due_amount REAL DEFAULT 0,
      payment_status TEXT NOT NULL DEFAULT 'pending',
      status TEXT NOT NULL DEFAULT 'received',
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Create purchase_items table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS purchase_items (
      id TEXT PRIMARY KEY,
      purchase_id TEXT NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL REFERENCES products(id),
      product_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      discount_percent REAL DEFAULT 0,
      tax_rate REAL DEFAULT 0,
      subtotal REAL NOT NULL,
      batch_number TEXT,
      expiry_date TEXT,
      manufacture_date TEXT
    )
  `)

  // Create expenses table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      branch_id TEXT NOT NULL REFERENCES branches(id),
      user_id TEXT NOT NULL REFERENCES users(id),
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      description TEXT,
      expense_date TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      receipt TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Create prescriptions table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS prescriptions (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL REFERENCES customers(id),
      sale_id TEXT REFERENCES sales(id),
      doctor_name TEXT,
      doctor_phone TEXT,
      prescription_number TEXT,
      prescription_date TEXT NOT NULL,
      diagnosis TEXT,
      notes TEXT,
      image_url TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Create stock_transfers table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS stock_transfers (
      id TEXT PRIMARY KEY,
      from_branch_id TEXT NOT NULL REFERENCES branches(id),
      to_branch_id TEXT NOT NULL REFERENCES branches(id),
      product_id TEXT NOT NULL REFERENCES products(id),
      quantity INTEGER NOT NULL,
      batch_number TEXT,
      user_id TEXT NOT NULL REFERENCES users(id),
      status TEXT NOT NULL DEFAULT 'pending',
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      completed_at TEXT
    )
  `)

  // Create settings table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY,
      key TEXT NOT NULL UNIQUE,
      value TEXT NOT NULL,
      description TEXT,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Create audit_logs table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      branch_id TEXT REFERENCES branches(id),
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT,
      changes TEXT,
      ip_address TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Create indexes
  sqlite.exec(`
    CREATE INDEX IF NOT EXISTS idx_inventory_product_branch ON inventory(product_id, branch_id);
    CREATE INDEX IF NOT EXISTS idx_sales_branch ON sales(branch_id);
    CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(created_at);
    CREATE INDEX IF NOT EXISTS idx_purchases_branch ON purchases(branch_id);
    CREATE INDEX IF NOT EXISTS idx_purchases_date ON purchases(created_at);
    CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON sale_items(sale_id);
    CREATE INDEX IF NOT EXISTS idx_purchase_items_purchase ON purchase_items(purchase_id);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_date ON audit_logs(created_at);
  `)
}

async function initializeDefaultData() {
  // Check if data already exists
  const existingBranches = db.select().from(schema.branches).all()

  if (existingBranches.length === 0) {
    // Create default branch
    const defaultBranchId = uuidv4()
    db.insert(schema.branches)
      .values({
        id: defaultBranchId,
        name: 'Main Branch',
        code: 'MAIN',
        address: '',
        phone: '',
        email: '',
        isActive: true
      })
      .run()

    // Create default users for each role
    // Note: In production, use bcrypt or similar for password hashing

    // Super Admin
    const superAdminId = uuidv4()
    db.insert(schema.users)
      .values({
        id: superAdminId,
        username: 'superadmin',
        password: 'super123', // Should be hashed in production
        fullName: 'Super Administrator',
        email: 'superadmin@pharmacy.com',
        role: 'super_admin',
        branchId: defaultBranchId,
        isActive: true
      })
      .run()

    // Admin
    const adminId = uuidv4()
    db.insert(schema.users)
      .values({
        id: adminId,
        username: 'admin',
        password: 'admin123', // Should be hashed in production
        fullName: 'Administrator',
        email: 'admin@pharmacy.com',
        role: 'admin',
        branchId: defaultBranchId,
        createdBy: superAdminId,
        isActive: true
      })
      .run()

    // Manager
    const managerId = uuidv4()
    db.insert(schema.users)
      .values({
        id: managerId,
        username: 'manager',
        password: 'manager123', // Should be hashed in production
        fullName: 'Store Manager',
        email: 'manager@pharmacy.com',
        role: 'manager',
        branchId: defaultBranchId,
        createdBy: adminId,
        isActive: true
      })
      .run()

    // Pharmacist
    const pharmacistId = uuidv4()
    db.insert(schema.users)
      .values({
        id: pharmacistId,
        username: 'pharmacist',
        password: 'pharma123', // Should be hashed in production
        fullName: 'John Pharmacist',
        email: 'pharmacist@pharmacy.com',
        role: 'pharmacist',
        branchId: defaultBranchId,
        createdBy: managerId,
        isActive: true
      })
      .run()

    // Cashier
    const cashierId = uuidv4()
    db.insert(schema.users)
      .values({
        id: cashierId,
        username: 'cashier',
        password: 'cashier123', // Should be hashed in production
        fullName: 'Jane Cashier',
        email: 'cashier@pharmacy.com',
        role: 'cashier',
        branchId: defaultBranchId,
        createdBy: managerId,
        isActive: true
      })
      .run()

    // Create default categories
    const categories = [
      { name: 'Analgesics', description: 'Pain relievers' },
      { name: 'Antibiotics', description: 'Antimicrobial medications' },
      { name: 'Vitamins & Supplements', description: 'Nutritional supplements' },
      { name: 'First Aid', description: 'First aid supplies' },
      { name: 'Personal Care', description: 'Personal hygiene products' }
    ]

    categories.forEach((cat) => {
      db.insert(schema.categories)
        .values({
          id: uuidv4(),
          name: cat.name,
          description: cat.description,
          isActive: true
        })
        .run()
    })

    // Create default settings
    const defaultSettings = [
      { key: 'currency', value: 'USD', description: 'Default currency' },
      { key: 'tax_rate', value: '0', description: 'Default tax rate percentage' },
      { key: 'low_stock_alert', value: '10', description: 'Low stock alert threshold' },
      {
        key: 'receipt_header',
        value: 'Pharmacy Management System',
        description: 'Receipt header text'
      },
      {
        key: 'receipt_footer',
        value: 'Thank you for your business!',
        description: 'Receipt footer text'
      }
    ]

    defaultSettings.forEach((setting) => {
      db.insert(schema.settings)
        .values({
          id: uuidv4(),
          key: setting.key,
          value: setting.value,
          description: setting.description
        })
        .run()
    })
  }
}

export function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.')
  }
  return db
}
