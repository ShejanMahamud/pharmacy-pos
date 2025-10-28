import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import SaleDetailsModal from '../components/sales/SaleDetailsModal'
import SaleReturnModal from '../components/sales/SaleReturnModal'
import SalesFilters from '../components/sales/SalesFilters'
import SalesStats from '../components/sales/SalesStats'
import SalesTable from '../components/sales/SalesTable'
import { useSettingsStore } from '../store/settingsStore'
import { BankAccount, ReturnFormData, ReturnItem, Sale, SaleItem } from '../types/sale'

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
  const [itemsPerPage, setItemsPerPage] = useState(25)

  // Return form state
  const [returnFormData, setReturnFormData] = useState<ReturnFormData>({
    saleId: '',
    accountId: '',
    refundAmount: 0,
    reason: '',
    notes: ''
  })

  const [returnItems, setReturnItems] = useState<ReturnItem[]>([])

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sales, searchTerm, statusFilter, paymentFilter])

  const loadSales = async (): Promise<void> => {
    try {
      const allSales = await window.api.sales.getAll()
      setSales(allSales)
    } catch {
      toast.error('Failed to load sales')
    }
  }

  const loadAccounts = async (): Promise<void> => {
    try {
      const allAccounts = await window.api.bankAccounts.getAll()
      setAccounts(allAccounts.filter((acc) => acc.isActive))
    } catch {
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
    } catch {
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
    } catch {
      toast.error('Failed to print invoice')
    }
  }

  const handleSaleSelect = async (saleId: string): Promise<void> => {
    setReturnFormData({ ...returnFormData, saleId })

    if (saleId) {
      const sale = await window.api.sales.getById(saleId)
      if (sale && sale.items) {
        setReturnItems(
          sale.items.map((item: SaleItem & { productId: string }) => ({
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
  }

  const handleReturnSubmit = async (e: React.FormEvent): Promise<void> => {
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

      const totalAmount = returnItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

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
    } catch {
      toast.error('Failed to create sales return')
    }
  }

  const handleReturnModalClose = (): void => {
    setShowReturnModal(false)
    setReturnFormData({
      saleId: '',
      accountId: '',
      refundAmount: 0,
      reason: '',
      notes: ''
    })
    setReturnItems([])
  }

  const totalPages = Math.ceil(filteredSales.length / itemsPerPage)
  const paginatedSales = filteredSales.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Sales History</h1>
        <p className="text-sm text-gray-600 mt-1">View and manage all sales transactions</p>
      </div>

      {/* Stats Cards */}
      <SalesStats sales={filteredSales} currencySymbol={getCurrencySymbol()} />

      {/* Filters */}
      <SalesFilters
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        paymentFilter={paymentFilter}
        onSearchChange={setSearchTerm}
        onStatusFilterChange={setStatusFilter}
        onPaymentFilterChange={setPaymentFilter}
        onReturnClick={() => setShowReturnModal(true)}
      />

      {/* Sales Table */}
      <SalesTable
        sales={paginatedSales}
        currencySymbol={getCurrencySymbol()}
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        onViewDetails={viewSaleDetails}
        onPrint={handlePrint}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />

      {/* Sale Details Modal */}
      <SaleDetailsModal
        isOpen={showDetailsModal}
        sale={selectedSale}
        saleItems={saleItems}
        currencySymbol={getCurrencySymbol()}
        onClose={() => setShowDetailsModal(false)}
        onPrint={handlePrint}
      />

      {/* Sales Return Modal */}
      <SaleReturnModal
        isOpen={showReturnModal}
        sales={sales}
        accounts={accounts}
        returnFormData={returnFormData}
        returnItems={returnItems}
        currencySymbol={getCurrencySymbol()}
        onClose={handleReturnModalClose}
        onSubmit={handleReturnSubmit}
        onReturnFormDataChange={setReturnFormData}
        onReturnItemsChange={setReturnItems}
        onSaleSelect={handleSaleSelect}
      />
    </div>
  )
}
