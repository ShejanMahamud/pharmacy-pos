# MedixPOS - Pharmacy Management System

## Project Overview

**MedixPOS** is a comprehensive, professional-grade **Pharmacy Point-of-Sale (POS) Management System** built as a desktop application using **Electron**, **React**, and **TypeScript**. This licensed software provides end-to-end pharmacy management capabilities including inventory control, sales transactions, customer management, supplier accounting, employee management, and financial reporting.

---

## Technical Architecture

### Technology Stack

#### Frontend

- **Framework**: React 19+ with TypeScript
- **UI Library**: Material-UI (MUI) v7+ with Emotion styling
- **State Management**: Zustand (lightweight state management)
- **Routing**: React Router DOM v7+
- **Charts & Visualization**: Recharts, MUI X-Charts
- **Styling**: Tailwind CSS 4+ with PostCSS

#### Backend/Desktop

- **Platform**: Electron v38+ (cross-platform desktop app)
- **Database**: SQLite with better-sqlite3
- **ORM**: Drizzle ORM v0.44+
- **IPC Communication**: Electron IPC for secure renderer-main process communication

#### Additional Libraries

- **PDF Generation**: jsPDF with jspdf-autotable
- **Barcode Generation**: JsBarcode, react-barcode
- **Authentication**: bcryptjs for password hashing
- **Date Management**: date-fns
- **UI Notifications**: react-hot-toast
- **ID Generation**: UUID

### Project Structure

```
pharmacy-pos/
├── src/
│   ├── main/                 # Electron main process
│   │   ├── index.ts         # Main entry point
│   │   ├── database/        # Database layer
│   │   │   ├── schema.ts    # Drizzle schema definitions
│   │   │   ├── index.ts     # Database initialization
│   │   │   └── migrations/  # Database migration files
│   │   └── ipc/             # Inter-Process Communication
│   │       ├── handlers/    # IPC request handlers
│   │       └── utils/       # Audit logging utilities
│   │
│   ├── preload/             # Electron preload scripts
│   │   └── index.ts         # Secure API exposure
│   │
│   └── renderer/            # React frontend
│       └── src/
│           ├── components/  # UI components
│           ├── pages/       # Application pages
│           ├── hooks/       # Custom React hooks
│           ├── store/       # Zustand state stores
│           ├── types/       # TypeScript type definitions
│           └── utils/       # Utility functions
│
├── resources/               # Application resources
├── build/                   # Build configurations
└── [config files]           # Various configuration files
```

---

## Core Features & Modules

### 1. Authentication & Authorization

#### Role-Based Access Control (RBAC)

The system implements a sophisticated 5-tier role hierarchy:

- **Super Administrator**: Ultimate system access, can manage other admins
- **Administrator**: Full system access, manages users (except admins)
- **Manager**: Manages operations, inventory, and reports
- **Pharmacist**: Handles prescriptions, sales, and customer service
- **Cashier**: Processes sales and basic customer transactions

#### Security Features

- Password hashing with bcryptjs
- Session management with automatic logout
- Force password change on first login
- Protected routes based on permissions
- Audit logging for all sensitive operations

#### Default Accounts

```
Super Admin   -> username: superadmin  | password: super123
Admin         -> username: admin       | password: admin123
Manager       -> username: manager     | password: manager123
Pharmacist    -> username: pharmacist  | password: pharma123
Cashier       -> username: cashier     | password: cashier123
```

### 2. Point of Sale (POS) System

#### Features

- **Real-time Product Search**: Fast product lookup by name, barcode, or SKU
- **Cart Management**: Add, remove, update quantities with live calculations
- **Customer Integration**: Link sales to customer profiles for loyalty tracking
- **Multiple Payment Methods**: Cash, Card, Mobile Banking, Credit
- **Discount Management**: Percentage-based discounts on items or total
- **Loyalty Points System**: Redeem customer loyalty points on purchases
- **Tax Calculations**: Automatic tax computation per item
- **Receipt Printing**:
  - PDF receipts for standard printers
  - Thermal printer support (58mm/80mm)
  - Barcode generation on receipts
- **Change Calculation**: Automatic change computation
- **Account Selection**: Track which bank account receives payment

### 3. Inventory Management

#### Product Management

- Comprehensive product catalog with:
  - Generic names and brand names
  - Barcode and SKU support
  - Category organization
  - Supplier linkage
  - Manufacturer information
  - Prescription requirement flag
  - Product images
  - Shelf location tracking

