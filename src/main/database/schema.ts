import { sql } from 'drizzle-orm'
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// Branches table
export const branches = sqliteTable('branches', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  code: text('code').notNull().unique(),
  address: text('address'),
  phone: text('phone'),
  email: text('email'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
})

// Users table
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  fullName: text('full_name').notNull(),
  email: text('email'),
  phone: text('phone'),
  role: text('role').notNull(), // 'admin', 'manager', 'cashier', 'pharmacist'
  branchId: text('branch_id').references(() => branches.id),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
})

// Categories table
export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  parentId: text('parent_id'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
})

// Suppliers table
export const suppliers = sqliteTable('suppliers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  code: text('code').notNull().unique(),
  contactPerson: text('contact_person'),
  phone: text('phone'),
  email: text('email'),
  address: text('address'),
  taxNumber: text('tax_number'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
})

// Products table
export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  genericName: text('generic_name'),
  barcode: text('barcode').unique(),
  sku: text('sku').notNull().unique(),
  categoryId: text('category_id').references(() => categories.id),
  supplierId: text('supplier_id').references(() => suppliers.id),
  description: text('description'),
  manufacturer: text('manufacturer'),
  unit: text('unit').notNull(), // 'piece', 'box', 'strip', 'bottle', etc.
  prescriptionRequired: integer('prescription_required', { mode: 'boolean' }).default(false),
  reorderLevel: integer('reorder_level').default(10),
  sellingPrice: real('selling_price').notNull(),
  costPrice: real('cost_price').notNull(),
  taxRate: real('tax_rate').default(0),
  discountPercent: real('discount_percent').default(0),
  imageUrl: text('image_url'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
})

