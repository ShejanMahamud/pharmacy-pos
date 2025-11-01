import { eq } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'
import { getDatabase } from '../../database'
import * as schema from '../../database/schema'

/**
 * Helper function to create audit logs for tracking entity changes
 */
export function createAuditLog(
  db: ReturnType<typeof getDatabase>,
  data: {
    userId?: string
    username?: string
    action: 'create' | 'update' | 'delete' | 'login' | 'logout'
    entityType: string
    entityId?: string
    entityName?: string
    changes?: object
  }
): void {
  try {
    // Validate userId exists if provided
    let validUserId: string | null = null
    if (data.userId) {
      const userExists = db
        .select({ id: schema.users.id })
        .from(schema.users)
        .where(eq(schema.users.id, data.userId))
        .get()

      if (userExists) {
        validUserId = data.userId
      } else {
        console.warn(`User ID ${data.userId} not found, audit log will be created without userId`)
      }
    }

    const id = uuidv4()
    const auditLog = {
      id,
      userId: validUserId,
      username: data.username || 'System',
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId || null,
      entityName: data.entityName || null,
      changes: data.changes ? JSON.stringify(data.changes) : null,
      ipAddress: null,
      userAgent: null,
      createdAt: new Date().toISOString()
    }
    db.insert(schema.auditLogs).values(auditLog).run()
  } catch (error) {
    console.error('Failed to create audit log:', error)
  }
}

/**
 * Production-grade bcrypt rounds for password hashing
 */
export const SALT_ROUNDS = 12
