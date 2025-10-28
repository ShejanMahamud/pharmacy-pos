import { and, desc, eq, gte, lte, sql } from 'drizzle-orm'
import { ipcMain } from 'electron'
import { v4 as uuidv4 } from 'uuid'
import { getDatabase } from '../../database'
import * as schema from '../../database/schema'
import { createAuditLog } from '../utils/audit-logger'

export function registerReportsSettingsHandlers(): void {
  const db = getDatabase()

  // ==================== EXPENSES ====================

  // Create expense
  ipcMain.handle('db:expenses:create', async (_, data) => {
    const id = uuidv4()
    const expense = db
      .insert(schema.expenses)
      .values({ id, ...data })
      .returning()
      .get()

    // Create audit log
    createAuditLog(db, {
      userId: data.createdBy,
      action: 'create',
      entityType: 'expense',
      entityId: expense.id,
      entityName: expense.category || 'Expense',
      changes: { amount: expense.amount }
    })

    return expense
  })

  // Get all expenses (with optional date range)
  ipcMain.handle('db:expenses:getAll', async (_, { startDate, endDate }) => {
    if (startDate && endDate) {
      return db
        .select()
        .from(schema.expenses)
        .where(
          and(
            gte(schema.expenses.expenseDate, startDate),
            lte(schema.expenses.expenseDate, endDate)
          )
        )
        .orderBy(desc(schema.expenses.expenseDate))
        .all()
    }

    return db.select().from(schema.expenses).orderBy(desc(schema.expenses.expenseDate)).all()
  })

  // ==================== SETTINGS ====================

  // Get all settings
  ipcMain.handle('db:settings:getAll', async () => {
    return db.select().from(schema.settings).all()
  })

  // Get setting by key
  ipcMain.handle('db:settings:get', async (_, key: string) => {
    return db.select().from(schema.settings).where(eq(schema.settings.key, key)).get()
  })

  // Update or create setting
  ipcMain.handle('db:settings:update', async (_, { key, value, userId, username }) => {
    const existing = db.select().from(schema.settings).where(eq(schema.settings.key, key)).get()

    let result

    if (existing) {
      result = db
        .update(schema.settings)
        .set({ value, updatedAt: new Date().toISOString() })
        .where(eq(schema.settings.key, key))
        .returning()
        .get()

      // Create audit log for settings update
      createAuditLog(db, {
        userId: userId,
        username: username,
        action: 'update',
        entityType: 'settings',
        entityId: existing.id,
        entityName: key,
        changes: { old: existing.value, new: value }
      })
    } else {
      const id = uuidv4()
      result = db.insert(schema.settings).values({ id, key, value }).returning().get()

      // Create audit log for settings creation
      createAuditLog(db, {
        userId: userId,
        username: username,
        action: 'create',
        entityType: 'settings',
        entityId: id,
        entityName: key,
        changes: { value }
      })
    }

    return result
  })

  // ==================== REPORTS ====================

  // Get sales summary report
  ipcMain.handle('db:reports:salesSummary', async (_, { startDate, endDate }) => {
    const salesData = db
      .select({
        totalSales: sql<number>`COUNT(*)`,
        totalRevenue: sql<number>`SUM(${schema.sales.totalAmount})`,
        totalProfit: sql<number>`SUM(${schema.sales.totalAmount} - ${schema.sales.discountAmount})`
      })
      .from(schema.sales)
      .where(
        and(
          gte(schema.sales.createdAt, startDate),
          lte(schema.sales.createdAt, endDate),
          eq(schema.sales.status, 'completed')
        )
      )
      .get()

    return salesData
  })

  // Get top products report
  ipcMain.handle('db:reports:topProducts', async (_, { startDate, endDate, limit }) => {
    return db
      .select({
        productId: schema.saleItems.productId,
        productName: schema.saleItems.productName,
        totalQuantity: sql<number>`SUM(${schema.saleItems.quantity})`,
        totalRevenue: sql<number>`SUM(${schema.saleItems.subtotal})`
      })
      .from(schema.saleItems)
      .innerJoin(schema.sales, eq(schema.saleItems.saleId, schema.sales.id))
      .where(and(gte(schema.sales.createdAt, startDate), lte(schema.sales.createdAt, endDate)))
      .groupBy(schema.saleItems.productId, schema.saleItems.productName)
      .orderBy(desc(sql`SUM(${schema.saleItems.quantity})`))
      .limit(limit || 10)
      .all()
  })
}
