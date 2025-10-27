import { and, desc, eq, gte, lte, sql } from 'drizzle-orm'
import { app, dialog, ipcMain } from 'electron'
import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { getDatabase } from '../database'
import * as schema from '../database/schema'

export function registerDatabaseHandlers(): void {
  const db = getDatabase()

  // ==================== USERS ====================
  ipcMain.handle('db:users:getAll', async () => {
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

  // ==================== UNITS ====================
  ipcMain.handle('db:units:getAll', async () => {
    return db.select().from(schema.units).where(eq(schema.units.isActive, true)).all()
  })

  ipcMain.handle('db:units:create', async (_, data) => {
    const id = uuidv4()
    return db
      .insert(schema.units)
      .values({ id, ...data })
      .returning()
      .get()
  })

  ipcMain.handle('db:units:update', async (_, { id, data }) => {
    return db
      .update(schema.units)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(schema.units.id, id))
      .returning()
      .get()
  })

  ipcMain.handle('db:units:delete', async (_, id: string) => {
    return db.update(schema.units).set({ isActive: false }).where(eq(schema.units.id, id)).run()
  })

  // ==================== SUPPLIERS ====================
  ipcMain.handle('db:suppliers:getAll', async () => {
    return db.select().from(schema.suppliers).where(eq(schema.suppliers.isActive, true)).all()
  })

  ipcMain.handle('db:suppliers:create', async (_, data) => {
    const id = uuidv4()

    // currentBalance should start at 0, not equal to openingBalance
    // openingBalance is a separate field that stays constant
    const supplierData = {
      ...data,
      currentBalance: 0
    }

    const supplier = db
      .insert(schema.suppliers)
      .values({ id, ...supplierData })
      .returning()
      .get()

    // Create opening balance ledger entry if opening balance exists
    if (supplier.openingBalance && supplier.openingBalance !== 0) {
      const ledgerId = uuidv4()
      db.insert(schema.supplierLedgerEntries)
        .values({
          id: ledgerId,
          supplierId: supplier.id,
          type: 'opening_balance',
          referenceNumber: 'OPENING',
          description: 'Opening Balance',
          debit: supplier.openingBalance > 0 ? supplier.openingBalance : 0,
          credit: supplier.openingBalance < 0 ? Math.abs(supplier.openingBalance) : 0,
          balance: supplier.openingBalance,
          transactionDate:
            supplier.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
          createdBy: data.userId || null
        })
        .run()
    }

    return supplier
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

  // ==================== SUPPLIER PAYMENTS ====================
  ipcMain.handle('db:supplierPayments:create', async (_, data) => {
    // Validate that accountId is provided
    if (!data.accountId) {
      throw new Error('Payment account is required')
    }

    const id = uuidv4()
    const payment = db
      .insert(schema.supplierPayments)
      .values({ id, ...data })
      .returning()
      .get()

    // Update supplier balance
    const supplier = db
      .select()
      .from(schema.suppliers)
      .where(eq(schema.suppliers.id, data.supplierId))
      .get()

    if (!supplier) {
      throw new Error('Supplier not found')
    }

    const previousBalance = supplier.currentBalance ?? 0
    const totalPayments = supplier.totalPayments ?? 0
    const newBalance = previousBalance - data.amount

    db.update(schema.suppliers)
      .set({
        currentBalance: newBalance,
        totalPayments: totalPayments + data.amount,
        updatedAt: new Date().toISOString()
      })
      .where(eq(schema.suppliers.id, data.supplierId))
      .run()

    // Update bank account (now required)
    const account = db
      .select()
      .from(schema.bankAccounts)
      .where(eq(schema.bankAccounts.id, data.accountId))
      .get()

    if (!account) {
      throw new Error('Payment account not found')
    }

    const accountBalance = account.currentBalance ?? 0
    if (accountBalance < data.amount) {
      throw new Error(
        `Insufficient balance in ${account.name}. Available: ${accountBalance.toFixed(2)}`
      )
    }

    const totalWithdrawals = account.totalWithdrawals ?? 0

    db.update(schema.bankAccounts)
      .set({
        currentBalance: accountBalance - data.amount,
        totalWithdrawals: totalWithdrawals + data.amount,
        updatedAt: new Date().toISOString()
      })
      .where(eq(schema.bankAccounts.id, data.accountId))
      .run()

    // Create ledger entry
    // For supplier ledger: Payment reduces what we owe (credit entry reduces payable balance)
    const ledgerId = uuidv4()

    // Calculate total balance including opening balance
    const openingBalance = supplier.openingBalance ?? 0
    const totalBalance = openingBalance + newBalance

    db.insert(schema.supplierLedgerEntries)
      .values({
        id: ledgerId,
        supplierId: data.supplierId,
        type: 'payment',
        referenceId: id,
        referenceNumber: data.referenceNumber,
        description: `Payment: ${data.notes || 'Supplier payment'}`,
        debit: 0,
        credit: data.amount,
        balance: totalBalance,
        transactionDate: data.paymentDate,
        createdBy: data.userId
      })
      .run()

    return payment
  })

  ipcMain.handle(
    'db:supplierPayments:getBySupplierId',
    async (_, { supplierId, startDate, endDate }) => {
      if (startDate && endDate) {
        return db
          .select()
          .from(schema.supplierPayments)
          .where(
            and(
              eq(schema.supplierPayments.supplierId, supplierId),
              gte(schema.supplierPayments.paymentDate, startDate),
              lte(schema.supplierPayments.paymentDate, endDate)
            )
          )
          .orderBy(desc(schema.supplierPayments.paymentDate))
          .all()
      }

      return db
        .select()
        .from(schema.supplierPayments)
        .where(eq(schema.supplierPayments.supplierId, supplierId))
        .orderBy(desc(schema.supplierPayments.paymentDate))
        .all()
    }
  )

  // ==================== SUPPLIER LEDGER ====================
  ipcMain.handle('db:supplierLedger:getEntries', async (_, { supplierId, startDate, endDate }) => {
    if (startDate && endDate) {
      return db
        .select()
        .from(schema.supplierLedgerEntries)
        .where(
          and(
            eq(schema.supplierLedgerEntries.supplierId, supplierId),
            gte(schema.supplierLedgerEntries.transactionDate, startDate),
            lte(schema.supplierLedgerEntries.transactionDate, endDate)
          )
        )
        .orderBy(schema.supplierLedgerEntries.transactionDate)
        .all()
    }

    return db
      .select()
      .from(schema.supplierLedgerEntries)
      .where(eq(schema.supplierLedgerEntries.supplierId, supplierId))
      .orderBy(schema.supplierLedgerEntries.transactionDate)
      .all()
  })

  ipcMain.handle('db:supplierLedger:createEntry', async (_, data) => {
    const id = uuidv4()
    return db
      .insert(schema.supplierLedgerEntries)
      .values({ id, ...data })
      .returning()
      .get()
  })

  // ==================== BANK ACCOUNTS ====================
  ipcMain.handle('db:bankAccounts:getAll', async () => {
    return db.select().from(schema.bankAccounts).where(eq(schema.bankAccounts.isActive, true)).all()
  })

  ipcMain.handle('db:bankAccounts:create', async (_, data) => {
    const id = uuidv4()
    const currentBalance = data.openingBalance || 0
    return db
      .insert(schema.bankAccounts)
      .values({ id, ...data, currentBalance })
      .returning()
      .get()
  })

  ipcMain.handle('db:bankAccounts:update', async (_, { id, data }) => {
    return db
      .update(schema.bankAccounts)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(schema.bankAccounts.id, id))
      .returning()
      .get()
  })

  ipcMain.handle('db:bankAccounts:delete', async (_, id: string) => {
    return db
      .update(schema.bankAccounts)
      .set({ isActive: false })
      .where(eq(schema.bankAccounts.id, id))
      .run()
  })

  ipcMain.handle('db:bankAccounts:updateBalance', async (_, { id, amount, type }) => {
    const account = db
      .select()
      .from(schema.bankAccounts)
      .where(eq(schema.bankAccounts.id, id))
      .get()

    if (!account) throw new Error('Account not found')

    const currentBalance = account.currentBalance ?? 0
    const totalWithdrawals = account.totalWithdrawals ?? 0
    const totalDeposits = account.totalDeposits ?? 0

    const newBalance = type === 'debit' ? currentBalance - amount : currentBalance + amount
    const newTotalWithdrawals = type === 'debit' ? totalWithdrawals + amount : totalWithdrawals
    const newTotalDeposits = type === 'credit' ? totalDeposits + amount : totalDeposits

    return db
      .update(schema.bankAccounts)
      .set({
        currentBalance: newBalance,
        totalWithdrawals: newTotalWithdrawals,
        totalDeposits: newTotalDeposits,
        updatedAt: new Date().toISOString()
      })
      .where(eq(schema.bankAccounts.id, id))
      .returning()
      .get()
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
  ipcMain.handle('db:inventory:getAll', async () => {
    return db
      .select({
        id: schema.inventory.id,
        productId: schema.inventory.productId,
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
      .all()
  })

  ipcMain.handle('db:inventory:getLowStock', async () => {
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
      .where(sql`${schema.inventory.quantity} <= ${schema.products.reorderLevel}`)
      .all()
  })

  ipcMain.handle('db:inventory:updateQuantity', async (_, { productId, quantity }) => {
    try {
      // Validate that product exists
      const product = db
        .select()
        .from(schema.products)
        .where(eq(schema.products.id, productId))
        .get()

      if (!product) {
        throw new Error(`Product with ID ${productId} does not exist`)
      }

      const existing = db
        .select()
        .from(schema.inventory)
        .where(eq(schema.inventory.productId, productId))
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
        return db.insert(schema.inventory).values({ id, productId, quantity }).returning().get()
      }
    } catch (error) {
      console.error('Error updating inventory quantity:', error)
      throw error
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

    return saleResult
  })

  ipcMain.handle('db:sales:getAll', async (_, { startDate, endDate }) => {
    if (startDate && endDate) {
      return db
        .select()
        .from(schema.sales)
        .where(and(gte(schema.sales.createdAt, startDate), lte(schema.sales.createdAt, endDate)))
        .orderBy(desc(schema.sales.createdAt))
        .all()
    }

    return db.select().from(schema.sales).orderBy(desc(schema.sales.createdAt)).all()
  })

  ipcMain.handle('db:sales:getById', async (_, id: string) => {
    const sale = db.select().from(schema.sales).where(eq(schema.sales.id, id)).get()

    if (sale) {
      const items = db.select().from(schema.saleItems).where(eq(schema.saleItems.saleId, id)).all()
      return { ...sale, items }
    }
    return null
  })

  // ==================== SALES RETURNS ====================
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

    return returnResult
  })

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

    return purchaseResult
  })

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

    return returnResult
  })

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

  // ==================== EXPENSES ====================
  ipcMain.handle('db:expenses:create', async (_, data) => {
    const id = uuidv4()
    return db
      .insert(schema.expenses)
      .values({ id, ...data })
      .returning()
      .get()
  })

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

  // ==================== AUDIT LOGS ====================
  ipcMain.handle('db:auditLogs:create', async (_, data) => {
    const id = uuidv4()
    return db
      .insert(schema.auditLogs)
      .values({ id, ...data })
      .run()
  })

  // ==================== DATABASE BACKUP & RESTORE ====================
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
}
