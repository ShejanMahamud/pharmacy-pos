import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useSettingsStore } from '../store/settingsStore'

interface Sale {
  id: string
  invoiceNumber: string
  customerName?: string
  totalAmount: number
  paidAmount: number
  changeAmount: number
  paymentMethod: string
  status: string
  createdAt: string
  userName?: string
}

interface SaleItem {
  id: string
  productName: string
  quantity: number
  unitPrice: number
  discountPercent: number
  taxRate: number
  subtotal: number
}

interface BankAccount {
  id: string
  name: string
  accountType: string
  currentBalance: number
  isActive: boolean
}

export default function Sales(): React.JSX.Element {
  const [sales, setSales] = useState<Sale[]>([])
  const [filteredSales, setFilteredSales] = useState<Sale[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showReturnModal, setShowReturnModal] = useState(false)
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [saleItems, setSaleItems] = useState<SaleItem[]>([])
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const itemsPerPage = 10

  // Return form state
  const [returnFormData, setReturnFormData] = useState({
    saleId: '',
    accountId: '',
    refundAmount: 0,
    reason: '',
    notes: ''
  })

  const [returnItems, setReturnItems] = useState<
    Array<{
      saleItemId: string
      productId: string
      productName: string
      quantity: number
      unitPrice: number
      maxQuantity: number
    }>
  >([])

  const currency = useSettingsStore((state) => state.currency)

  // Get currency symbol
  const getCurrencySymbol = (): string => {
    switch (currency) {
      case 'USD':
        return '$'
      case 'EUR':
        return '€'
      case 'GBP':
        return '£'
      case 'BDT':
        return '৳'
      case 'INR':
        return '₹'
      default:
        return '$'
    }
  }

  useEffect(() => {
    loadSales()
    loadAccounts()
  }, [])

  useEffect(() => {
    filterSales()
  }, [sales, searchTerm, statusFilter, paymentFilter])

  const loadSales = async (): Promise<void> => {
    try {
      const allSales = await window.api.sales.getAll()
      setSales(allSales)
    } catch (error) {
      toast.error('Failed to load sales')
    }
  }

  const loadAccounts = async (): Promise<void> => {
    try {
      const allAccounts = await window.api.bankAccounts.getAll()
      setAccounts(allAccounts.filter((acc) => acc.isActive))
    } catch (_error) {
      toast.error('Failed to load accounts')
    }
  }

  const filterSales = (): void => {
    let filtered = [...sales]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (sale) =>
          sale.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sale.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((sale) => sale.status === statusFilter)
    }

    // Payment method filter
    if (paymentFilter !== 'all') {
      filtered = filtered.filter((sale) => sale.paymentMethod === paymentFilter)
    }

    setFilteredSales(filtered)
    setCurrentPage(1)
  }

  const viewSaleDetails = async (sale: Sale): Promise<void> => {
    try {
      setSelectedSale(sale)
      const saleWithItems = await window.api.sales.getById(sale.id)
      if (saleWithItems && saleWithItems.items) {
        setSaleItems(saleWithItems.items)
      }
      setShowDetailsModal(true)
    } catch (_error) {
      toast.error('Failed to load sale details')
    }
  }

  const handlePrint = async (sale: Sale): Promise<void> => {
    try {
      // Get full sale details with items
      const saleWithItems = await window.api.sales.getById(sale.id)
      if (!saleWithItems || !saleWithItems.items) {
        toast.error('Failed to load invoice details')
        return
      }

      // Create a printable invoice HTML
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        toast.error('Please allow pop-ups to print invoices')
        return
      }

      const invoiceHTML = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Invoice ${sale.invoiceNumber}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                color: #333;
              }
              .invoice-container {
                max-width: 800px;
                margin: 0 auto;
                border: 1px solid #ddd;
                padding: 30px;
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 2px solid #333;
                padding-bottom: 20px;
              }
              .header h1 {
                margin: 0;
                color: #1e40af;
              }
              .info-section {
                display: flex;
                justify-content: space-between;
                margin-bottom: 30px;
              }
              .info-block {
                flex: 1;
              }
              .info-block h3 {
                margin: 0 0 10px 0;
                font-size: 14px;
                color: #666;
                text-transform: uppercase;
              }
              .info-block p {
                margin: 5px 0;
                font-size: 14px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 30px;
              }
              th {
                background-color: #f3f4f6;
                padding: 12px;
                text-align: left;
                font-size: 12px;
                text-transform: uppercase;
                border-bottom: 2px solid #ddd;
              }
              td {
                padding: 12px;
                border-bottom: 1px solid #eee;
                font-size: 14px;
              }
              .text-right {
                text-align: right;
              }
              .totals {
                float: right;
                width: 300px;
                margin-top: 20px;
              }
              .totals-row {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                font-size: 14px;
              }
              .totals-row.total {
                border-top: 2px solid #333;
                font-weight: bold;
                font-size: 16px;
                margin-top: 10px;
                padding-top: 10px;
              }
              .footer {
                clear: both;
                margin-top: 50px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
                text-align: center;
                font-size: 12px;
                color: #666;
              }
              @media print {
                body {
                  padding: 0;
                }
                .invoice-container {
                  border: none;
                  padding: 0;
                }
              }
            </style>
          </head>
          <body>
            <div class="invoice-container">
              <div class="header">
                <h1>PHARMACY POS</h1>
                <p style="margin: 5px 0;">Sales Invoice</p>
              </div>

              <div class="info-section">
                <div class="info-block">
                  <h3>Invoice Details</h3>
                  <p><strong>Invoice #:</strong> ${sale.invoiceNumber}</p>
                  <p><strong>Date:</strong> ${new Date(sale.createdAt).toLocaleString()}</p>
                  <p><strong>Status:</strong> ${sale.status.toUpperCase()}</p>
                </div>
                <div class="info-block">
                  <h3>Customer Information</h3>
                  <p><strong>Name:</strong> ${sale.customerName || 'Walk-in Customer'}</p>
                  <p><strong>Payment:</strong> ${sale.paymentMethod.toUpperCase()}</p>
                </div>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th class="text-right">Qty</th>
                    <th class="text-right">Price</th>
                    <th class="text-right">Discount</th>
                    <th class="text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${saleWithItems.items
                    .map(
                      (item: SaleItem) => `
                    <tr>
                      <td>${item.productName}</td>
                      <td class="text-right">${item.quantity}</td>
                      <td class="text-right">$${item.unitPrice.toFixed(2)}</td>
                      <td class="text-right">${item.discountPercent}%</td>
                      <td class="text-right">$${item.subtotal.toFixed(2)}</td>
                    </tr>
                  `
                    )
                    .join('')}
                </tbody>
              </table>

              <div class="totals">
                <div class="totals-row">
                  <span>Paid Amount:</span>
                  <span>$${sale.paidAmount.toFixed(2)}</span>
                </div>
                <div class="totals-row">
                  <span>Change:</span>
                  <span>$${sale.changeAmount.toFixed(2)}</span>
                </div>
                <div class="totals-row total">
                  <span>Total Amount:</span>
                  <span>$${sale.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div class="footer">
                <p>Thank you for your business!</p>
                <p>This is a computer generated invoice.</p>
              </div>
            </div>
          </body>
        </html>
      `

      printWindow.document.write(invoiceHTML)
      printWindow.document.close()

      // Wait for content to load then print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print()
          // Don't close automatically, let user close after printing
        }, 250)
      }

      toast.success(`Invoice ${sale.invoiceNumber} ready to print`)
    } catch (_error) {
      toast.error('Failed to print invoice')
    }
  }

  const totalPages = Math.ceil(filteredSales.length / itemsPerPage)
  const paginatedSales = filteredSales.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Calculate stats
  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0)
  const totalTransactions = filteredSales.length
  const completedSales = filteredSales.filter((s) => s.status === 'completed').length
  const avgSaleValue = totalTransactions > 0 ? totalSales / totalTransactions : 0

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Sales History</h1>
        <p className="text-sm text-gray-600 mt-1">View and manage all sales transactions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sales</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {getCurrencySymbol()}
                {totalSales.toFixed(2)}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Transactions</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalTransactions}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg
                className="h-6 w-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{completedSales}</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg
                className="h-6 w-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Sale Value</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {getCurrencySymbol()}
                {avgSaleValue.toFixed(2)}
              </p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg
                className="h-6 w-6 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search by invoice or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Payment Method Filter */}
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Payments</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="mobile">Mobile</option>
              <option value="credit">Credit</option>
            </select>

            {/* Sales Return Button */}
            <button
              onClick={() => setShowReturnModal(true)}
              className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                />
              </svg>
              Sales Return
            </button>
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedSales.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No sales found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      No sales transactions match your filters
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg
                            className="h-5 w-5 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {sale.invoiceNumber}
                          </div>
                          <div className="text-xs text-gray-500">
                            {sale.userName || 'Unknown User'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {sale.customerName || 'Walk-in Customer'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(sale.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(sale.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize bg-gray-100 text-gray-800">
                        {sale.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {getCurrencySymbol()}
                        {sale.totalAmount.toFixed(2)}
                      </div>
                      {sale.changeAmount > 0 && (
                        <div className="text-xs text-gray-500">
                          Change: {getCurrencySymbol()}
                          {sale.changeAmount.toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                          sale.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : sale.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {sale.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => viewSaleDetails(sale)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        title="View Details"
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handlePrint(sale)}
                        className="text-gray-600 hover:text-gray-900"
                        title="Print Invoice"
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredSales.length)} of {filteredSales.length}{' '}
              sales
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 border rounded-md text-sm font-medium ${
                    currentPage === i + 1
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sale Details Modal */}
      {showDetailsModal && selectedSale && (
        <div className="fixed inset-0 bg-black/50  z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-lg z-10">
              <h2 className="text-xl font-bold text-gray-900">Sale Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Sale Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Invoice Number</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedSale.invoiceNumber}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date & Time</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(selectedSale.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Customer</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedSale.customerName || 'Walk-in Customer'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <p className="text-lg font-semibold text-gray-900 capitalize">
                    {selectedSale.paymentMethod}
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Items</h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Product
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Qty
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Price
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Discount
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                          Subtotal
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {saleItems.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.productName}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.quantity}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {getCurrencySymbol()}
                            {item.unitPrice.toFixed(2)}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {item.discountPercent}%
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900 text-right">
                            {getCurrencySymbol()}
                            {item.subtotal.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Paid Amount:</span>
                  <span className="font-semibold text-gray-900">
                    {getCurrencySymbol()}
                    {selectedSale.paidAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Change:</span>
                  <span className="font-semibold text-gray-900">
                    {getCurrencySymbol()}
                    {selectedSale.changeAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2 mt-2">
                  <span className="text-gray-900">Total Amount:</span>
                  <span className="text-blue-600">
                    {getCurrencySymbol()}
                    {selectedSale.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 rounded-b-lg border-t border-gray-200">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Close
              </button>
              <button
                onClick={() => handlePrint(selectedSale)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
                Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sales Return Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 bg-black/50  z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Create Sales Return</h2>
                <button
                  onClick={() => {
                    setShowReturnModal(false)
                    setReturnFormData({
                      saleId: '',
                      accountId: '',
                      refundAmount: 0,
                      reason: '',
                      notes: ''
                    })
                    setReturnItems([])
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  try {
                    if (!returnFormData.saleId || returnItems.length === 0) {
                      toast.error('Please fill all required fields')
                      return
                    }

                    const sale = await window.api.sales.getById(returnFormData.saleId)
                    if (!sale) {
                      toast.error('Sale not found')
                      return
                    }

                    const totalAmount = returnItems.reduce(
                      (sum, item) => sum + item.quantity * item.unitPrice,
                      0
                    )

                    await window.api.salesReturns.create(
                      {
                        returnNumber: `SR-${Date.now()}`,
                        saleId: returnFormData.saleId,
                        customerId: sale.customerId || null,
                        accountId: returnFormData.accountId || null,
                        userId: 'current-user',
                        subtotal: totalAmount,
                        taxAmount: 0,
                        discountAmount: 0,
                        totalAmount,
                        refundAmount: returnFormData.refundAmount,
                        refundStatus:
                          returnFormData.refundAmount >= totalAmount
                            ? 'refunded'
                            : returnFormData.refundAmount > 0
                              ? 'partial'
                              : 'pending',
                        reason: returnFormData.reason,
                        notes: returnFormData.notes
                      },
                      returnItems
                    )

                    toast.success('Sales return created successfully')
                    setShowReturnModal(false)
                    setReturnFormData({
                      saleId: '',
                      accountId: '',
                      refundAmount: 0,
                      reason: '',
                      notes: ''
                    })
                    setReturnItems([])
                    await loadSales()
                  } catch (error) {
                    toast.error('Failed to create sales return')
                    console.error(error)
                  }
                }}
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Sale *
                      </label>
                      <select
                        required
                        value={returnFormData.saleId}
                        onChange={async (e) => {
                          const saleId = e.target.value
                          setReturnFormData({ ...returnFormData, saleId })

                          if (saleId) {
                            const sale = await window.api.sales.getById(saleId)
                            if (sale && sale.items) {
                              setReturnItems(
                                sale.items.map((item: any) => ({
                                  saleItemId: item.id,
                                  productId: item.productId,
                                  productName: item.productName,
                                  quantity: 0,
                                  unitPrice: item.unitPrice,
                                  maxQuantity: item.quantity
                                }))
                              )
                            }
                          } else {
                            setReturnItems([])
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select a sale</option>
                        {sales.map((sale) => (
                          <option key={sale.id} value={sale.id}>
                            {sale.invoiceNumber} - {sale.customerName || 'Walk-in'} (
                            {getCurrencySymbol()}
                            {sale.totalAmount.toFixed(2)})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Refund Account <span className="text-gray-500 text-xs">(Optional)</span>
                      </label>
                      <select
                        value={returnFormData.accountId}
                        onChange={(e) =>
                          setReturnFormData({ ...returnFormData, accountId: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">No Account</option>
                        {accounts.map((account) => (
                          <option key={account.id} value={account.id}>
                            {account.name} - {getCurrencySymbol()}
                            {account.currentBalance.toFixed(2)}
                          </option>
                        ))}
                      </select>
                      {returnFormData.accountId && (
                        <p className="text-xs text-gray-500 mt-1">
                          Money will be deducted from this account
                        </p>
                      )}
                    </div>
                  </div>

                  {returnItems.length > 0 && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Return Items</h3>
                      <div className="space-y-3">
                        {returnItems.map((item, index) => (
                          <div key={item.saleItemId} className="flex items-center gap-3">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {item.productName}
                              </p>
                              <p className="text-xs text-gray-500">
                                Max: {item.maxQuantity} | Price: {getCurrencySymbol()}
                                {item.unitPrice.toFixed(2)}
                              </p>
                            </div>
                            <input
                              type="number"
                              min="0"
                              max={item.maxQuantity}
                              value={item.quantity}
                              onChange={(e) => {
                                const qty = Math.min(
                                  parseInt(e.target.value) || 0,
                                  item.maxQuantity
                                )
                                const updated = [...returnItems]
                                updated[index].quantity = qty
                                setReturnItems(updated)
                              }}
                              className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                              placeholder="Qty"
                            />
                            <span className="text-sm font-medium text-gray-900 w-24 text-right">
                              {getCurrencySymbol()}
                              {(item.quantity * item.unitPrice).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex justify-between text-sm font-semibold">
                          <span>Total Return Amount:</span>
                          <span>
                            {getCurrencySymbol()}
                            {returnItems
                              .reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
                              .toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Refund Amount
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={returnFormData.refundAmount}
                        onChange={(e) =>
                          setReturnFormData({
                            ...returnFormData,
                            refundAmount: parseFloat(e.target.value) || 0
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Return Reason *
                      </label>
                      <input
                        type="text"
                        required
                        value={returnFormData.reason}
                        onChange={(e) =>
                          setReturnFormData({ ...returnFormData, reason: e.target.value })
                        }
                        placeholder="Damaged, Wrong item, etc."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                    <textarea
                      value={returnFormData.notes}
                      onChange={(e) =>
                        setReturnFormData({ ...returnFormData, notes: e.target.value })
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Additional notes..."
                    />
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowReturnModal(false)
                      setReturnFormData({
                        saleId: '',
                        accountId: '',
                        refundAmount: 0,
                        reason: '',
                        notes: ''
                      })
                      setReturnItems([])
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={returnItems.filter((i) => i.quantity > 0).length === 0}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create Return
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
