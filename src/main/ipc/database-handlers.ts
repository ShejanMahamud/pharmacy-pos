import { and, desc, eq, gte, lte, sql } from 'drizzle-orm'
import { ipcMain } from 'electron'
import { v4 as uuidv4 } from 'uuid'
import { getDatabase } from '../database'
import * as schema from '../database/schema'

export function registerDatabaseHandlers(): void {
  const db = getDatabase()

  // ==================== BRANCHES ====================
  ipcMain.handle('db:branches:getAll', async () => {
    return db.select().from(schema.branches).where(eq(schema.branches.isActive, true)).all()
  })

  ipcMain.handle('db:branches:getById', async (_, id: string) => {
    return db.select().from(schema.branches).where(eq(schema.branches.id, id)).get()
  })

  ipcMain.handle('db:branches:create', async (_, data) => {
    const id = uuidv4()
    return db
      .insert(schema.branches)
      .values({ id, ...data })
      .returning()
      .get()
  })

  ipcMain.handle('db:branches:update', async (_, { id, data }) => {
    return db
      .update(schema.branches)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(schema.branches.id, id))
      .returning()
      .get()
  })

  ipcMain.handle('db:branches:delete', async (_, id: string) => {
    return db
      .update(schema.branches)
      .set({ isActive: false })
      .where(eq(schema.branches.id, id))
      .run()
  })

  // ==================== USERS ====================
  ipcMain.handle('db:users:getAll', async (_, branchId?: string) => {
    if (branchId) {
      return db
        .select()
        .from(schema.users)
        .where(and(eq(schema.users.branchId, branchId), eq(schema.users.isActive, true)))
        .all()
    }
    return db.select().from(schema.users).where(eq(schema.users.isActive, true)).all()
  })

  ipcMain.handle('db:users:getById', async (_, id: string) => {
    return db.select().from(schema.users).where(eq(schema.users.id, id)).get()
  })

  ipcMain.handle('db:users:authenticate', async (_, { username, password }) => {
    return db
      .select()
      .from(schema.users)
      .where(
        and(
          eq(schema.users.username, username),
          eq(schema.users.password, password),
          eq(schema.users.isActive, true)
        )
      )
      .get()
  })

  ipcMain.handle('db:users:create', async (_, data) => {
    const id = uuidv4()
    return db
      .insert(schema.users)
      .values({ id, ...data })
      .returning()
      .get()
  })

  ipcMain.handle('db:users:update', async (_, { id, data }) => {
    return db
      .update(schema.users)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(schema.users.id, id))
      .returning()
      .get()
  })

  ipcMain.handle('db:users:delete', async (_, id: string) => {
    return db.update(schema.users).set({ isActive: false }).where(eq(schema.users.id, id)).run()
  })

  // ==================== CATEGORIES ====================
  ipcMain.handle('db:categories:getAll', async () => {
    return db.select().from(schema.categories).where(eq(schema.categories.isActive, true)).all()
  })

  ipcMain.handle('db:categories:create', async (_, data) => {
    const id = uuidv4()
    return db
      .insert(schema.categories)
      .values({ id, ...data })
      .returning()
      .get()
  })

  ipcMain.handle('db:categories:update', async (_, { id, data }) => {
    return db
      .update(schema.categories)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(schema.categories.id, id))
      .returning()
      .get()
  })

  ipcMain.handle('db:categories:delete', async (_, id: string) => {
    return db
      .update(schema.categories)
      .set({ isActive: false })
      .where(eq(schema.categories.id, id))
      .run()
  })

  // ==================== SUPPLIERS ====================
  ipcMain.handle('db:suppliers:getAll', async () => {
    return db.select().from(schema.suppliers).where(eq(schema.suppliers.isActive, true)).all()
  })

  ipcMain.handle('db:suppliers:create', async (_, data) => {
    const id = uuidv4()
    return db
      .insert(schema.suppliers)
      .values({ id, ...data })
      .returning()
      .get()
  })

  ipcMain.handle('db:suppliers:update', async (_, { id, data }) => {
    return db
      .update(schema.suppliers)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(schema.suppliers.id, id))
      .returning()
      .get()
  })

  ipcMain.handle('db:suppliers:delete', async (_, id: string) => {
    return db
      .update(schema.suppliers)
      .set({ isActive: false })
      .where(eq(schema.suppliers.id, id))
      .run()
  })

  // ==================== PRODUCTS ====================
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

  ipcMain.handle('db:products:getById', async (_, id: string) => {
    return db.select().from(schema.products).where(eq(schema.products.id, id)).get()
  })

  ipcMain.handle('db:products:getByBarcode', async (_, barcode: string) => {
    return db.select().from(schema.products).where(eq(schema.products.barcode, barcode)).get()
  })

  ipcMain.handle('db:products:create', async (_, data) => {
    const id = uuidv4()
    return db
      .insert(schema.products)
      .values({ id, ...data })
      .returning()
      .get()
  })

  ipcMain.handle('db:products:update', async (_, { id, data }) => {
    return db
      .update(schema.products)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(schema.products.id, id))
      .returning()
      .get()
  })

  ipcMain.handle('db:products:delete', async (_, id: string) => {
    return db
      .update(schema.products)
      .set({ isActive: false })
      .where(eq(schema.products.id, id))
      .run()
  })

  // ==================== INVENTORY ====================
  ipcMain.handle('db:inventory:getByBranch', async (_, branchId: string) => {
    return db
      .select({
        id: schema.inventory.id,
        productId: schema.inventory.productId,
        branchId: schema.inventory.branchId,
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
      .where(eq(schema.inventory.branchId, branchId))
      .all()
  })

  ipcMain.handle('db:inventory:getLowStock', async (_, branchId: string) => {
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
      .where(
        and(
          eq(schema.inventory.branchId, branchId),
          sql`${schema.inventory.quantity} <= ${schema.products.reorderLevel}`
        )
      )
      .all()
  })

  ipcMain.handle('db:inventory:updateQuantity', async (_, { productId, branchId, quantity }) => {
    const existing = db
      .select()
      .from(schema.inventory)
      .where(
        and(eq(schema.inventory.productId, productId), eq(schema.inventory.branchId, branchId))
      )
      .get()

    if (existing) {
      return db
        .update(schema.inventory)
        .set({ quantity: existing.quantity + quantity, updatedAt: new Date().toISOString() })
        .where(eq(schema.inventory.id, existing.id))
        .returning()
        .get()
    } else {
      const id = uuidv4()
      return db
        .insert(schema.inventory)
        .values({ id, productId, branchId, quantity })
        .returning()
        .get()
    }
  })

  // ==================== CUSTOMERS ====================
  ipcMain.handle('db:customers:getAll', async (_, search?: string) => {
    if (search) {
      return db
        .select()
        .from(schema.customers)
        .where(
          and(
            eq(schema.customers.isActive, true),
            sql`(${schema.customers.name} LIKE ${`%${search}%`} OR ${schema.customers.phone} LIKE ${`%${search}%`})`
          )
        )
        .all()
    }
    return db.select().from(schema.customers).where(eq(schema.customers.isActive, true)).all()
  })

  ipcMain.handle('db:customers:getByPhone', async (_, phone: string) => {
    return db.select().from(schema.customers).where(eq(schema.customers.phone, phone)).get()
  })

  ipcMain.handle('db:customers:create', async (_, data) => {
    const id = uuidv4()
    return db
      .insert(schema.customers)
      .values({ id, ...data })
      .returning()
      .get()
  })

  ipcMain.handle('db:customers:update', async (_, { id, data }) => {
    return db
      .update(schema.customers)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(schema.customers.id, id))
      .returning()
      .get()
  })

  // ==================== SALES ====================
  ipcMain.handle('db:sales:create', async (_, { sale, items }) => {
    const saleId = uuidv4()
    const saleResult = db
      .insert(schema.sales)
      .values({ id: saleId, ...sale })
      .returning()
      .get()

    // Insert sale items
    const saleItemsData = items.map((item) => ({
      id: uuidv4(),
      saleId,
      ...item
    }))

    if (saleItemsData.length > 0) {
      db.insert(schema.saleItems).values(saleItemsData).run()
    }

    // Update inventory
    for (const item of items) {
      db.run(
        sql`UPDATE inventory SET quantity = quantity - ${item.quantity} 
            WHERE product_id = ${item.productId} AND branch_id = ${sale.branchId}`
      )
    }

    return saleResult
  })

  ipcMain.handle('db:sales:getByBranch', async (_, { branchId, startDate, endDate }) => {
    let query = db.select().from(schema.sales).where(eq(schema.sales.branchId, branchId))

    if (startDate && endDate) {
      query = query.where(
        and(
          eq(schema.sales.branchId, branchId),
          gte(schema.sales.createdAt, startDate),
          lte(schema.sales.createdAt, endDate)
        )
      )
    }

    return query.orderBy(desc(schema.sales.createdAt)).all()
  })

  ipcMain.handle('db:sales:getById', async (_, id: string) => {
    const sale = db.select().from(schema.sales).where(eq(schema.sales.id, id)).get()

    if (sale) {
      const items = db.select().from(schema.saleItems).where(eq(schema.saleItems.saleId, id)).all()
      return { ...sale, items }
    }
    return null
  })

  // ==================== PURCHASES ====================
  ipcMain.handle('db:purchases:create', async (_, { purchase, items }) => {
    const purchaseId = uuidv4()
    const purchaseResult = db
      .insert(schema.purchases)
      .values({ id: purchaseId, ...purchase })
      .returning()
      .get()

    // Insert purchase items
    const purchaseItemsData = items.map((item) => ({
      id: uuidv4(),
      purchaseId,
      ...item
    }))

    if (purchaseItemsData.length > 0) {
      db.insert(schema.purchaseItems).values(purchaseItemsData).run()
    }

    // Update inventory
    for (const item of items) {
      const existing = db
        .select()
        .from(schema.inventory)
        .where(
          and(
            eq(schema.inventory.productId, item.productId),
            eq(schema.inventory.branchId, purchase.branchId)
          )
        )
        .get()

      if (existing) {
        db.update(schema.inventory)
          .set({
            quantity: existing.quantity + item.quantity,
            batchNumber: item.batchNumber,
            expiryDate: item.expiryDate,
            manufactureDate: item.manufactureDate,
            updatedAt: new Date().toISOString()
          })
          .where(eq(schema.inventory.id, existing.id))
          .run()
      } else {
        const id = uuidv4()
        db.insert(schema.inventory)
          .values({
            id,
            productId: item.productId,
            branchId: purchase.branchId,
            quantity: item.quantity,
            batchNumber: item.batchNumber,
            expiryDate: item.expiryDate,
            manufactureDate: item.manufactureDate
          })
          .run()
      }
    }

    return purchaseResult
  })

  ipcMain.handle('db:purchases:getByBranch', async (_, { branchId, startDate, endDate }) => {
    let query = db.select().from(schema.purchases).where(eq(schema.purchases.branchId, branchId))

    if (startDate && endDate) {
      query = query.where(
        and(
          eq(schema.purchases.branchId, branchId),
          gte(schema.purchases.createdAt, startDate),
          lte(schema.purchases.createdAt, endDate)
        )
      )
    }

    return query.orderBy(desc(schema.purchases.createdAt)).all()
  })

  ipcMain.handle('db:purchases:getById', async (_, id: string) => {
    const purchase = db.select().from(schema.purchases).where(eq(schema.purchases.id, id)).get()

    if (purchase) {
      const items = db
        .select()
        .from(schema.purchaseItems)
        .where(eq(schema.purchaseItems.purchaseId, id))
        .all()
      return { ...purchase, items }
    }
    return null
  })

  // ==================== EXPENSES ====================
  ipcMain.handle('db:expenses:create', async (_, data) => {
    const id = uuidv4()
    return db
      .insert(schema.expenses)
      .values({ id, ...data })
      .returning()
      .get()
  })

  ipcMain.handle('db:expenses:getByBranch', async (_, { branchId, startDate, endDate }) => {
    let query = db.select().from(schema.expenses).where(eq(schema.expenses.branchId, branchId))

    if (startDate && endDate) {
      query = query.where(
        and(
          eq(schema.expenses.branchId, branchId),
          gte(schema.expenses.expenseDate, startDate),
          lte(schema.expenses.expenseDate, endDate)
        )
      )
    }

    return query.orderBy(desc(schema.expenses.createdAt)).all()
  })

  // ==================== SETTINGS ====================
  ipcMain.handle('db:settings:getAll', async () => {
    return db.select().from(schema.settings).all()
  })

  ipcMain.handle('db:settings:get', async (_, key: string) => {
    return db.select().from(schema.settings).where(eq(schema.settings.key, key)).get()
  })

  ipcMain.handle('db:settings:update', async (_, { key, value }) => {
    const existing = db.select().from(schema.settings).where(eq(schema.settings.key, key)).get()

    if (existing) {
      return db
        .update(schema.settings)
        .set({ value, updatedAt: new Date().toISOString() })
        .where(eq(schema.settings.key, key))
        .returning()
        .get()
    } else {
      const id = uuidv4()
      return db.insert(schema.settings).values({ id, key, value }).returning().get()
    }
  })

  // ==================== REPORTS ====================
  ipcMain.handle('db:reports:salesSummary', async (_, { branchId, startDate, endDate }) => {
    const salesData = db
      .select({
        totalSales: sql<number>`COUNT(*)`,
        totalRevenue: sql<number>`SUM(${schema.sales.totalAmount})`,
        totalProfit: sql<number>`SUM(${schema.sales.totalAmount} - ${schema.sales.discountAmount})`
      })
      .from(schema.sales)
      .where(
        and(
          eq(schema.sales.branchId, branchId),
          gte(schema.sales.createdAt, startDate),
          lte(schema.sales.createdAt, endDate),
          eq(schema.sales.status, 'completed')
        )
      )
      .get()

    return salesData
  })

  ipcMain.handle('db:reports:topProducts', async (_, { branchId, startDate, endDate, limit }) => {
    return db
      .select({
        productId: schema.saleItems.productId,
        productName: schema.saleItems.productName,
        totalQuantity: sql<number>`SUM(${schema.saleItems.quantity})`,
        totalRevenue: sql<number>`SUM(${schema.saleItems.subtotal})`
      })
      .from(schema.saleItems)
      .innerJoin(schema.sales, eq(schema.saleItems.saleId, schema.sales.id))
      .where(
        and(
          eq(schema.sales.branchId, branchId),
          gte(schema.sales.createdAt, startDate),
          lte(schema.sales.createdAt, endDate)
        )
      )
      .groupBy(schema.saleItems.productId, schema.saleItems.productName)
      .orderBy(desc(sql`SUM(${schema.saleItems.quantity})`))
      .limit(limit || 10)
      .all()
  })

  // ==================== AUDIT LOGS ====================
  ipcMain.handle('db:auditLogs:create', async (_, data) => {
    const id = uuidv4()
    return db
      .insert(schema.auditLogs)
      .values({ id, ...data })
      .run()
  })
}
