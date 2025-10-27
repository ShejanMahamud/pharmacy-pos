import type { Database } from 'better-sqlite3'

export function migrateProductUnitConversion(db: Database): void {
  console.log('Running migration: add-product-unit-conversion')

  try {
    // Check if columns already exist
    const tableInfo = db.pragma('table_info(products)') as Array<{ name: string }>
    const columnNames = tableInfo.map((col) => col.name)

    // Add unitsPerPackage if it doesn't exist
    if (!columnNames.includes('units_per_package')) {
      db.exec('ALTER TABLE products ADD COLUMN units_per_package INTEGER DEFAULT 1')
      console.log('Added units_per_package column')
    }

    // Add packageUnit if it doesn't exist
    if (!columnNames.includes('package_unit')) {
      db.exec('ALTER TABLE products ADD COLUMN package_unit TEXT')
      console.log('Added package_unit column')
    }

    // Update existing products to set default values
    // For existing products, assume they are already in base units (1:1 conversion)
    db.exec(`
      UPDATE products 
      SET units_per_package = 1, 
          package_unit = unit 
      WHERE units_per_package IS NULL OR package_unit IS NULL
    `)
    console.log('Updated existing products with default unit conversion values')

    console.log('Migration add-product-unit-conversion completed successfully')
  } catch (error) {
    console.error('Error in migration add-product-unit-conversion:', error)
    throw error
  }
}
