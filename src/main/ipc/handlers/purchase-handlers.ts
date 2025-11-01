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

    // Insert purchase items with product names and subtotals
    const purchaseItemsData = items.map((item) => {
      // Get product name
      const product = db
        .select({ name: schema.products.name })
        .from(schema.products)
        .where(eq(schema.products.id, item.productId))
        .get()

      const productName = product?.name || 'Unknown Product'
      const subtotal = item.quantity * item.unitPrice
      const discountPercent = item.discountPercent || 0
      const taxRate = item.taxRate || 0

      return {
        id: uuidv4(),
        purchaseId,
        productId: item.productId,
        productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountPercent,
        taxRate,
        subtotal,
        batchNumber: item.batchNumber || null,
        expiryDate: item.expiryDate || null,
        manufactureDate: item.manufactureDate || null
      }
    })

    if (purchaseItemsData.length > 0) {
      db.insert(schema.purchaseItems).values(purchaseItemsData).run()
    }

    // Update inventory (convert package units to base units)
    for (const item of items) {
      // Get product to check for package unit conversion
      const product = db
        .select()
        .from(schema.products)
        .where(eq(schema.products.id, item.productId))
        .get()

      // Calculate actual quantity in base units
      // If product has package units, multiply purchase quantity by unitsPerPackage
      let actualQuantity = item.quantity
      if (product && product.unitsPerPackage && product.unitsPerPackage > 1) {
        actualQuantity = item.quantity * product.unitsPerPackage
      }

      const existing = db
        .select()
        .from(schema.inventory)
        .where(eq(schema.inventory.productId, item.productId))
        .get()

      if (existing) {
        db.update(schema.inventory)
          .set({
            quantity: existing.quantity + actualQuantity,
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
            quantity: actualQuantity,
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
      const totalPayments = supplier.totalPayments ?? 0

      // Add purchase amount (increases payable), subtract paid amount (reduces payable)
      const netBalanceChange = purchase.totalAmount - (purchase.paidAmount || 0)

      db.update(schema.suppliers)
        .set({
          currentBalance: currentBalance + netBalanceChange,
          totalPurchases: totalPurchases + purchase.totalAmount,
          totalPayments: totalPayments + (purchase.paidAmount || 0),
          updatedAt: new Date().toISOString()
        })
        .where(eq(schema.suppliers.id, purchase.supplierId))
        .run()

      // Create ledger entry for purchase
      const purchaseLedgerId = uuidv4()
      let runningBalance = currentBalance + purchase.totalAmount

      // Calculate total balance including opening balance
      const openingBalance = supplier.openingBalance ?? 0

      db.insert(schema.supplierLedgerEntries)
        .values({
          id: purchaseLedgerId,
          supplierId: purchase.supplierId,
          type: 'purchase',
          referenceId: purchaseId,
          referenceNumber: purchase.invoiceNumber,
          description: `Purchase: ${purchase.notes || 'Goods purchased'}`,
          debit: purchase.totalAmount,
          credit: 0,
          balance: openingBalance + runningBalance,
          transactionDate: new Date().toISOString().split('T')[0],
          createdBy: purchase.userId
        })
        .run()

      // If payment was made, create a payment ledger entry
      if (purchase.paidAmount && purchase.paidAmount > 0) {
        const paymentLedgerId = uuidv4()
        runningBalance = runningBalance - purchase.paidAmount

        db.insert(schema.supplierLedgerEntries)
          .values({
            id: paymentLedgerId,
            supplierId: purchase.supplierId,
            type: 'payment',
            referenceId: purchaseId,
            referenceNumber: `Payment for ${purchase.invoiceNumber}`,
            description: `Payment for purchase ${purchase.invoiceNumber}`,
            debit: 0,
            credit: purchase.paidAmount,
            balance: openingBalance + runningBalance,
            transactionDate: new Date().toISOString().split('T')[0],
            createdBy: purchase.userId
          })
          .run()
      }
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
    let purchases
    if (startDate && endDate) {
      purchases = db
        .select()
        .from(schema.purchases)
        .where(
          and(gte(schema.purchases.createdAt, startDate), lte(schema.purchases.createdAt, endDate))
        )
        .orderBy(desc(schema.purchases.createdAt))
        .all()
    } else {
      purchases = db.select().from(schema.purchases).orderBy(desc(schema.purchases.createdAt)).all()
    }

    // Enrich with supplier names
    return purchases.map((purchase) => {
      const supplier = db
        .select({ name: schema.suppliers.name })
        .from(schema.suppliers)
        .where(eq(schema.suppliers.id, purchase.supplierId))
        .get()

      return {
        ...purchase,
        supplierName: supplier?.name || null
      }
    })
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

  // Delete purchase
  ipcMain.handle('db:purchases:delete', async (_, { id, userId }) => {
    const purchase = db.select().from(schema.purchases).where(eq(schema.purchases.id, id)).get()

    if (!purchase) {
      throw new Error('Purchase not found')
    }

    // Get purchase items before deletion
    const purchaseItems = db
      .select()
      .from(schema.purchaseItems)
      .where(eq(schema.purchaseItems.purchaseId, id))
      .all()

    // Deduct inventory quantities
    for (const item of purchaseItems) {
      // Get product to check for package unit conversion
      const product = db
        .select()
        .from(schema.products)
        .where(eq(schema.products.id, item.productId))
        .get()

      // Calculate actual quantity in base units (same logic as creation)
      let actualQuantity = item.quantity
      if (product && product.unitsPerPackage && product.unitsPerPackage > 1) {
        actualQuantity = item.quantity * product.unitsPerPackage
      }

      const existing = db
        .select()
        .from(schema.inventory)
        .where(eq(schema.inventory.productId, item.productId))
        .get()

      if (existing) {
        db.update(schema.inventory)
          .set({
            quantity: Math.max(0, existing.quantity - actualQuantity), // Prevent negative
            updatedAt: new Date().toISOString()
          })
          .where(eq(schema.inventory.id, existing.id))
          .run()
      }
    }

    // Restore bank account balance if payment was made
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
            currentBalance: currentBalance + purchase.paidAmount, // Add back the payment
            totalWithdrawals: Math.max(0, totalWithdrawals - purchase.paidAmount), // Reduce withdrawals
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
      const totalPayments = supplier.totalPayments ?? 0

      // Reverse the balance change: subtract purchase amount, add back payment
      const netBalanceChange = purchase.totalAmount - (purchase.paidAmount || 0)

      db.update(schema.suppliers)
        .set({
          currentBalance: Math.max(0, currentBalance - netBalanceChange),
          totalPurchases: Math.max(0, totalPurchases - purchase.totalAmount),
          totalPayments: Math.max(0, totalPayments - (purchase.paidAmount || 0)),
          updatedAt: new Date().toISOString()
        })
        .where(eq(schema.suppliers.id, purchase.supplierId))
        .run()
    }

    // Delete ledger entries related to this purchase
    db.delete(schema.supplierLedgerEntries)
      .where(eq(schema.supplierLedgerEntries.referenceId, id))
      .run()

    // Delete purchase (cascade will delete purchase items)
    db.delete(schema.purchases).where(eq(schema.purchases.id, id)).run()

    // Create audit log
    createAuditLog(db, {
      userId,
      action: 'delete',
      entityType: 'purchase',
      entityId: id,
      entityName: purchase.invoiceNumber,
      changes: { totalAmount: purchase.totalAmount, itemsDeleted: purchaseItems.length }
    })

    return { success: true, message: 'Purchase deleted successfully' }
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
    let purchaseReturns
    if (startDate && endDate) {
      purchaseReturns = db
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
    } else {
      purchaseReturns = db
        .select()
        .from(schema.purchaseReturns)
        .orderBy(desc(schema.purchaseReturns.createdAt))
        .all()
    }

    // Enrich with related names
    return purchaseReturns.map((purchaseReturn) => {
      // Get user name
      let userName = ''
      if (purchaseReturn.userId) {
        const user = db
          .select({ username: schema.users.username })
          .from(schema.users)
          .where(eq(schema.users.id, purchaseReturn.userId))
          .get()
        userName = user?.username || ''
      }

      // Get supplier name
      let supplierName = ''
      if (purchaseReturn.supplierId) {
        const supplier = db
          .select({ name: schema.suppliers.name })
          .from(schema.suppliers)
          .where(eq(schema.suppliers.id, purchaseReturn.supplierId))
          .get()
        supplierName = supplier?.name || ''
      }

      // Get account name
      let accountName: string | null = null
      if (purchaseReturn.accountId) {
        const account = db
          .select({ name: schema.bankAccounts.name })
          .from(schema.bankAccounts)
          .where(eq(schema.bankAccounts.id, purchaseReturn.accountId))
          .get()
        accountName = account?.name || null
      }

      return { ...purchaseReturn, userName, supplierName, accountName }
    })
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

      // Get user name
      let userName = ''
      if (purchaseReturn.userId) {
        const user = db
          .select({ username: schema.users.username })
          .from(schema.users)
          .where(eq(schema.users.id, purchaseReturn.userId))
          .get()
        userName = user?.username || ''
      }

      // Get supplier name
      let supplierName = ''
      if (purchaseReturn.supplierId) {
        const supplier = db
          .select({ name: schema.suppliers.name })
          .from(schema.suppliers)
          .where(eq(schema.suppliers.id, purchaseReturn.supplierId))
          .get()
        supplierName = supplier?.name || ''
      }

      // Get account name
      let accountName: string | null = null
      if (purchaseReturn.accountId) {
        const account = db
          .select({ name: schema.bankAccounts.name })
          .from(schema.bankAccounts)
          .where(eq(schema.bankAccounts.id, purchaseReturn.accountId))
          .get()
        accountName = account?.name || null
      }

      return { ...purchaseReturn, items, userName, supplierName, accountName }
    }
    return null
  })
}
