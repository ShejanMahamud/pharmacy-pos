import { and, desc, eq, gte, lte } from 'drizzle-orm'
import { ipcMain } from 'electron'
import { v4 as uuidv4 } from 'uuid'
import { getDatabase } from '../../database'
import * as schema from '../../database/schema'
import { createAuditLog } from '../utils/audit-logger'

export function registerPurchaseHandlers(): void {
  const db = getDatabase()

  // ==================== PURCHASES ====================

  // Create new purchase
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
        .where(eq(schema.inventory.productId, item.productId))
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
            quantity: item.quantity,
            batchNumber: item.batchNumber,
            expiryDate: item.expiryDate,
            manufactureDate: item.manufactureDate
          })
          .run()
      }
    }

    // Update bank account balance if accountId is provided (deduct money)
    if (purchase.accountId && purchase.paidAmount > 0) {
      const account = db
        .select()
        .from(schema.bankAccounts)
        .where(eq(schema.bankAccounts.id, purchase.accountId))
        .get()

      if (account) {
        const currentBalance = account.currentBalance ?? 0
        const totalWithdrawals = account.totalWithdrawals ?? 0

        db.update(schema.bankAccounts)
          .set({
            currentBalance: currentBalance - purchase.paidAmount,
            totalWithdrawals: totalWithdrawals + purchase.paidAmount,
            updatedAt: new Date().toISOString()
          })
          .where(eq(schema.bankAccounts.id, purchase.accountId))
          .run()
      }
    }

    // Update supplier balance
    const supplier = db
      .select()
      .from(schema.suppliers)
      .where(eq(schema.suppliers.id, purchase.supplierId))
      .get()

    if (supplier) {
      const currentBalance = supplier.currentBalance ?? 0
      const totalPurchases = supplier.totalPurchases ?? 0

      db.update(schema.suppliers)
        .set({
          currentBalance: currentBalance + purchase.totalAmount,
          totalPurchases: totalPurchases + purchase.totalAmount,
          updatedAt: new Date().toISOString()
        })
        .where(eq(schema.suppliers.id, purchase.supplierId))
        .run()

      // Create ledger entry for purchase
      const ledgerId = uuidv4()
      const newBalance = currentBalance + purchase.totalAmount

      // Calculate total balance including opening balance
      const openingBalance = supplier.openingBalance ?? 0
      const totalBalance = openingBalance + newBalance

      db.insert(schema.supplierLedgerEntries)
        .values({
          id: ledgerId,
          supplierId: purchase.supplierId,
          type: 'purchase',
          referenceId: purchaseId,
          referenceNumber: purchase.invoiceNumber,
          description: `Purchase: ${purchase.notes || 'Goods purchased'}`,
          debit: purchase.totalAmount,
          credit: 0,
          balance: totalBalance,
          transactionDate: new Date().toISOString().split('T')[0],
          createdBy: purchase.userId
        })
        .run()
    }

    // Create audit log
    createAuditLog(db, {
      userId: purchase.userId,
      action: 'create',
      entityType: 'purchase',
      entityId: purchaseId,
      entityName: purchaseResult.invoiceNumber,
      changes: { totalAmount: purchase.totalAmount, items: items.length }
    })

    return purchaseResult
  })

  // Get all purchases (with optional date range)
  ipcMain.handle('db:purchases:getAll', async (_, { startDate, endDate }) => {
    if (startDate && endDate) {
      return db
        .select()
        .from(schema.purchases)
        .where(
          and(gte(schema.purchases.createdAt, startDate), lte(schema.purchases.createdAt, endDate))
        )
        .orderBy(desc(schema.purchases.createdAt))
        .all()
    }

    return db.select().from(schema.purchases).orderBy(desc(schema.purchases.createdAt)).all()
  })

  // Get purchase by ID with items
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

  // ==================== PURCHASE RETURNS ====================

  // Create purchase return
  ipcMain.handle('db:purchaseReturns:create', async (_, { purchaseReturn, items }) => {
    const returnId = uuidv4()
    const returnResult = db
      .insert(schema.purchaseReturns)
      .values({ id: returnId, ...purchaseReturn })
      .returning()
      .get()

    // Insert purchase return items
    const returnItemsData = items.map((item) => ({
      id: uuidv4(),
      returnId,
      ...item
    }))

    if (returnItemsData.length > 0) {
      db.insert(schema.purchaseReturnItems).values(returnItemsData).run()
    }

    // Update inventory - deduct returned quantities
    for (const item of items) {
      const existing = db
        .select()
        .from(schema.inventory)
        .where(eq(schema.inventory.productId, item.productId))
        .get()

      if (existing) {
        db.update(schema.inventory)
          .set({
            quantity: existing.quantity - item.quantity,
            updatedAt: new Date().toISOString()
          })
          .where(eq(schema.inventory.id, existing.id))
          .run()
      }
    }

    // Update bank account balance if accountId is provided (add money back)
    if (purchaseReturn.accountId && purchaseReturn.refundAmount > 0) {
      const account = db
        .select()
        .from(schema.bankAccounts)
        .where(eq(schema.bankAccounts.id, purchaseReturn.accountId))
        .get()

      if (account) {
        const currentBalance = account.currentBalance ?? 0
        const totalDeposits = account.totalDeposits ?? 0

        db.update(schema.bankAccounts)
          .set({
            currentBalance: currentBalance + purchaseReturn.refundAmount,
            totalDeposits: totalDeposits + purchaseReturn.refundAmount,
            updatedAt: new Date().toISOString()
          })
          .where(eq(schema.bankAccounts.id, purchaseReturn.accountId))
          .run()
      }
    }

    // Create audit log
    createAuditLog(db, {
      userId: purchaseReturn.userId,
      action: 'create',
      entityType: 'purchase_return',
      entityId: returnResult.id,
      entityName: returnResult.returnNumber,
      changes: { refundAmount: purchaseReturn.refundAmount, items: items.length }
    })

    return returnResult
  })

  // Get all purchase returns (with optional date range)
  ipcMain.handle('db:purchaseReturns:getAll', async (_, { startDate, endDate }) => {
    if (startDate && endDate) {
      return db
        .select()
        .from(schema.purchaseReturns)
        .where(
          and(
            gte(schema.purchaseReturns.createdAt, startDate),
            lte(schema.purchaseReturns.createdAt, endDate)
          )
        )
        .orderBy(desc(schema.purchaseReturns.createdAt))
        .all()
    }

    return db
      .select()
      .from(schema.purchaseReturns)
      .orderBy(desc(schema.purchaseReturns.createdAt))
      .all()
  })

  // Get purchase return by ID with items
  ipcMain.handle('db:purchaseReturns:getById', async (_, id: string) => {
    const purchaseReturn = db
      .select()
      .from(schema.purchaseReturns)
      .where(eq(schema.purchaseReturns.id, id))
      .get()

    if (purchaseReturn) {
      const items = db
        .select()
        .from(schema.purchaseReturnItems)
        .where(eq(schema.purchaseReturnItems.returnId, id))
        .all()
      return { ...purchaseReturn, items }
    }
    return null
  })
}
