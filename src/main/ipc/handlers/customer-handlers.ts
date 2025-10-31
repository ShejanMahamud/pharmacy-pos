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

    // Transform status to isActive (boolean)
    const isActive = data.status === 'active'

    // Prepare customer data with proper field mapping
    const customerData = {
      id,
      name: data.name,
      phone: data.phone,
      email: data.email || null,
      address: data.address || null,
      dateOfBirth: data.dateOfBirth || null,
      loyaltyPoints: 0,
      isActive
    }

    const result = db.insert(schema.customers).values(customerData).returning().get()

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

    // Transform status to isActive (boolean)
    const isActive = data.status === 'active'

    // Prepare update data with proper field mapping
    const updateData = {
      name: data.name,
      phone: data.phone,
      email: data.email || null,
      address: data.address || null,
      dateOfBirth: data.dateOfBirth || null,
      isActive,
      updatedAt: new Date().toISOString()
    }

    const result = db
      .update(schema.customers)
      .set(updateData)
      .where(eq(schema.customers.id, id))
      .returning()
      .get()

    const changes: Record<string, { old: unknown; new: unknown }> = {}
    if (oldCustomer) {
      Object.keys(updateData).forEach((key) => {
        if (oldCustomer[key] !== updateData[key]) {
          changes[key] = { old: oldCustomer[key], new: updateData[key] }
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

  // Recalculate customer loyalty points and total purchases from sales
  ipcMain.handle('db:customers:recalculateStats', async () => {
    try {
      const customers = db.select().from(schema.customers).all()

      for (const customer of customers) {
        // Get all completed sales for this customer
        const sales = db
          .select()
          .from(schema.sales)
          .where(
            and(eq(schema.sales.customerId, customer.id), eq(schema.sales.status, 'completed'))
          )
          .all()

        // Calculate total purchases
        const totalPurchases = sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0)

        // Calculate loyalty points (1 point per $10)
        const loyaltyPoints = Math.floor(totalPurchases / 10)

        // Update customer
        db.update(schema.customers)
          .set({
            totalPurchases,
            loyaltyPoints,
            updatedAt: new Date().toISOString()
          })
          .where(eq(schema.customers.id, customer.id))
          .run()
      }

      return { success: true, message: 'Customer stats recalculated successfully' }
    } catch (error) {
      console.error('Error recalculating customer stats:', error)
      return { success: false, message: 'Failed to recalculate customer stats' }
    }
  })
}