#### Unit Conversion System

- **Base Units**: Smallest sellable unit (tablet, capsule, ml)
- **Package Units**: Bulk packaging (box, bottle, pack)
- **Automatic Conversion**: System tracks units per package
- Example: 1 Box = 10 Strips = 100 Tablets

#### Stock Tracking

- Real-time inventory levels
- Batch number tracking
- Expiry date monitoring
- Manufacturing date records
- Reorder level alerts
- Low stock notifications

#### Inventory Alerts

- Expired items tracking
- Damaged/defective items logging
- Low stock warnings on dashboard
- Automatic inventory adjustment on sales/returns

### 4. Purchase Management

#### Purchase Orders

- Create and manage supplier purchases
- Multi-item purchase invoices
- Batch and expiry date tracking
- Tax and discount calculations
- Payment status tracking (Pending, Partial, Paid)
- Due amount monitoring

#### Purchase Returns

- Return management with reason tracking
- Partial or full returns
- Automatic inventory adjustment
- Refund tracking (Pending, Partial, Refunded)
- Supplier account reconciliation

### 5. Sales Management

#### Sales Operations

- Complete sales history
- Invoice generation with unique numbers
- Customer purchase tracking
- Payment method recording
- Status management (Completed, Partially Returned, Refunded)
- Loyalty points earned tracking

#### Sales Returns

- Customer return processing
- Return reason documentation
- Partial or full refunds
- Automatic inventory restoration
- Original sale reference linking

### 6. Customer Relationship Management

#### Customer Profiles

- Personal information management
- Contact details (phone, email, address)
- Date of birth and gender
- Medical history (allergies, notes)
- Purchase history tracking
- Total purchases amount
- Loyalty points balance
- Customer search by phone/name

#### Loyalty Program

- Points earned on purchases
- Points redemption on sales
- Total purchases tracking
- Customer engagement metrics

### 7. Supplier Management

#### Supplier Accounts

- Complete supplier database
- Unique supplier codes
- Contact person and details
- Tax identification numbers
- Address and communication info

#### Supplier Accounting

- **Opening Balance**: Initial payable/receivable
- **Current Balance**: Live outstanding amount
- **Total Purchases**: Cumulative purchase value
- **Total Payments**: Sum of all payments made
- **Credit Terms**: Credit limit and payment days

#### Supplier Ledger

- Complete transaction history
- Entry types: Purchase, Payment, Return, Adjustment, Opening Balance
- Debit/Credit tracking
- Running balance calculation
- Reference number linking
- Transaction date tracking

#### Supplier Payments

- Payment recording with reference numbers
- Multiple payment methods support
- Bank account association
- Payment date tracking
- Notes and documentation

### 8. Financial Management

#### Bank Account System

- **Account Types**: Cash, Bank, Mobile Banking
- **Multiple Accounts**: Manage unlimited accounts
- **Account Details**: Name, number, bank name, branch
- **Balance Tracking**:
  - Opening balance
  - Current balance
  - Total deposits
  - Total withdrawals

#### Transaction Tracking

- Sales linked to specific accounts
- Purchases linked to payment accounts
- Supplier payments from specific accounts
- Automatic balance updates

#### Expense Management

- Expense categorization (Rent, Utilities, Salary, Maintenance, Other)
- Payment method tracking
- Receipt/document attachment
- Date-wise expense records

### 9. Human Resources Management

#### Employee Management

- User profiles with role assignment
- Contact information
- Active/Inactive status
- Creation tracking (who created which user)
- Password management

#### Salary Management

- **Salary Configuration**:
  - Basic salary
  - Allowances
  - Deductions
  - Net salary calculation
  - Payment frequency (Daily, Weekly, Monthly)
  - Bank account details
  - Effective date tracking

- **Salary Payments**:
  - Pay period tracking
  - Bonuses and deductions
  - Payment method recording
  - Bank account association
  - Transaction reference
  - Payment status

#### Attendance System

- Daily attendance marking
- Check-in/Check-out times
- Work hours calculation
- Overtime tracking
- Attendance status:
  - Present
  - Absent
  - Half Day
  - Leave
  - Holiday

#### Leave Management

- Leave request system
- Leave types: Sick, Casual, Annual, Emergency
- Date range and total days
- Approval workflow
- Rejection with reason
- Leave history tracking

