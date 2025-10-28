import { and, eq, sql } from 'drizzle-orm'
import { ipcMain } from 'electron'
import { v4 as uuidv4 } from 'uuid'
import { getDatabase } from '../../database'
import * as schema from '../../database/schema'
import { createAuditLog } from '../utils/audit-logger'

export function registerProductInventoryHandlers(): void {
  const db = getDatabase()

  // ==================== PRODUCTS ====================

  // Get all active products (with optional search)
  ipcMain.handle('db:products:getAll', async (_, search?: string) => {
    if (search) {
      return db
        .select()
        .from(schema.products)
        .where(
          and(
            eq(schema.products.isActive, true),
            sql`(${schema.products.name} LIKE ${`%${search}%`} OR ${schema.products.barcode} LIKE ${`%${search}%`} OR ${schema.products.sku} LIKE ${`%${search}%`})`
          )
        )
        .all()
    }
    return db.select().from(schema.products).where(eq(schema.products.isActive, true)).all()
  })

  // Get product by ID
  ipcMain.handle('db:products:getById', async (_, id: string) => {
    return db.select().from(schema.products).where(eq(schema.products.id, id)).get()
  })

  // Get product by barcode
  ipcMain.handle('db:products:getByBarcode', async (_, barcode: string) => {
    return db.select().from(schema.products).where(eq(schema.products.barcode, barcode)).get()
  })

  // Search products
  ipcMain.handle('db:products:search', async (_, search: string) => {
    if (!search || search.trim().length === 0) {
      return []
    }
    return db
      .select()
      .from(schema.products)
      .where(
        and(
          eq(schema.products.isActive, true),
          sql`(${schema.products.name} LIKE ${`%${search}%`} OR ${schema.products.barcode} LIKE ${`%${search}%`} OR ${schema.products.sku} LIKE ${`%${search}%`})`
        )
      )
      .limit(20)
      .all()
  })

  // Create new product
  ipcMain.handle('db:products:create', async (_, data) => {
    const id = uuidv4()
    const result = db
      .insert(schema.products)
      .values({ id, ...data })
      .returning()
      .get()

    createAuditLog(db, {
      action: 'create',
      entityType: 'product',
      entityId: id,
      entityName: result.name
    })

    return result
  })

  // Update product
  ipcMain.handle('db:products:update', async (_, { id, data }) => {
    const oldProduct = db.select().from(schema.products).where(eq(schema.products.id, id)).get()

    const result = db
      .update(schema.products)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(schema.products.id, id))
      .returning()
      .get()

    const changes: Record<string, { old: unknown; new: unknown }> = {}
    if (oldProduct) {
      Object.keys(data).forEach((key) => {
        if (oldProduct[key] !== data[key]) {
          changes[key] = { old: oldProduct[key], new: data[key] }
        }
      })
    }

    createAuditLog(db, {
      action: 'update',
      entityType: 'product',
      entityId: id,
      entityName: result.name,
      changes: Object.keys(changes).length > 0 ? changes : undefined
    })

    return result
  })

  // Delete product (soft delete)
  ipcMain.handle('db:products:delete', async (_, id: string) => {
    const product = db.select().from(schema.products).where(eq(schema.products.id, id)).get()

    const result = db
      .update(schema.products)
      .set({ isActive: false })
      .where(eq(schema.products.id, id))
      .run()

    if (product) {
      createAuditLog(db, {
        action: 'delete',
        entityType: 'product',
        entityId: id,
        entityName: product.name
      })
    }

    return result
  })

  // ==================== INVENTORY ====================

  // Get all inventory items
  ipcMain.handle('db:inventory:getAll', async () => {
    return db
      .select({
        id: schema.inventory.id,
        productId: schema.inventory.productId,
        quantity: schema.inventory.quantity,
        batchNumber: schema.inventory.batchNumber,
        expiryDate: schema.inventory.expiryDate,
        productName: schema.products.name,
        productSku: schema.products.sku,
        productBarcode: schema.products.barcode,
        sellingPrice: schema.products.sellingPrice,
        reorderLevel: schema.products.reorderLevel
      })
      .from(schema.inventory)
      .innerJoin(schema.products, eq(schema.inventory.productId, schema.products.id))
      .all()
  })

  // Get low stock items
  ipcMain.handle('db:inventory:getLowStock', async () => {
    return db
      .select({
        id: schema.inventory.id,
        productId: schema.inventory.productId,
        productName: schema.products.name,
        quantity: schema.inventory.quantity,
        reorderLevel: schema.products.reorderLevel
      })
      .from(schema.inventory)
      .innerJoin(schema.products, eq(schema.inventory.productId, schema.products.id))
      .where(sql`${schema.inventory.quantity} <= ${schema.products.reorderLevel}`)
      .all()
  })

  // Update inventory quantity
  ipcMain.handle(
    'db:inventory:updateQuantity',
    async (_, { productId, quantity, userId, username }) => {
      try {
        // Validate that product exists
        const product = db
          .select()
          .from(schema.products)
          .where(eq(schema.products.id, productId))
          .get()

        if (!product) {
          throw new Error(`Product with ID ${productId} does not exist`)
        }

        const existing = db
          .select()
          .from(schema.inventory)
          .where(eq(schema.inventory.productId, productId))
          .get()

        let result
        let oldQuantity = 0
        let newQuantity = quantity

        if (existing) {
          oldQuantity = existing.quantity
          newQuantity = existing.quantity + quantity
          result = db
            .update(schema.inventory)
            .set({ quantity: newQuantity, updatedAt: new Date().toISOString() })
            .where(eq(schema.inventory.id, existing.id))
            .returning()
            .get()
        } else {
          const id = uuidv4()
          result = db.insert(schema.inventory).values({ id, productId, quantity }).returning().get()
        }

        // Create audit log for inventory adjustment
        createAuditLog(db, {
          userId: userId,
          username: username,
          action: existing ? 'update' : 'create',
          entityType: 'inventory',
          entityId: result.id,
          entityName: product.name,
          changes: {
            productId,
            oldQuantity,
            newQuantity,
            adjustment: quantity
          }
        })

        return result
      } catch (error) {
        console.error('Error updating inventory quantity:', error)
        throw error
      }
    }
  )
}
