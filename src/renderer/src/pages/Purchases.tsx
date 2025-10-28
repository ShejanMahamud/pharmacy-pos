import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import AddPurchaseModal from '../components/purchases/AddPurchaseModal'
import PurchaseDetailsModal from '../components/purchases/PurchaseDetailsModal'
import PurchaseFilters from '../components/purchases/PurchaseFilters'
import PurchaseReturnModal from '../components/purchases/PurchaseReturnModal'
import PurchaseStats from '../components/purchases/PurchaseStats'
import PurchasesTable from '../components/purchases/PurchasesTable'
import { useSettingsStore } from '../store/settingsStore'
import { BankAccount, Product, Purchase, PurchaseItem, Supplier } from '../types/purchase'

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
  const [itemsPerPage, setItemsPerPage] = useState(25)

  const currency = useSettingsStore((state) => state.currency)

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
    loadPurchases()
    loadSuppliers()
    loadProducts()
    loadAccounts()
  }, [])

  useEffect(() => {
    filterPurchases()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Event handlers
  const handleViewDetails = (purchase: Purchase): void => {
    viewPurchaseDetails(purchase)
  }

  const handlePageChange = (page: number): void => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (items: number): void => {
    setItemsPerPage(items)
    setCurrentPage(1)
  }

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
      <PurchaseStats
        totalPurchases={totalPurchases}
        totalPaid={totalPaid}
        totalDue={totalDue}
        totalTransactions={totalTransactions}
        currencySymbol={getCurrencySymbol()}
      />

      {/* Action Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <PurchaseFilters
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            paymentFilter={paymentFilter}
            onSearchChange={setSearchTerm}
            onStatusFilterChange={setStatusFilter}
            onPaymentFilterChange={setPaymentFilter}
          />

          <div className="flex gap-3">
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
      </div>

      {/* Purchases Table */}
      <PurchasesTable
        purchases={paginatedPurchases}
        currencySymbol={getCurrencySymbol()}
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        onViewDetails={handleViewDetails}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />

      {/* Purchase Details Modal */}
      <PurchaseDetailsModal
        isOpen={showDetailsModal}
        purchase={selectedPurchase}
        items={purchaseItems}
        currencySymbol={getCurrencySymbol()}
        onClose={() => setShowDetailsModal(false)}
      />

      {/* Add Purchase Modal */}
      <AddPurchaseModal
        isOpen={showAddModal}
        suppliers={suppliers}
        products={products}
        accounts={accounts}
        currencySymbol={getCurrencySymbol()}
        onClose={() => setShowAddModal(false)}
        onSuccess={loadPurchases}
      />

      {/* Purchase Return Modal */}
      <PurchaseReturnModal
        isOpen={showReturnModal}
        purchases={purchases}
        accounts={accounts}
        currencySymbol={getCurrencySymbol()}
        onClose={() => setShowReturnModal(false)}
        onSuccess={loadPurchases}
      />
    </div>
  )
}
