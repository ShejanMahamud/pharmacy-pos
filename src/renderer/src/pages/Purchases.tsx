import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useSettingsStore } from '../store/settingsStore'

interface Purchase {
  id: string
  invoiceNumber: string
  supplierName?: string
  totalAmount: number
  paidAmount: number
  dueAmount: number
  paymentStatus: string
  status: string
  createdAt: string
}

interface PurchaseItem {
  id: string
  productName: string
  quantity: number
  unitPrice: number
  discountPercent: number
  taxRate: number
  subtotal: number
  batchNumber?: string
  expiryDate?: string
}

interface Supplier {
  id: string
  name: string
  company?: string
  phone: string
  email?: string
}

interface Product {
  id: string
  name: string
  sku: string
  costPrice: number
  unit: string
  packageUnit?: string
  unitsPerPackage?: number
}

interface BankAccount {
  id: string
  name: string
  accountType: string
  currentBalance: number
  isActive: boolean
}

export default function Purchases(): React.JSX.Element {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [filteredPurchases, setFilteredPurchases] = useState<Purchase[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showReturnModal, setShowReturnModal] = useState(false)
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null)
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const itemsPerPage = 10

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

  // Form state
  const [formData, setFormData] = useState({
    supplierId: '',
    invoiceNumber: '',
    accountId: '',
    paymentStatus: 'pending',
    paidAmount: 0,
    notes: ''
  })

  const [items, setItems] = useState([
    { productId: '', quantity: 1, unitPrice: 0, batchNumber: '', expiryDate: '' }
  ])

  // Return form state
  const [returnFormData, setReturnFormData] = useState({
    purchaseId: '',
    accountId: '',
    refundAmount: 0,
    reason: '',
    notes: ''
  })

  const [returnItems, setReturnItems] = useState<
    Array<{
      purchaseItemId: string
      productId: string
      productName: string
      quantity: number
      unitPrice: number
      maxQuantity: number
    }>
  >([])

  useEffect(() => {
    loadPurchases()
    loadSuppliers()
    loadProducts()
    loadAccounts()
  }, [])

  useEffect(() => {
    filterPurchases()
  }, [purchases, searchTerm, statusFilter, paymentFilter])

  const loadPurchases = async (): Promise<void> => {
    try {
      const allPurchases = await window.api.purchases.getAll()
      setPurchases(allPurchases)
    } catch (_error) {
      toast.error('Failed to load purchases')
    }
  }

  const loadSuppliers = async (): Promise<void> => {
    try {
      const allSuppliers = await window.api.suppliers.getAll()
      setSuppliers(allSuppliers)
    } catch (_error) {
      toast.error('Failed to load suppliers')
    }
  }

  const loadProducts = async (): Promise<void> => {
    try {
      const allProducts = await window.api.products.getAll()
      setProducts(allProducts)
    } catch (_error) {
      toast.error('Failed to load products')
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

  const filterPurchases = (): void => {
    let filtered = [...purchases]

    if (searchTerm) {
      filtered = filtered.filter(
        (purchase) =>
          purchase.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          purchase.supplierName?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((purchase) => purchase.status === statusFilter)
    }

    if (paymentFilter !== 'all') {
      filtered = filtered.filter((purchase) => purchase.paymentStatus === paymentFilter)
    }

    setFilteredPurchases(filtered)
    setCurrentPage(1)
  }

  const viewPurchaseDetails = async (purchase: Purchase): Promise<void> => {
    try {
      setSelectedPurchase(purchase)
      const purchaseWithItems = await window.api.purchases.getById(purchase.id)
      if (purchaseWithItems && purchaseWithItems.items) {
        setPurchaseItems(purchaseWithItems.items)
      }
      setShowDetailsModal(true)
    } catch (_error) {
      toast.error('Failed to load purchase details')
    }
  }

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()

    if (!formData.supplierId) {
      toast.error('Please select a supplier')
      return
    }

    if (items.length === 0 || !items[0].productId) {
      toast.error('Please add at least one product')
      return
    }

    try {
      const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

      const purchase = {
        supplierId: formData.supplierId,
        invoiceNumber: formData.invoiceNumber || `PO-${Date.now()}`,
        accountId: formData.accountId || null,
        totalAmount,
        paidAmount: formData.paidAmount,
        dueAmount: totalAmount - formData.paidAmount,
        paymentStatus: formData.paymentStatus,
        status: 'received',
        notes: formData.notes
      }

      await window.api.purchases.create(purchase, items)
      toast.success('Purchase order created successfully')
      handleCloseModal()
      await loadPurchases()
    } catch (_error) {
      toast.error('Failed to create purchase order')
    }
  }

  const handleCloseModal = (): void => {
    setShowAddModal(false)
    setFormData({
      supplierId: '',
      invoiceNumber: '',
      accountId: '',
      paymentStatus: 'pending',
      paidAmount: 0,
      notes: ''
    })
    setItems([{ productId: '', quantity: 1, unitPrice: 0, batchNumber: '', expiryDate: '' }])
  }

  const addItem = (): void => {
    setItems([
      ...items,
      { productId: '', quantity: 1, unitPrice: 0, batchNumber: '', expiryDate: '' }
    ])
  }

  const removeItem = (index: number): void => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const updateItem = (index: number, field: string, value: string | number): void => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }

    // Auto-fill unit price when product is selected
    if (field === 'productId') {
      const product = products.find((p) => p.id === value)
      if (product) {
        // If product has package unit, calculate package price
        // Otherwise use the base cost price
        const hasPackageUnit =
          product.packageUnit && product.unitsPerPackage && product.unitsPerPackage > 1
        if (hasPackageUnit) {
          // Price per package = cost per base unit * units per package
          newItems[index].unitPrice = product.costPrice * (product.unitsPerPackage || 1)
        } else {
          // No package unit, use base cost price
          newItems[index].unitPrice = product.costPrice
        }
      }
    }

    setItems(newItems)
  }

  const totalPages = Math.ceil(filteredPurchases.length / itemsPerPage)
  const paginatedPurchases = filteredPurchases.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Calculate stats
  const totalPurchases = filteredPurchases.reduce((sum, p) => sum + p.totalAmount, 0)
  const totalPaid = filteredPurchases.reduce((sum, p) => sum + p.paidAmount, 0)
  const totalDue = filteredPurchases.reduce((sum, p) => sum + p.dueAmount, 0)
  const totalTransactions = filteredPurchases.length

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Purchase Management</h1>
        <p className="text-sm text-gray-600 mt-1">
          Manage purchase orders and supplier transactions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Purchases</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {getCurrencySymbol()}
                {totalPurchases.toFixed(2)}
              </p>
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
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Paid</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {getCurrencySymbol()}
                {totalPaid.toFixed(2)}
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Due</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {getCurrencySymbol()}
                {totalDue.toFixed(2)}
              </p>
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
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
                placeholder="Search by invoice or supplier..."
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
              <option value="received">Received</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Payment Filter */}
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Payments</option>
              <option value="paid">Paid</option>
              <option value="partial">Partial</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Purchase
          </button>
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
            Purchase Return
          </button>
        </div>
      </div>

      {/* Purchases Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paid
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due
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
              {paginatedPurchases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
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
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No purchases found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Get started by creating a new purchase order
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedPurchases.map((purchase) => (
                  <tr key={purchase.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <svg
                            className="h-5 w-5 text-purple-600"
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
                            {purchase.invoiceNumber}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{purchase.supplierName || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(purchase.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {getCurrencySymbol()}
                        {purchase.totalAmount.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-green-600 font-medium">
                        {getCurrencySymbol()}
                        {purchase.paidAmount.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-red-600 font-medium">
                        {getCurrencySymbol()}
                        {purchase.dueAmount.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                          purchase.paymentStatus === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : purchase.paymentStatus === 'partial'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {purchase.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => viewPurchaseDetails(purchase)}
                        className="text-blue-600 hover:text-blue-900"
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
              {Math.min(currentPage * itemsPerPage, filteredPurchases.length)} of{' '}
              {filteredPurchases.length} purchases
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

      {/* Add/Edit Purchase Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50  z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-lg z-10">
              <h2 className="text-xl font-bold text-gray-900">New Purchase Order</h2>
              <button
                onClick={handleCloseModal}
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
            <form onSubmit={handleSubmit} className="p-6">
              {/* Info Banner */}
              <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg
                    className="h-5 w-5 text-blue-600 mt-0.5 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <h4 className="text-sm font-semibold text-blue-900 mb-1">
                      Purchase in Package Units
                    </h4>
                    <p className="text-xs text-blue-800 mb-2">
                      When purchasing from suppliers, enter quantities in{' '}
                      <strong>package units</strong> (Box, Bottle, etc.) if configured. The system
                      will automatically convert to base units (tablets, strips, ml) for inventory
                      tracking and customer sales.
                    </p>
                    <p className="text-xs text-blue-800">
                      💡 <strong>Prices auto-fill</strong> from product settings but can be edited
                      if supplier offers different rates (bulk discounts, price changes, etc.).
                      Modified prices will be highlighted in{' '}
                      <span className="text-orange-600 font-semibold">orange</span>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Purchase Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Purchase Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Supplier <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.supplierId}
                      onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select Supplier</option>
                      {suppliers.map((supplier) => (
                        <option key={supplier.id} value={supplier.id}>
                          {supplier.name} {supplier.company ? `- ${supplier.company}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Invoice Number
                    </label>
                    <input
                      type="text"
                      value={formData.invoiceNumber}
                      onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                      placeholder="Auto-generated if empty"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account <span className="text-gray-500 text-xs">(Optional)</span>
                    </label>
                    <select
                      value={formData.accountId}
                      onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Account (No Account)</option>
                      {accounts.map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.name} - Balance: ${account.currentBalance.toFixed(2)}
                        </option>
                      ))}
                    </select>
                    {formData.accountId && (
                      <p className="text-xs text-gray-500 mt-1">
                        Money will be deducted from this account when paid amount &gt; 0
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Status
                    </label>
                    <select
                      value={formData.paymentStatus}
                      onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="partial">Partial</option>
                      <option value="paid">Paid</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Paid Amount
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.paidAmount}
                      onChange={(e) =>
                        setFormData({ ...formData, paidAmount: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Items</h3>
                  <button
                    type="button"
                    onClick={addItem}
                    className="inline-flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Add Item
                  </button>
                </div>

                <div className="space-y-3">
                  {items.map((item, index) => {
                    const selectedProduct = products.find((p) => p.id === item.productId)
                    const hasPackageUnit =
                      selectedProduct?.packageUnit &&
                      selectedProduct?.unitsPerPackage &&
                      selectedProduct.unitsPerPackage > 1

                    // Calculate expected price
                    const expectedPrice = selectedProduct
                      ? hasPackageUnit
                        ? selectedProduct.costPrice * (selectedProduct.unitsPerPackage || 1)
                        : selectedProduct.costPrice
                      : 0

                    // Check if price is different from expected
                    const isPriceModified =
                      item.productId &&
                      item.unitPrice > 0 &&
                      Math.abs(item.unitPrice - expectedPrice) > 0.01

                    return (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg space-y-2">
                        <div className="flex gap-3 items-start">
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-3">
                            <div className="md:col-span-2">
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Product
                              </label>
                              <select
                                value={item.productId}
                                onChange={(e) => updateItem(index, 'productId', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                required
                              >
                                <option value="">Select Product</option>
                                {products.map((product) => (
                                  <option key={product.id} value={product.id}>
                                    {product.name} ({product.sku})
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Quantity {hasPackageUnit && `(${selectedProduct.packageUnit}s)`}
                              </label>
                              <input
                                type="number"
                                placeholder={
                                  hasPackageUnit ? `${selectedProduct.packageUnit}s` : 'Quantity'
                                }
                                value={item.quantity}
                                onChange={(e) =>
                                  updateItem(index, 'quantity', parseInt(e.target.value) || 1)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                min="1"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Price{' '}
                                {hasPackageUnit ? `per ${selectedProduct.packageUnit}` : 'per unit'}
                              </label>
                              <div className="relative">
                                <input
                                  type="number"
                                  step="0.01"
                                  placeholder="Price"
                                  value={item.unitPrice}
                                  onChange={(e) =>
                                    updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)
                                  }
                                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 text-sm ${
                                    isPriceModified
                                      ? 'border-orange-400 bg-orange-50 focus:ring-orange-500 focus:border-orange-500'
                                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                  }`}
                                  required
                                />
                                {isPriceModified && (
                                  <button
                                    type="button"
                                    onClick={() => updateItem(index, 'unitPrice', expectedPrice)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-orange-600 hover:text-orange-800"
                                    title="Reset to standard price"
                                  >
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                      />
                                    </svg>
                                  </button>
                                )}
                              </div>
                              {isPriceModified && (
                                <p className="text-xs text-orange-600 mt-1">
                                  Standard: {getCurrencySymbol()}
                                  {expectedPrice.toFixed(2)}
                                </p>
                              )}
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Batch Number
                              </label>
                              <input
                                type="text"
                                placeholder="Batch #"
                                value={item.batchNumber}
                                onChange={(e) => updateItem(index, 'batchNumber', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              />
                            </div>
                          </div>
                          {items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              className="mt-5 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Remove item"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          )}
                        </div>

                        {/* Show conversion info */}
                        {hasPackageUnit && item.quantity > 0 && (
                          <div className="flex items-center gap-2 text-xs text-blue-700 bg-blue-50 px-3 py-2 rounded border border-blue-200">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span className="font-medium">
                              {item.quantity} {selectedProduct.packageUnit}
                              {item.quantity > 1 ? 's' : ''} ={' '}
                              {item.quantity * (selectedProduct.unitsPerPackage || 1)}{' '}
                              {selectedProduct.unit}
                              {item.quantity * (selectedProduct.unitsPerPackage || 1) > 1
                                ? 's'
                                : ''}
                            </span>
                            {item.unitPrice > 0 && (
                              <span className="ml-2">
                                | Cost per {selectedProduct.unit}: {getCurrencySymbol()}
                                {(item.unitPrice / (selectedProduct.unitsPerPackage || 1)).toFixed(
                                  2
                                )}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Summary Section */}
                <div className="mt-6 space-y-4">
                  {/* Items Summary */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-blue-600"
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
                        Purchase Summary
                      </h4>
                      <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
                        {items.filter((item) => item.productId).length}{' '}
                        {items.filter((item) => item.productId).length === 1 ? 'Item' : 'Items'}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {/* Subtotal */}
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-semibold text-gray-900">
                          {getCurrencySymbol()}
                          {items
                            .reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
                            .toFixed(2)}
                        </span>
                      </div>

                      {/* Total line with emphasis */}
                      <div className="pt-2 border-t-2 border-blue-300 flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900">Total Amount:</span>
                        <span className="text-2xl font-bold text-blue-600">
                          {getCurrencySymbol()}
                          {items
                            .reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
                            .toFixed(2)}
                        </span>
                      </div>

                      {/* Payment breakdown */}
                      {formData.paidAmount > 0 && (
                        <div className="pt-3 mt-3 border-t border-blue-200 space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-green-700 font-medium">Paid Amount:</span>
                            <span className="font-semibold text-green-700">
                              {getCurrencySymbol()}
                              {formData.paidAmount.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-red-700 font-medium">Due Amount:</span>
                            <span className="font-semibold text-red-700">
                              {getCurrencySymbol()}
                              {(
                                items.reduce(
                                  (sum, item) => sum + item.quantity * item.unitPrice,
                                  0
                                ) - formData.paidAmount
                              ).toFixed(2)}
                            </span>
                          </div>

                          {/* Payment status indicator */}
                          <div className="flex items-center gap-2 pt-2">
                            <div className={`flex-1 h-2 rounded-full overflow-hidden bg-gray-200`}>
                              <div
                                className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-300"
                                style={{
                                  width: `${Math.min(100, (formData.paidAmount / items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)) * 100)}%`
                                }}
                              />
                            </div>
                            <span className="text-xs font-medium text-gray-600">
                              {items.reduce(
                                (sum, item) => sum + item.quantity * item.unitPrice,
                                0
                              ) > 0
                                ? Math.min(
                                    100,
                                    Math.round(
                                      (formData.paidAmount /
                                        items.reduce(
                                          (sum, item) => sum + item.quantity * item.unitPrice,
                                          0
                                        )) *
                                        100
                                    )
                                  )
                                : 0}
                              % Paid
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Total items count */}
                      {items.some((item) => item.productId && item.quantity > 0) && (
                        <div className="pt-3 mt-3 border-t border-blue-200">
                          <div className="text-xs text-gray-600">
                            <strong>Total Quantity:</strong>{' '}
                            {items.reduce((sum, item) => sum + (item.quantity || 0), 0)} units
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add any additional notes..."
                />
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 justify-end border-t border-gray-200 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Create Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Purchase Details Modal */}
      {showDetailsModal && selectedPurchase && (
        <div className="fixed inset-0 bg-black/50  z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-lg z-10">
              <h2 className="text-xl font-bold text-gray-900">Purchase Details</h2>
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
              {/* Purchase Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Invoice Number</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedPurchase.invoiceNumber}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(selectedPurchase.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Supplier</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedPurchase.supplierName || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Status</p>
                  <p className="text-lg font-semibold text-gray-900 capitalize">
                    {selectedPurchase.paymentStatus}
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
                          Batch
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Qty
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Price
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                          Subtotal
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {purchaseItems.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.productName}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {item.batchNumber || 'N/A'}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.quantity}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {getCurrencySymbol()}
                            {item.unitPrice.toFixed(2)}
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
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-semibold text-gray-900">
                    {getCurrencySymbol()}
                    {selectedPurchase.totalAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Paid:</span>
                  <span className="font-semibold text-green-600">
                    {getCurrencySymbol()}
                    {selectedPurchase.paidAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2 mt-2">
                  <span className="text-gray-900">Due Amount:</span>
                  <span className="text-red-600">
                    {getCurrencySymbol()}
                    {selectedPurchase.dueAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end rounded-b-lg border-t border-gray-200">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Purchase Return Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 bg-black/50  z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Create Purchase Return</h2>
                <button
                  onClick={() => {
                    setShowReturnModal(false)
                    setReturnFormData({
                      purchaseId: '',
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
                    if (!returnFormData.purchaseId || returnItems.length === 0) {
                      toast.error('Please fill all required fields')
                      return
                    }

                    const purchase = await window.api.purchases.getById(returnFormData.purchaseId)
                    if (!purchase) {
                      toast.error('Purchase not found')
                      return
                    }

                    const totalAmount = returnItems.reduce(
                      (sum, item) => sum + item.quantity * item.unitPrice,
                      0
                    )

                    await window.api.purchaseReturns.create(
                      {
                        returnNumber: `PR-${Date.now()}`,
                        purchaseId: returnFormData.purchaseId,
                        supplierId: purchase.supplierId,
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

                    toast.success('Purchase return created successfully')
                    setShowReturnModal(false)
                    setReturnFormData({
                      purchaseId: '',
                      accountId: '',
                      refundAmount: 0,
                      reason: '',
                      notes: ''
                    })
                    setReturnItems([])
                    await loadPurchases()
                  } catch (error) {
                    toast.error('Failed to create purchase return')
                    console.error(error)
                  }
                }}
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Purchase *
                      </label>
                      <select
                        required
                        value={returnFormData.purchaseId}
                        onChange={async (e) => {
                          const purchaseId = e.target.value
                          setReturnFormData({ ...returnFormData, purchaseId })

                          if (purchaseId) {
                            const purchase = await window.api.purchases.getById(purchaseId)
                            if (purchase && purchase.items) {
                              setReturnItems(
                                purchase.items.map((item: any) => ({
                                  purchaseItemId: item.id,
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
                        <option value="">Select a purchase</option>
                        {purchases.map((purchase) => (
                          <option key={purchase.id} value={purchase.id}>
                            {purchase.invoiceNumber} - {purchase.supplierName} (
                            {getCurrencySymbol()}
                            {purchase.totalAmount.toFixed(2)})
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
                          Money will be added back to this account
                        </p>
                      )}
                    </div>
                  </div>

                  {returnItems.length > 0 && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Return Items</h3>
                      <div className="space-y-3">
                        {returnItems.map((item, index) => (
                          <div key={item.purchaseItemId} className="flex items-center gap-3">
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
                        placeholder="Damaged, Expired, etc."
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
                        purchaseId: '',
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