### 10. Reports & Analytics

#### Dashboard Analytics

- **Today's Overview**:
  - Today's sales count
  - Today's revenue
  - Low stock count
  - Total products
  - Total customers
  - Monthly revenue

- **Visual Charts**:
  - Sales trend (last 7 days)
  - Revenue distribution by category
  - Recent sales list
  - Low stock alerts
  - Quick action buttons

#### Sales Reports

- Date range filtering
- Sales by payment method
- Sales by user/cashier
- Sales by customer
- Item-wise sales breakdown
- Revenue analysis

#### Inventory Reports

- Current stock levels
- Expiry date tracking
- Low stock items
- Inventory valuation
- Stock movement history

#### Customer Reports

- Customer purchase history
- Top customers by purchase value
- Customer loyalty analysis
- Customer demographics

#### Financial Reports

- Revenue reports
- Expense tracking
- Profit/Loss calculations
- Bank account statements
- Supplier payment reports

### 11. Audit & Compliance

#### Audit Logging

Comprehensive activity tracking for:

- User actions (create, update, delete, login, logout)
- Entity types: Sale, Product, User, Customer, Purchase, etc.
- Change tracking (JSON format)
- User information (username, ID)
- IP address and user agent
- Timestamp for all activities

#### Compliance Features

- Prescription tracking
- Doctor information recording
- Medical diagnosis documentation
- Expiry date enforcement
- Batch number tracking

### 12. Settings & Configuration

#### Store Settings

- Store name and branding
- Store address
- Contact information
- Currency selection (USD, EUR, GBP, BDT, INR)
- Tax rate configuration
- Receipt customization

#### System Settings

- User preferences
- Default configurations
- Report settings
- Printer configurations

### 13. Category & Unit Management

#### Product Categories

- Hierarchical category structure
- Parent-child relationships
- Category descriptions
- Active/Inactive status

#### Measurement Units

- Base units (tablets, capsules, ml, grams)
- Package units (box, bottle, pack)
- Unit types: Base or Package
- Symbol/Abbreviation support

---

## Database Schema

### Core Tables (25 tables)

1. **users** - User accounts and authentication
2. **categories** - Product categorization
3. **units** - Measurement units
4. **suppliers** - Supplier master data
5. **bank_accounts** - Financial accounts
6. **products** - Product catalog
7. **inventory** - Stock levels and batches
8. **customers** - Customer profiles
9. **sales** - Sales transactions
10. **sale_items** - Sales line items
11. **sales_returns** - Return transactions
12. **sales_return_items** - Return line items
13. **purchases** - Purchase orders
14. **purchase_items** - Purchase line items
15. **purchase_returns** - Purchase returns
16. **purchase_return_items** - Purchase return items
17. **expenses** - Business expenses
18. **prescriptions** - Prescription records
19. **settings** - System configuration
20. **supplier_payments** - Payment to suppliers
21. **supplier_ledger_entries** - Supplier transaction history
22. **damaged_items** - Damaged/expired stock
23. **audit_logs** - System audit trail
24. **user_salaries** - Employee salary configuration
25. **salary_payments** - Salary payment records
26. **attendance** - Employee attendance
27. **leave_requests** - Leave management

---

## Business Workflows

### Sales Workflow

1. Search and select products
2. Add to cart with quantity
3. Apply discounts if applicable
4. Select customer (optional - for loyalty)
5. Enter cash received
6. Select payment account
7. Process sale
8. Generate invoice
9. Print receipt (PDF or Thermal)
10. Auto-deduct from inventory
11. Update customer loyalty points
12. Log to audit trail

### Purchase Workflow

1. Select supplier
2. Add products with quantities
3. Enter batch numbers and expiry dates
4. Apply discounts if applicable
5. Calculate tax
6. Record payment details
7. Select payment account
8. Save purchase
9. Auto-add to inventory
10. Update supplier ledger
11. Generate purchase invoice

### Return Workflow (Sales/Purchase)

1. Select original transaction
2. Choose items to return
3. Enter return quantities
4. Specify return reason
5. Calculate refund amount
6. Process return
7. Adjust inventory automatically
8. Update accounts
9. Record in ledger

---

## Security Features

1. **Authentication**:
   - Secure login with hashed passwords
   - Session management
   - Auto-logout on inactivity
   - Force password change option

