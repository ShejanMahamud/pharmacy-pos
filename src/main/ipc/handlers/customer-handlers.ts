import { and, eq, sql } from 'drizzle-orm'
import { ipcMain } from 'electron'
import { v4 as uuidv4 } from 'uuid'
import { getDatabase } from '../../database'
import * as schema from '../../database/schema'
import { createAuditLog } from '../utils/audit-logger'

export function registerCustomerHandlers(): void {
  const db = getDatabase()

  // Get all active customers (with optional search)
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

  // Get customer by phone
  ipcMain.handle('db:customers:getByPhone', async (_, phone: string) => {
    return db.select().from(schema.customers).where(eq(schema.customers.phone, phone)).get()
  })

  // Create new customer
  ipcMain.handle('db:customers:create', async (_, data) => {
    const id = uuidv4()
    const result = db
      .insert(schema.customers)
      .values({ id, ...data })
      .returning()
      .get()

    createAuditLog(db, {
      action: 'create',
      entityType: 'customer',
      entityId: id,
      entityName: result.name
    })

    return result
  })

  // Update customer
  ipcMain.handle('db:customers:update', async (_, { id, data }) => {
    const oldCustomer = db.select().from(schema.customers).where(eq(schema.customers.id, id)).get()

    const result = db
      .update(schema.customers)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(schema.customers.id, id))
      .returning()
      .get()

    const changes: Record<string, { old: unknown; new: unknown }> = {}
    if (oldCustomer) {
      Object.keys(data).forEach((key) => {
        if (oldCustomer[key] !== data[key]) {
          changes[key] = { old: oldCustomer[key], new: data[key] }
        }
      })
    }

    createAuditLog(db, {
      action: 'update',
      entityType: 'customer',
      entityId: id,
      entityName: result.name,
      changes: Object.keys(changes).length > 0 ? changes : undefined
    })

    return result
  })
}
