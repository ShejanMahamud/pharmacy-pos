import Database from 'better-sqlite3'
import { v4 as uuidv4 } from 'uuid'

export function migrateUnitsTable(sqlite: Database.Database): void {
  console.log('Running migration: update-units-table')

  // Check if 'type' column exists
  const typeColumnExists = sqlite
    .prepare("SELECT COUNT(*) as count FROM pragma_table_info('units') WHERE name='type'")
    .get() as { count: number }

  if (typeColumnExists.count === 0) {
    // Add 'type' column
    sqlite.exec(`
      ALTER TABLE units ADD COLUMN type TEXT DEFAULT 'base';
    `)
    console.log('Added type column to units table')
  }

  // Check if 'abbreviation' column exists
  const abbreviationColumnExists = sqlite
    .prepare("SELECT COUNT(*) as count FROM pragma_table_info('units') WHERE name='abbreviation'")
    .get() as { count: number }

  if (abbreviationColumnExists.count === 0) {
    // Add 'abbreviation' column and copy data from 'symbol'
    sqlite.exec(`
      ALTER TABLE units ADD COLUMN abbreviation TEXT;
    `)

    // Copy symbol to abbreviation for existing records
    sqlite.exec(`
      UPDATE units SET abbreviation = symbol WHERE abbreviation IS NULL;
    `)
    console.log('Added abbreviation column to units table')
  }

  // Update existing units with proper types
  const existingUnits = sqlite.prepare('SELECT id, name FROM units').all() as Array<{
    id: string
    name: string
  }>

  // Define base units (smallest units customers can buy)
  const baseUnits = ['Piece', 'Tablet', 'Capsule', 'Strip', 'Sachet', 'Milliliter', 'Gram']

  // Define package units (bulk units for purchases)
  const packageUnits = [
    'Box',
    'Bottle',
    'Vial',
    'Tube',
    'Pack',
    'Kilogram',
    'Liter',
    'Carton',
    'Container'
  ]

  const updateStmt = sqlite.prepare('UPDATE units SET type = ? WHERE id = ?')

  for (const unit of existingUnits) {
    if (baseUnits.includes(unit.name)) {
      updateStmt.run('base', unit.id)
    } else if (packageUnits.includes(unit.name)) {
      updateStmt.run('package', unit.id)
    }
  }

  // Add missing base units if they don't exist
  const insertUnit = sqlite.prepare(`
    INSERT OR IGNORE INTO units (id, name, abbreviation, type, description, is_active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `)

  const defaultBaseUnits = [
    { name: 'Tablet', abbreviation: 'Tab', description: 'Individual tablet' },
    { name: 'Capsule', abbreviation: 'Cap', description: 'Individual capsule' },
    { name: 'Piece', abbreviation: 'Pcs', description: 'Individual piece' },
    { name: 'Strip', abbreviation: 'Strip', description: 'Blister pack or strip' },
    { name: 'Sachet', abbreviation: 'Sachet', description: 'Single-use sachet' },
    { name: 'Milliliter', abbreviation: 'ml', description: 'Volume in milliliters' },
    { name: 'Gram', abbreviation: 'gm', description: 'Weight in grams' }
  ]

  const defaultPackageUnits = [
    { name: 'Box', abbreviation: 'Bx', description: 'Box containing multiple units' },
    { name: 'Bottle', abbreviation: 'Btl', description: 'Liquid bottle' },
    { name: 'Vial', abbreviation: 'Vial', description: 'Injectable vial' },
    { name: 'Tube', abbreviation: 'Tube', description: 'Cream or ointment tube' },
    { name: 'Pack', abbreviation: 'Pack', description: 'Package' },
    { name: 'Carton', abbreviation: 'Ctn', description: 'Carton containing multiple boxes' },
    { name: 'Container', abbreviation: 'Cont', description: 'Large container' },
    { name: 'Kilogram', abbreviation: 'kg', description: 'Weight in kilograms' },
    { name: 'Liter', abbreviation: 'L', description: 'Volume in liters' }
  ]

  // Insert base units
  for (const unit of defaultBaseUnits) {
    const existingUnit = sqlite.prepare('SELECT id FROM units WHERE name = ?').get(unit.name) as
      | { id: string }
      | undefined

    if (!existingUnit) {
      insertUnit.run(uuidv4(), unit.name, unit.abbreviation, 'base', unit.description)
    }
  }

  // Insert package units
  for (const unit of defaultPackageUnits) {
    const existingUnit = sqlite.prepare('SELECT id FROM units WHERE name = ?').get(unit.name) as
      | { id: string }
      | undefined

    if (!existingUnit) {
      insertUnit.run(uuidv4(), unit.name, unit.abbreviation, 'package', unit.description)
    }
  }

  console.log('Migration update-units-table completed successfully')
}