2. **Authorization**:
   - Role-based access control
   - Permission-level granularity
   - Protected API routes
   - UI element visibility based on permissions

3. **Data Integrity**:
   - Foreign key constraints
   - Transaction support
   - Audit trail for all changes
   - Data validation

4. **Privacy**:
   - Local SQLite database (no cloud dependency)
   - Secure IPC communication
   - No external data transmission

---

## User Interface

### Design System

- **Material-UI Components**: Professional, accessible UI
- **Tailwind CSS**: Utility-first styling
- **Responsive Design**: Optimized for desktop screens
- **Dark/Light Theme**: (Configurable)
- **Color Coding**: Visual status indicators
- **Toast Notifications**: User feedback system

### Key UI Features

- Fast search and filtering
- Pagination for large datasets
- Modal dialogs for forms
- Confirmation prompts for destructive actions
- Loading states and progress indicators
- Error handling and validation messages
- Quick action buttons
- Keyboard shortcuts support

---

## Printing Capabilities

### Receipt Printing

1. **PDF Receipts**:
   - A4/Letter size support
   - Professional formatting
   - Company branding
   - Barcode generation
   - Itemized details
   - Tax breakdown

2. **Thermal Printing**:
   - 58mm and 80mm support
   - Compact format
   - Fast printing
   - ESC/POS commands
   - Receipt templates

---

## Deployment & Distribution

### Build Targets

- **Windows**: `.exe` installer
- **macOS**: `.dmg` package
- **Linux**: `.AppImage`, `.deb`, `.rpm`

### Auto-Update

- Electron Auto-Updater integrated
- Background update checks
- Update notifications
- Safe update process

### Installation

```bash
# Install dependencies
pnpm install

# Development mode
pnpm dev

# Build for production
pnpm build:win    # Windows
pnpm build:mac    # macOS
pnpm build:linux  # Linux
```

---

## Key Metrics Tracked

1. **Sales Metrics**:
   - Daily/Monthly revenue
   - Sales count
   - Average transaction value
   - Payment method distribution

2. **Inventory Metrics**:
   - Stock levels
   - Low stock alerts
   - Expiry warnings
   - Inventory turnover

3. **Customer Metrics**:
   - Total customers
   - Loyalty points issued/redeemed
   - Customer purchase frequency
   - Top customers

4. **Financial Metrics**:
   - Profit margins
   - Outstanding payables
   - Bank account balances
   - Expense tracking

---

## Technical Highlights

### Database Migrations

The system uses a migration-based approach for database schema changes:

- `add-units-table` - Unit measurement system
- `add-bank-accounts-table` - Financial account tracking
- `add-supplier-accounting-fields` - Supplier balance tracking
- `add-supplier-payments-ledger` - Complete supplier ledger
- `add-audit-logs-table` - Audit trail system
- `add-attendance-salary-tables` - HR management
- `add-damaged-items-table` - Damaged stock tracking
- `add-product-shelf` - Shelf location tracking
- `add-product-unit-conversion` - Unit conversion system
- And more...

### IPC Handler Architecture

Modular IPC handlers for clean separation:

- `bank-account-handlers` - Bank account operations
- `category-unit-handlers` - Category and unit management
- `customer-handlers` - Customer operations
- `product-inventory-handlers` - Product and inventory
- `purchase-handlers` - Purchase management
- `sales-handlers` - Sales operations
- `supplier-handlers` - Supplier management
- `users-handlers` - User authentication and management
- `hr-handlers` - HR and payroll operations
- `reports-settings-handlers` - Reports and settings
- `database-utils-handlers` - Database utilities

---

## Future Enhancement Possibilities

- Multi-store management
- Online ordering integration
- SMS notifications
- Email receipts
- Advanced analytics and BI
- Mobile app companion
- Barcode scanner integration
- Cloud backup options
- API for third-party integrations
- Multilingual support

---

## License

This is a **Licensed Professional Software** developed by **Johuniq** (https://johuniq.xyz).

---

## Documentation

For detailed documentation on specific modules, refer to:

- `/src/main/database/schema.ts` - Complete database schema
- `/src/renderer/src/utils/permissions.ts` - RBAC implementation
- `/README.md` - Setup and installation guide

---

## Support

For support, feature requests, or licensing inquiries, contact the developer through the official website.

---

**Built with ❤️ using Electron, React, and TypeScript**
