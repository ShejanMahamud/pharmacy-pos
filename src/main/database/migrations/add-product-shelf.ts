import Database from 'better-sqlite3'

export function migrateProductShelf(sqlite: Database.Database): void {
  console.log('Running migration: add-product-shelf')

  // Check if 'shelf' column exists
  const shelfColumnExists = sqlite
    .prepare("SELECT COUNT(*) as count FROM pragma_table_info('products') WHERE name='shelf'")
    .get() as { count: number }

  if (shelfColumnExists.count === 0) {
    // Add 'shelf' column with default value
    sqlite.exec(`
      ALTER TABLE products ADD COLUMN shelf TEXT NOT NULL DEFAULT 'A1';
    `)
    console.log('Added shelf column to products table')

    // Update existing products with default shelf locations
    // You can customize this logic based on your needs
    sqlite.exec(`
      UPDATE products SET shelf = 'A1' WHERE shelf IS NULL OR shelf = '';
    `)
    console.log('Updated existing products with default shelf locations')
  } else {
    console.log('Shelf column already exists in products table')
  }

  console.log('Migration add-product-shelf completed successfully')
}
