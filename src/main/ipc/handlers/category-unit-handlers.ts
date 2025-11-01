import { eq } from 'drizzle-orm'
import { ipcMain } from 'electron'
import { v4 as uuidv4 } from 'uuid'
import { getDatabase } from '../../database'
import * as schema from '../../database/schema'
import { createAuditLog } from '../utils/audit-logger'

export function registerCategoryUnitHandlers(): void {
  const db = getDatabase()

  // ==================== CATEGORIES ====================

  // Get all active categories
  ipcMain.handle('db:categories:getAll', async () => {
    return db.select().from(schema.categories).where(eq(schema.categories.isActive, true)).all()
  })

  // Create new category
  ipcMain.handle('db:categories:create', async (_, data) => {
    const id = uuidv4()
    const category = db
      .insert(schema.categories)
      .values({ id, ...data })
      .returning()
      .get()

    // Create audit log
    createAuditLog(db, {
      userId: data.createdBy,
      action: 'create',
      entityType: 'category',
      entityId: category.id,
      entityName: category.name
    })

    return category
  })

  // Update category
  ipcMain.handle('db:categories:update', async (_, { id, data }) => {
    // Get old data for audit log
    const oldCategory = db
      .select()
      .from(schema.categories)
      .where(eq(schema.categories.id, id))
      .get()

    const category = db
      .update(schema.categories)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(schema.categories.id, id))
      .returning()
      .get()

    // Track changes
    const changes: Record<string, { old: unknown; new: unknown }> = {}
    if (oldCategory) {
      Object.keys(data).forEach((key) => {
        if (oldCategory[key] !== data[key]) {
          changes[key] = { old: oldCategory[key], new: data[key] }
        }
      })
    }

    // Create audit log
    if (Object.keys(changes).length > 0) {
      createAuditLog(db, {
        userId: data.updatedBy,
        action: 'update',
        entityType: 'category',
        entityId: category.id,
        entityName: category.name,
        changes
      })
    }

    return category
  })

  // Delete category (soft delete)
  ipcMain.handle('db:categories:delete', async (_, id: string) => {
    // Get category data for audit log
    const category = db.select().from(schema.categories).where(eq(schema.categories.id, id)).get()

    db.update(schema.categories).set({ isActive: false }).where(eq(schema.categories.id, id)).run()

    // Create audit log
    if (category) {
      createAuditLog(db, {
        userId: undefined,
        action: 'delete',
        entityType: 'category',
        entityId: category.id,
        entityName: category.name
      })
    }

    return { success: true }
  })

  // ==================== UNITS ====================

  // Get all active units
  ipcMain.handle('db:units:getAll', async () => {
    return db.select().from(schema.units).where(eq(schema.units.isActive, true)).all()
  })

  // Create new unit
  ipcMain.handle('db:units:create', async (_, data) => {
    const id = uuidv4()
    // Ensure symbol field is populated (legacy field, use abbreviation as fallback)
    const unitData = {
      ...data,
      symbol: data.symbol || data.abbreviation
    }
    const unit = db
      .insert(schema.units)
      .values({ id, ...unitData })
      .returning()
      .get()

    // Create audit log
    createAuditLog(db, {
      userId: data.createdBy,
      action: 'create',
      entityType: 'unit',
      entityId: unit.id,
      entityName: unit.name
    })

    return unit
  })

  // Update unit
  ipcMain.handle('db:units:update', async (_, { id, data }) => {
    // Get old data for audit log
    const oldUnit = db.select().from(schema.units).where(eq(schema.units.id, id)).get()

    // Ensure symbol field is populated (legacy field, use abbreviation as fallback)
    const unitData = {
      ...data,
      symbol: data.symbol || data.abbreviation || oldUnit?.symbol
    }

    const unit = db
      .update(schema.units)
      .set({ ...unitData, updatedAt: new Date().toISOString() })
      .where(eq(schema.units.id, id))
      .returning()
      .get()

    // Track changes
    const changes: Record<string, { old: unknown; new: unknown }> = {}
    if (oldUnit) {
      Object.keys(data).forEach((key) => {
        if (oldUnit[key] !== data[key]) {
          changes[key] = { old: oldUnit[key], new: data[key] }
        }
      })
    }

    // Create audit log
    if (Object.keys(changes).length > 0) {
      createAuditLog(db, {
        userId: data.updatedBy,
        action: 'update',
        entityType: 'unit',
        entityId: unit.id,
        entityName: unit.name,
        changes
      })
    }

    return unit
  })

  // Delete unit (soft delete)
  ipcMain.handle('db:units:delete', async (_, id: string) => {
    // Get unit data for audit log
    const unit = db.select().from(schema.units).where(eq(schema.units.id, id)).get()

    db.update(schema.units).set({ isActive: false }).where(eq(schema.units.id, id)).run()

    // Create audit log
    if (unit) {
      createAuditLog(db, {
        userId: undefined,
        action: 'delete',
        entityType: 'unit',
        entityId: unit.id,
        entityName: unit.name
      })
    }

    return { success: true }
  })
}
