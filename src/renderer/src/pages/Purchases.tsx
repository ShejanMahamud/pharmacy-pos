import { Box, Container, Typography } from '@mui/material'
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
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showReturnModal, setShowReturnModal] = useState(false)
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null)
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [accounts, setAccounts] = useState<BankAccount[]>([])

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
    } catch {
      toast.error('Failed to load purchases')
    }
  }

  const loadSuppliers = async (): Promise<void> => {
    try {
      const allSuppliers = await window.api.suppliers.getAll()
      setSuppliers(allSuppliers)
    } catch {
      toast.error('Failed to load suppliers')
    }
  }

  const loadProducts = async (): Promise<void> => {
    try {
      const allProducts = await window.api.products.getAll()
      setProducts(allProducts)
    } catch {
      toast.error('Failed to load products')
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
  }

  const viewPurchaseDetails = async (purchase: Purchase): Promise<void> => {
    try {
      setSelectedPurchase(purchase)
      const purchaseWithItems = await window.api.purchases.getById(purchase.id)
      if (purchaseWithItems && purchaseWithItems.items) {
        setPurchaseItems(purchaseWithItems.items)
      }
      setShowDetailsModal(true)
    } catch {
      toast.error('Failed to load purchase details')
    }
  }

  // Calculate stats
  const totalPurchases = filteredPurchases.reduce((sum, p) => sum + p.totalAmount, 0)
  const totalPaid = filteredPurchases.reduce((sum, p) => sum + p.paidAmount, 0)
  const totalDue = filteredPurchases.reduce((sum, p) => sum + p.dueAmount, 0)
  const totalTransactions = filteredPurchases.length

  // Event handlers
  const handleViewDetails = (purchase: Purchase): void => {
    viewPurchaseDetails(purchase)
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4, bgcolor: 'grey.100', minHeight: '100vh' }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Purchase Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage purchase orders and supplier transactions
        </Typography>
      </Box>

      {/* Stats Cards */}
      <PurchaseStats
        totalPurchases={totalPurchases}
        totalPaid={totalPaid}
        totalDue={totalDue}
        totalTransactions={totalTransactions}
        currencySymbol={getCurrencySymbol()}
      />

      {/* Filters */}
      <PurchaseFilters
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        paymentFilter={paymentFilter}
        onSearchChange={setSearchTerm}
        onStatusFilterChange={setStatusFilter}
        onPaymentFilterChange={setPaymentFilter}
        onAddPurchase={() => setShowAddModal(true)}
        onPurchaseReturn={() => setShowReturnModal(true)}
      />

      {/* Purchases Table */}
      <PurchasesTable
        purchases={filteredPurchases}
        currencySymbol={getCurrencySymbol()}
        onViewDetails={handleViewDetails}
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
    </Container>
  )
}