// Inventory table
export const inventory = sqliteTable('inventory', {
  id: text('id').primaryKey(),
  productId: text('product_id')
    .notNull()
    .references(() => products.id),
  branchId: text('branch_id')
    .notNull()
    .references(() => branches.id),
  batchNumber: text('batch_number'),
  quantity: integer('quantity').notNull().default(0),
  expiryDate: text('expiry_date'),
  manufactureDate: text('manufacture_date'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
})

// Customers table
export const customers = sqliteTable('customers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  phone: text('phone').unique(),
  email: text('email'),
  address: text('address'),
  dateOfBirth: text('date_of_birth'),
  gender: text('gender'),
  loyaltyPoints: integer('loyalty_points').default(0),
  allergies: text('allergies'),
  notes: text('notes'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
})

// Sales table
export const sales = sqliteTable('sales', {
  id: text('id').primaryKey(),
  invoiceNumber: text('invoice_number').notNull().unique(),
  branchId: text('branch_id')
    .notNull()
    .references(() => branches.id),
  customerId: text('customer_id').references(() => customers.id),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  subtotal: real('subtotal').notNull(),
  taxAmount: real('tax_amount').default(0),
  discountAmount: real('discount_amount').default(0),
  totalAmount: real('total_amount').notNull(),
  paidAmount: real('paid_amount').notNull(),
  changeAmount: real('change_amount').default(0),
  paymentMethod: text('payment_method').notNull(), // 'cash', 'card', 'mobile', 'credit'
  status: text('status').notNull().default('completed'), // 'completed', 'refunded', 'cancelled'
  notes: text('notes'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
})

// Sale Items table
export const saleItems = sqliteTable('sale_items', {
  id: text('id').primaryKey(),
  saleId: text('sale_id')
    .notNull()
    .references(() => sales.id, { onDelete: 'cascade' }),
  productId: text('product_id')
    .notNull()
    .references(() => products.id),
  productName: text('product_name').notNull(),
  quantity: integer('quantity').notNull(),
  unitPrice: real('unit_price').notNull(),
  discountPercent: real('discount_percent').default(0),
  taxRate: real('tax_rate').default(0),
  subtotal: real('subtotal').notNull(),
  batchNumber: text('batch_number'),
  expiryDate: text('expiry_date')
})

// Purchases table
export const purchases = sqliteTable('purchases', {
  id: text('id').primaryKey(),
  invoiceNumber: text('invoice_number').notNull().unique(),
  branchId: text('branch_id')
    .notNull()
    .references(() => branches.id),
  supplierId: text('supplier_id')
    .notNull()
    .references(() => suppliers.id),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  subtotal: real('subtotal').notNull(),
  taxAmount: real('tax_amount').default(0),
  discountAmount: real('discount_amount').default(0),
  totalAmount: real('total_amount').notNull(),
  paidAmount: real('paid_amount').default(0),
  dueAmount: real('due_amount').default(0),
  paymentStatus: text('payment_status').notNull().default('pending'), // 'pending', 'partial', 'paid'
  status: text('status').notNull().default('received'), // 'ordered', 'received', 'cancelled'
  notes: text('notes'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
})

// Purchase Items table
export const purchaseItems = sqliteTable('purchase_items', {
  id: text('id').primaryKey(),
  purchaseId: text('purchase_id')
    .notNull()
    .references(() => purchases.id, { onDelete: 'cascade' }),
  productId: text('product_id')
    .notNull()
    .references(() => products.id),
  productName: text('product_name').notNull(),
  quantity: integer('quantity').notNull(),
  unitPrice: real('unit_price').notNull(),
  discountPercent: real('discount_percent').default(0),
  taxRate: real('tax_rate').default(0),
  subtotal: real('subtotal').notNull(),
  batchNumber: text('batch_number'),
  expiryDate: text('expiry_date'),
  manufactureDate: text('manufacture_date')
})

// Expenses table
export const expenses = sqliteTable('expenses', {
  id: text('id').primaryKey(),
  branchId: text('branch_id')
    .notNull()
    .references(() => branches.id),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  category: text('category').notNull(), // 'rent', 'utilities', 'salary', 'maintenance', 'other'
  amount: real('amount').notNull(),
  description: text('description'),
  expenseDate: text('expense_date').notNull(),
  paymentMethod: text('payment_method').notNull(),
  receipt: text('receipt'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
})

// Prescriptions table
export const prescriptions = sqliteTable('prescriptions', {
  id: text('id').primaryKey(),
  customerId: text('customer_id')
    .notNull()
    .references(() => customers.id),
  saleId: text('sale_id').references(() => sales.id),
  doctorName: text('doctor_name'),
  doctorPhone: text('doctor_phone'),
  prescriptionNumber: text('prescription_number'),
  prescriptionDate: text('prescription_date').notNull(),
  diagnosis: text('diagnosis'),
  notes: text('notes'),
  imageUrl: text('image_url'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
})

// Stock Transfers table
export const stockTransfers = sqliteTable('stock_transfers', {
  id: text('id').primaryKey(),
  fromBranchId: text('from_branch_id')
    .notNull()
    .references(() => branches.id),
  toBranchId: text('to_branch_id')
    .notNull()
    .references(() => branches.id),
  productId: text('product_id')
    .notNull()
    .references(() => products.id),
  quantity: integer('quantity').notNull(),
  batchNumber: text('batch_number'),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  status: text('status').notNull().default('pending'), // 'pending', 'approved', 'rejected', 'completed'
  notes: text('notes'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  completedAt: text('completed_at')
})

// Settings table
export const settings = sqliteTable('settings', {
  id: text('id').primaryKey(),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  description: text('description'),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
})

// Audit Logs table
export const auditLogs = sqliteTable('audit_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  branchId: text('branch_id').references(() => branches.id),
  action: text('action').notNull(), // 'create', 'update', 'delete', 'login', 'logout'
  entityType: text('entity_type').notNull(), // 'sale', 'product', 'user', etc.
  entityId: text('entity_id'),
  changes: text('changes'), // JSON string of changes
  ipAddress: text('ip_address'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
})
