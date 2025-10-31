import { and, desc, eq, gte, lte, sql } from 'drizzle-orm'
import { ipcMain } from 'electron'
import { v4 as uuidv4 } from 'uuid'
import { getDatabase } from '../../database'
import * as schema from '../../database/schema'
import { createAuditLog } from '../utils/audit-logger'

export function registerSalesHandlers(): void {
  const db = getDatabase()

  // ==================== SALES ====================

  // Create new sale
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
            WHERE product_id = ${item.productId}`
      )
    }

    // Update bank account balance if accountId is provided (add money from sale)
    if (sale.accountId && sale.paidAmount > 0) {
      const account = db
        .select()
        .from(schema.bankAccounts)
        .where(eq(schema.bankAccounts.id, sale.accountId))
        .get()

      if (account) {
        const currentBalance = account.currentBalance ?? 0
        const totalDeposits = account.totalDeposits ?? 0

        db.update(schema.bankAccounts)
          .set({
            currentBalance: currentBalance + sale.paidAmount,
            totalDeposits: totalDeposits + sale.paidAmount,
            updatedAt: new Date().toISOString()
          })
          .where(eq(schema.bankAccounts.id, sale.accountId))
          .run()
      }
    }

    // Update customer loyalty points and total purchases if customer is linked
    if (sale.customerId) {
      const customer = db
        .select()
        .from(schema.customers)
        .where(eq(schema.customers.id, sale.customerId))
        .get()

      if (customer) {
        const currentLoyaltyPoints = customer.loyaltyPoints ?? 0
        const currentTotalPurchases = customer.totalPurchases ?? 0
        const pointsRedeemed = sale.pointsRedeemed ?? 0

        // Calculate the amount on which new points should be earned
        // This should be the final amount paid (totalAmount) which already has points discount applied
        // So we earn points on what customer actually paid
        const newPointsEarned = Math.floor(sale.totalAmount / 10)

        // Calculate final points: (current - redeemed) + earned
        // First deduct redeemed points, then add newly earned points
        const finalPoints = Math.max(0, currentLoyaltyPoints - pointsRedeemed + newPointsEarned)

        db.update(schema.customers)
          .set({
            loyaltyPoints: finalPoints,
            totalPurchases: currentTotalPurchases + sale.totalAmount,
            updatedAt: new Date().toISOString()
          })
          .where(eq(schema.customers.id, sale.customerId))
          .run()
      }
    }

    // Create audit log
    createAuditLog(db, {
      userId: sale.userId,
      action: 'create',
      entityType: 'sale',
      entityId: saleId,
      entityName: saleResult.invoiceNumber,
      changes: { totalAmount: sale.totalAmount, items: items.length }
    })

    return saleResult
  })

  // Get all sales (with optional date range)
  ipcMain.handle('db:sales:getAll', async (_, { startDate, endDate }) => {
    if (startDate && endDate) {
      return db
        .select({
          id: schema.sales.id,
          invoiceNumber: schema.sales.invoiceNumber,
          customerId: schema.sales.customerId,
          customerName: schema.customers.name,
          accountId: schema.sales.accountId,
          userId: schema.sales.userId,
          subtotal: schema.sales.subtotal,
          taxAmount: schema.sales.taxAmount,
          discountAmount: schema.sales.discountAmount,
          totalAmount: schema.sales.totalAmount,
          paidAmount: schema.sales.paidAmount,
          changeAmount: schema.sales.changeAmount,
          paymentMethod: schema.sales.paymentMethod,
          status: schema.sales.status,
          notes: schema.sales.notes,
          createdAt: schema.sales.createdAt
        })
        .from(schema.sales)
        .leftJoin(schema.customers, eq(schema.sales.customerId, schema.customers.id))
        .where(and(gte(schema.sales.createdAt, startDate), lte(schema.sales.createdAt, endDate)))
        .orderBy(desc(schema.sales.createdAt))
        .all()
    }

    return db
      .select({
        id: schema.sales.id,
        invoiceNumber: schema.sales.invoiceNumber,
        customerId: schema.sales.customerId,
        customerName: schema.customers.name,
        accountId: schema.sales.accountId,
        userId: schema.sales.userId,
        subtotal: schema.sales.subtotal,
        taxAmount: schema.sales.taxAmount,
        discountAmount: schema.sales.discountAmount,
        totalAmount: schema.sales.totalAmount,
        paidAmount: schema.sales.paidAmount,
        changeAmount: schema.sales.changeAmount,
        paymentMethod: schema.sales.paymentMethod,
        status: schema.sales.status,
        notes: schema.sales.notes,
        createdAt: schema.sales.createdAt
      })
      .from(schema.sales)
      .leftJoin(schema.customers, eq(schema.sales.customerId, schema.customers.id))
      .orderBy(desc(schema.sales.createdAt))
      .all()
  })

  // Get sale by ID with items
  ipcMain.handle('db:sales:getById', async (_, id: string) => {
    const sale = db
      .select({
        id: schema.sales.id,
        invoiceNumber: schema.sales.invoiceNumber,
        customerId: schema.sales.customerId,
        customerName: schema.customers.name,
        accountId: schema.sales.accountId,
        userId: schema.sales.userId,
        subtotal: schema.sales.subtotal,
        taxAmount: schema.sales.taxAmount,
        discountAmount: schema.sales.discountAmount,
        totalAmount: schema.sales.totalAmount,
        paidAmount: schema.sales.paidAmount,
        changeAmount: schema.sales.changeAmount,
        paymentMethod: schema.sales.paymentMethod,
        status: schema.sales.status,
        notes: schema.sales.notes,
        createdAt: schema.sales.createdAt
      })
      .from(schema.sales)
      .leftJoin(schema.customers, eq(schema.sales.customerId, schema.customers.id))
      .where(eq(schema.sales.id, id))
      .get()

    if (sale) {
      const items = db.select().from(schema.saleItems).where(eq(schema.saleItems.saleId, id)).all()
      return { ...sale, items }
    }
    return null
  })

  // ==================== SALES RETURNS ====================

  // Create sales return
  ipcMain.handle('db:salesReturns:create', async (_, { salesReturn, items }) => {
    const returnId = uuidv4()
    const returnResult = db
      .insert(schema.salesReturns)
      .values({ id: returnId, ...salesReturn })
      .returning()
      .get()

    // Insert sales return items
    const returnItemsData = items.map((item) => ({
      id: uuidv4(),
      returnId,
      ...item
    }))

    if (returnItemsData.length > 0) {
      db.insert(schema.salesReturnItems).values(returnItemsData).run()
    }

    // Update inventory - add returned quantities back
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
            updatedAt: new Date().toISOString()
          })
          .where(eq(schema.inventory.id, existing.id))
          .run()
      }
    }

    // Update bank account balance if accountId is provided (deduct refund amount)
    if (salesReturn.accountId && salesReturn.refundAmount > 0) {
      const account = db
        .select()
        .from(schema.bankAccounts)
        .where(eq(schema.bankAccounts.id, salesReturn.accountId))
        .get()

      if (account) {
        const currentBalance = account.currentBalance ?? 0
        const totalWithdrawals = account.totalWithdrawals ?? 0

        db.update(schema.bankAccounts)
          .set({
            currentBalance: currentBalance - salesReturn.refundAmount,
            totalWithdrawals: totalWithdrawals + salesReturn.refundAmount,
            updatedAt: new Date().toISOString()
          })
          .where(eq(schema.bankAccounts.id, salesReturn.accountId))
          .run()
      }
    }

    // Update customer loyalty points and total purchases (deduct returned amount)
    if (salesReturn.customerId) {
      const customer = db
        .select()
        .from(schema.customers)
        .where(eq(schema.customers.id, salesReturn.customerId))
        .get()

      if (customer) {
        const currentLoyaltyPoints = customer.loyaltyPoints ?? 0
        const currentTotalPurchases = customer.totalPurchases ?? 0
        // Deduct loyalty points based on return amount (1 point per $10)
        const pointsToDeduct = Math.floor(salesReturn.totalAmount / 10)

        db.update(schema.customers)
          .set({
            loyaltyPoints: Math.max(0, currentLoyaltyPoints - pointsToDeduct),
            totalPurchases: Math.max(0, currentTotalPurchases - salesReturn.totalAmount),
            updatedAt: new Date().toISOString()
          })
          .where(eq(schema.customers.id, salesReturn.customerId))
          .run()
      }
    }

    // Update the original sale status and amounts
    const originalSale = db
      .select()
      .from(schema.sales)
      .where(eq(schema.sales.id, salesReturn.saleId))
      .get()

    if (originalSale) {
      // Get all sale items
      const originalSaleItems = db
        .select()
        .from(schema.saleItems)
        .where(eq(schema.saleItems.saleId, salesReturn.saleId))
        .all()

      // Get all returns for this sale (including the current one)
      const allReturns = db
        .select()
        .from(schema.salesReturnItems)
        .innerJoin(
          schema.salesReturns,
          eq(schema.salesReturnItems.returnId, schema.salesReturns.id)
        )
        .where(eq(schema.salesReturns.saleId, salesReturn.saleId))
        .all()

      // Calculate total returned quantities per product
      const returnedQuantities = new Map<string, number>()
      for (const returnRecord of allReturns) {
        const productId = returnRecord.sales_return_items.productId
        const qty = returnRecord.sales_return_items.quantity
        returnedQuantities.set(productId, (returnedQuantities.get(productId) || 0) + qty)
      }

      // Check if all items are fully returned
      let isFullyReturned = true
      let hasPartialReturn = false
      for (const saleItem of originalSaleItems) {
        const returnedQty = returnedQuantities.get(saleItem.productId) || 0
        if (returnedQty > 0 && returnedQty < saleItem.quantity) {
          hasPartialReturn = true
          isFullyReturned = false
          break
        } else if (returnedQty < saleItem.quantity) {
          isFullyReturned = false
        }
      }

      // Determine the new status (keep original totalAmount intact for history)
      let newStatus = 'completed'
      if (isFullyReturned) {
        newStatus = 'refunded'
      } else if (hasPartialReturn || salesReturn.totalAmount > 0) {
        newStatus = 'partially_returned'
      }

      // Update sale status only (preserve original totalAmount for accurate reporting)
      db.update(schema.sales)
        .set({
          status: newStatus
        })
        .where(eq(schema.sales.id, salesReturn.saleId))
        .run()
    }

    // Create audit log
    createAuditLog(db, {
      userId: salesReturn.userId,
      action: 'create',
      entityType: 'sales_return',
      entityId: returnResult.id,
      entityName: returnResult.returnNumber,
      changes: { refundAmount: salesReturn.refundAmount, items: items.length }
    })

    return returnResult
  })

  // Get all sales returns (with optional date range)
  ipcMain.handle('db:salesReturns:getAll', async (_, { startDate, endDate }) => {
    if (startDate && endDate) {
      return db
        .select()
        .from(schema.salesReturns)
        .where(
          and(
            gte(schema.salesReturns.createdAt, startDate),
            lte(schema.salesReturns.createdAt, endDate)
          )
        )
        .orderBy(desc(schema.salesReturns.createdAt))
        .all()
    }

    return db.select().from(schema.salesReturns).orderBy(desc(schema.salesReturns.createdAt)).all()
  })

  // Get sales return by ID with items
  ipcMain.handle('db:salesReturns:getById', async (_, id: string) => {
    const salesReturn = db
      .select()
      .from(schema.salesReturns)
      .where(eq(schema.salesReturns.id, id))
      .get()

    if (salesReturn) {
      const items = db
        .select()
        .from(schema.salesReturnItems)
        .where(eq(schema.salesReturnItems.returnId, id))
        .all()
      return { ...salesReturn, items }
    }
    return null
  })
}
