import { getDatabase } from '../index'

export function addUnitsTable(): void {
  console.log('Adding units table...')

  const db = getDatabase()
  const sqlite = db.$client

  // Check if table already exists
  const tableExists = sqlite
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='units'")
    .get()

  if (!tableExists) {
    // Create units table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS units (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        symbol TEXT NOT NULL UNIQUE,
        description TEXT,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // Insert default units
    const insertUnit = sqlite.prepare(`
      INSERT INTO units (id, name, symbol, description, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `)

    const defaultUnits = [
      { id: 'unit-1', name: 'Piece', symbol: 'pcs', description: 'Individual pieces or tablets' },
      { id: 'unit-2', name: 'Box', symbol: 'box', description: 'Box containing multiple units' },
      { id: 'unit-3', name: 'Strip', symbol: 'strip', description: 'Blister pack or strip' },
      { id: 'unit-4', name: 'Bottle', symbol: 'btl', description: 'Liquid bottle' },
      { id: 'unit-5', name: 'Vial', symbol: 'vial', description: 'Injectable vial' },
      { id: 'unit-6', name: 'Tube', symbol: 'tube', description: 'Cream or ointment tube' },
      { id: 'unit-7', name: 'Pack', symbol: 'pack', description: 'Package' },
      { id: 'unit-8', name: 'Sachet', symbol: 'sachet', description: 'Single-use sachet' },
      { id: 'unit-9', name: 'Kilogram', symbol: 'kg', description: 'Weight in kilograms' },
      { id: 'unit-10', name: 'Gram', symbol: 'g', description: 'Weight in grams' },
      { id: 'unit-11', name: 'Milliliter', symbol: 'ml', description: 'Volume in milliliters' },
      { id: 'unit-12', name: 'Liter', symbol: 'L', description: 'Volume in liters' }
    ]

    for (const unit of defaultUnits) {
      insertUnit.run(unit.id, unit.name, unit.symbol, unit.description)
    }

    console.log('Units table created and populated with default units')
  } else {
    console.log('Units table already exists')
  }
}
