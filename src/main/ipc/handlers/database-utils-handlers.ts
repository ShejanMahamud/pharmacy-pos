import { and, desc, eq, gte, lte, sql } from 'drizzle-orm'
import { app, dialog, ipcMain } from 'electron'
import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { getDatabase } from '../../database'
import * as schema from '../../database/schema'

export function registerDatabaseUtilsHandlers(): void {
  const db = getDatabase()

  // ==================== DATABASE BACKUP & RESTORE ====================

  // Create database backup
  ipcMain.handle('db:backup:create', async () => {
    try {
      const userDataPath = app.getPath('userData')
      const dbPath = path.join(userDataPath, 'pharmacy.db')

      // Show save dialog
      const { filePath, canceled } = await dialog.showSaveDialog({
        title: 'Save Database Backup',
        defaultPath: `pharmacy-backup-${new Date().toISOString().split('T')[0]}.db`,
        filters: [
          { name: 'Database Files', extensions: ['db'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      })

      if (canceled || !filePath) {
        return { success: false, message: 'Backup canceled' }
      }

      // Copy database file
      fs.copyFileSync(dbPath, filePath)

      return {
        success: true,
        message: 'Database backup created successfully',
        path: filePath
      }
    } catch (error) {
      console.error('Backup failed:', error)
      return {
        success: false,
        message: `Backup failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  })

  // Restore database backup
  ipcMain.handle('db:backup:restore', async () => {
    try {
      // Show open dialog
      const { filePaths, canceled } = await dialog.showOpenDialog({
        title: 'Select Database Backup to Restore',
        filters: [
          { name: 'Database Files', extensions: ['db'] },
          { name: 'All Files', extensions: ['*'] }
        ],
        properties: ['openFile']
      })

      if (canceled || filePaths.length === 0) {
        return { success: false, message: 'Restore canceled' }
      }

      const backupPath = filePaths[0]

      // Validate backup file
      if (!fs.existsSync(backupPath)) {
        return { success: false, message: 'Backup file not found' }
      }

      const userDataPath = app.getPath('userData')
      const restoreFlagPath = path.join(userDataPath, 'restore-pending.json')

      // Save restore information to a flag file
      // The app will process this on next startup
      try {
        fs.writeFileSync(
          restoreFlagPath,
          JSON.stringify({
            backupPath,
            timestamp: Date.now()
          })
        )
      } catch (err) {
        console.error('Failed to create restore flag:', err)
        return {
          success: false,
          message: `Failed to prepare restore: ${err instanceof Error ? err.message : 'Unknown error'}`
        }
      }

      return {
        success: true,
        message: 'Restore prepared. The application will restart and restore your data.',
        requiresRestart: true
      }
    } catch (error) {
      console.error('Restore failed:', error)
      return {
        success: false,
        message: `Restore failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  })

  // ==================== AUDIT LOGS ====================

  // Get all audit logs (with optional filters)
  ipcMain.handle(
    'db:auditLogs:getAll',
    async (
      _,
      filters?: {
        startDate?: string
        endDate?: string
        action?: string
        entityType?: string
        userId?: string
      }
    ) => {
      try {
        let query = db.select().from(schema.auditLogs).$dynamic()

        const conditions: any[] = []

        if (filters?.startDate) {
          conditions.push(gte(schema.auditLogs.createdAt, filters.startDate))
        }

        if (filters?.endDate) {
          conditions.push(lte(schema.auditLogs.createdAt, filters.endDate))
        }

        if (filters?.action) {
          conditions.push(eq(schema.auditLogs.action, filters.action))
        }

        if (filters?.entityType) {
          conditions.push(eq(schema.auditLogs.entityType, filters.entityType))
        }

        if (filters?.userId) {
          conditions.push(eq(schema.auditLogs.userId, filters.userId))
        }

        if (conditions.length > 0) {
          query = query.where(and(...conditions))
        }

        return query.orderBy(desc(schema.auditLogs.createdAt)).limit(1000).all()
      } catch (error) {
        console.error('Failed to fetch audit logs:', error)
        return []
      }
    }
  )

  // Create audit log
  ipcMain.handle(
    'db:auditLogs:create',
    async (
      _,
      data: {
        userId?: string
        username?: string
        action: string
        entityType: string
        entityId?: string
        entityName?: string
        changes?: object
        ipAddress?: string
        userAgent?: string
      }
    ) => {
      try {
        const id = uuidv4()
        const auditLog = {
          id,
          userId: data.userId || null,
          username: data.username || 'System',
          action: data.action,
          entityType: data.entityType,
          entityId: data.entityId || null,
          entityName: data.entityName || null,
          changes: data.changes ? JSON.stringify(data.changes) : null,
          ipAddress: data.ipAddress || null,
          userAgent: data.userAgent || null,
          createdAt: new Date().toISOString()
        }

        db.insert(schema.auditLogs).values(auditLog).run()
        return { success: true, id }
      } catch (error) {
        console.error('Failed to create audit log:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
      }
    }
  )

  // Get audit log statistics
  ipcMain.handle('db:auditLogs:getStats', async () => {
    try {
      const totalLogs = db
        .select({ count: sql<number>`count(*)` })
        .from(schema.auditLogs)
        .get()

      const recentActivity = db
        .select({
          action: schema.auditLogs.action,
          count: sql<number>`count(*)`
        })
        .from(schema.auditLogs)
        .groupBy(schema.auditLogs.action)
        .all()

      const userActivity = db
        .select({
          username: schema.auditLogs.username,
          count: sql<number>`count(*)`
        })
        .from(schema.auditLogs)
        .groupBy(schema.auditLogs.username)
        .orderBy(desc(sql`count(*)`))
        .limit(10)
        .all()

      return {
        totalLogs: totalLogs?.count || 0,
        recentActivity,
        userActivity
      }
    } catch (error) {
      console.error('Failed to get audit log stats:', error)
      return {
        totalLogs: 0,
        recentActivity: [],
        userActivity: []
      }
    }
  })
}
