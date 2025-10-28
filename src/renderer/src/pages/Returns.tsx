import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Pagination from '../components/Pagination'
import { useAuthStore } from '../store/authStore'

interface Product {
  id: string
  name: string
  barcode?: string
  sku: string
  sellingPrice: number
  costPrice: number
}

interface SalesReturn {
  id: string
  returnNumber: string
  saleId: string
  customerId: string | null
  customerName: string | null
  accountId: string | null
  accountName: string | null
  userId: string
  userName: string
  subtotal: number
  taxAmount: number
  discountAmount: number
  totalAmount: number
  refundAmount: number
  refundStatus: 'pending' | 'partial' | 'refunded'
  reason: string | null
  notes: string | null
  createdAt: string
  items: SalesReturnItem[]
}

interface SalesReturnItem {
  id: string
  returnId: string
  saleItemId: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  discountPercent: number
  taxRate: number
  subtotal: number
  batchNumber: string | null
  expiryDate: string | null
  reason: string | null
}

interface PurchaseReturn {
  id: string
  returnNumber: string
  purchaseId: string
  supplierId: string
  supplierName: string
  accountId: string | null
  accountName: string | null
  userId: string
  userName: string
  subtotal: number
  taxAmount: number
  discountAmount: number
  totalAmount: number
  refundAmount: number
  refundStatus: 'pending' | 'partial' | 'refunded'
  reason: string | null
  notes: string | null
  createdAt: string
  items: PurchaseReturnItem[]
}

interface PurchaseReturnItem {
  id: string
  returnId: string
  purchaseItemId: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  discountPercent: number
  taxRate: number
  subtotal: number
  batchNumber: string | null
  expiryDate: string | null
  reason: string | null
}

interface DamagedItem {
  id: string
  productId: string
  productName: string
  quantity: number
  reason: string
  batchNumber: string | null
  expiryDate: string | null
  reportedBy: string
  createdAt: string
}

type TabType = 'sales-returns' | 'purchase-returns' | 'damaged-expired'

export default function Returns(): React.JSX.Element {
  const user = useAuthStore((state) => state.user)
  const [activeTab, setActiveTab] = useState<TabType>('sales-returns')

  // Sales Returns
  const [salesReturns, setSalesReturns] = useState<SalesReturn[]>([])
  const [filteredSalesReturns, setFilteredSalesReturns] = useState<SalesReturn[]>([])
  const [salesSearchTerm, setSalesSearchTerm] = useState('')
  const [salesCurrentPage, setSalesCurrentPage] = useState(1)
  const [salesItemsPerPage, setSalesItemsPerPage] = useState(25)

  // Purchase Returns
  const [purchaseReturns, setPurchaseReturns] = useState<PurchaseReturn[]>([])
  const [filteredPurchaseReturns, setFilteredPurchaseReturns] = useState<PurchaseReturn[]>([])
  const [purchaseSearchTerm, setPurchaseSearchTerm] = useState('')
  const [purchaseCurrentPage, setPurchaseCurrentPage] = useState(1)
  const [purchaseItemsPerPage, setPurchaseItemsPerPage] = useState(25)

  // Damaged/Expired Items
  const [damagedItems, setDamagedItems] = useState<DamagedItem[]>([])
  const [filteredDamagedItems, setFilteredDamagedItems] = useState<DamagedItem[]>([])
  const [damagedSearchTerm, setDamagedSearchTerm] = useState('')
  const [damagedCurrentPage, setDamagedCurrentPage] = useState(1)
  const [damagedItemsPerPage, setDamagedItemsPerPage] = useState(25)

  // Modals
  const [showDamagedItemModal, setShowDamagedItemModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedReturn, setSelectedReturn] = useState<SalesReturn | PurchaseReturn | null>(null)

  // Form states for new damaged item
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [damageQuantity, setDamageQuantity] = useState(1)
  const [damageReason, setDamageReason] = useState<'expired' | 'damaged' | 'defective'>('expired')
  const [damageBatchNumber, setDamageBatchNumber] = useState('')
  const [damageExpiryDate, setDamageExpiryDate] = useState('')
  const [damageNotes, setDamageNotes] = useState('')

  // Product search for damaged items
  const [productSearchTerm, setProductSearchTerm] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [showProductDropdown, setShowProductDropdown] = useState(false)

  useEffect(() => {
    void loadSalesReturns()
    void loadPurchaseReturns()
    void loadDamagedItems()
  }, [])

  useEffect(() => {
    const filtered = salesReturns.filter(
      (ret) =>
        ret.returnNumber.toLowerCase().includes(salesSearchTerm.toLowerCase()) ||
        ret.customerName?.toLowerCase().includes(salesSearchTerm.toLowerCase()) ||
        ret.reason?.toLowerCase().includes(salesSearchTerm.toLowerCase())
    )
    setFilteredSalesReturns(filtered)
    setSalesCurrentPage(1)
  }, [salesSearchTerm, salesReturns])

  useEffect(() => {
    const filtered = purchaseReturns.filter(
      (ret) =>
        ret.returnNumber.toLowerCase().includes(purchaseSearchTerm.toLowerCase()) ||
        ret.supplierName.toLowerCase().includes(purchaseSearchTerm.toLowerCase()) ||
        ret.reason?.toLowerCase().includes(purchaseSearchTerm.toLowerCase())
    )
    setFilteredPurchaseReturns(filtered)
    setPurchaseCurrentPage(1)
  }, [purchaseSearchTerm, purchaseReturns])

  useEffect(() => {
    const filtered = damagedItems.filter(
      (item) =>
        item.productName.toLowerCase().includes(damagedSearchTerm.toLowerCase()) ||
        item.reason.toLowerCase().includes(damagedSearchTerm.toLowerCase()) ||
        item.batchNumber?.toLowerCase().includes(damagedSearchTerm.toLowerCase())
    )
    setFilteredDamagedItems(filtered)
    setDamagedCurrentPage(1)
  }, [damagedSearchTerm, damagedItems])

  useEffect(() => {
    if (productSearchTerm.length > 0) {
      void searchProducts()
    } else {
      setProducts([])
      setShowProductDropdown(false)
    }
  }, [productSearchTerm])

  const loadSalesReturns = async (): Promise<void> => {
    try {
      const returns = await window.api.salesReturns.getAll()
      setSalesReturns(returns)
      setFilteredSalesReturns(returns)
    } catch (error) {
      toast.error('Failed to load sales returns')
      console.error(error)
    }
  }

  const loadPurchaseReturns = async (): Promise<void> => {
    try {
      const returns = await window.api.purchaseReturns.getAll()
      setPurchaseReturns(returns)
      setFilteredPurchaseReturns(returns)
    } catch (error) {
      toast.error('Failed to load purchase returns')
      console.error(error)
    }
  }

  const loadDamagedItems = async (): Promise<void> => {
    try {
      const items = await window.api.damagedItems.getAll()
      setDamagedItems(items)
      setFilteredDamagedItems(items)
    } catch (error) {
      toast.error('Failed to load damaged items')
      console.error(error)
    }
  }

  const searchProducts = async (): Promise<void> => {
    try {
      const results = await window.api.products.search(productSearchTerm)
      setProducts(results)
      setShowProductDropdown(true)
    } catch (error) {
      console.error('Failed to search products:', error)
    }
  }

  const handleCreateDamagedItem = async (): Promise<void> => {
    if (!selectedProduct) {
      toast.error('Please select a product')
      return
    }

    if (damageQuantity <= 0) {
      toast.error('Quantity must be greater than 0')
      return
    }

    try {
      await window.api.damagedItems.create({
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        quantity: damageQuantity,
        reason: damageReason,
        batchNumber: damageBatchNumber || null,
        expiryDate: damageExpiryDate || null,
        notes: damageNotes || null,
        reportedBy: user?.id || ''
      })

      toast.success('Damaged item recorded successfully')
      resetDamagedForm()
      setShowDamagedItemModal(false)
      void loadDamagedItems()
    } catch (error) {
      toast.error('Failed to record damaged item')
      console.error(error)
    }
  }

  const resetDamagedForm = (): void => {
    setSelectedProduct(null)
    setDamageQuantity(1)
    setDamageReason('expired')
    setDamageBatchNumber('')
    setDamageExpiryDate('')
    setDamageNotes('')
    setProductSearchTerm('')
    setShowProductDropdown(false)
  }

  const handleViewDetails = (returnItem: SalesReturn | PurchaseReturn): void => {
    setSelectedReturn(returnItem)
    setShowDetailsModal(true)
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRefundStatusBadge = (status: string): React.JSX.Element => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      partial: 'bg-blue-100 text-blue-800',
      refunded: 'bg-green-100 text-green-800'
    }

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  // Pagination calculations
  const salesTotalPages = Math.ceil(filteredSalesReturns.length / salesItemsPerPage)
  const paginatedSalesReturns = filteredSalesReturns.slice(
    (salesCurrentPage - 1) * salesItemsPerPage,
    salesCurrentPage * salesItemsPerPage
  )

  const purchaseTotalPages = Math.ceil(filteredPurchaseReturns.length / purchaseItemsPerPage)
  const paginatedPurchaseReturns = filteredPurchaseReturns.slice(
    (purchaseCurrentPage - 1) * purchaseItemsPerPage,
    purchaseCurrentPage * purchaseItemsPerPage
  )

  const damagedTotalPages = Math.ceil(filteredDamagedItems.length / damagedItemsPerPage)
  const paginatedDamagedItems = filteredDamagedItems.slice(
    (damagedCurrentPage - 1) * damagedItemsPerPage,
    damagedCurrentPage * damagedItemsPerPage
  )

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Returns & Damage Tracking</h1>
        <p className="text-sm text-gray-600 mt-1">
          Manage sales returns, purchase returns, and damaged/expired inventory
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('sales-returns')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'sales-returns'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Sales Returns
            </button>
            <button
              onClick={() => setActiveTab('purchase-returns')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'purchase-returns'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Purchase Returns
            </button>
            <button
              onClick={() => setActiveTab('damaged-expired')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'damaged-expired'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Damaged/Expired Items
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Sales Returns Tab */}
          {activeTab === 'sales-returns' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="relative flex-1 max-w-md">
                  <input
                    type="text"
                    placeholder="Search by return number, customer, or reason..."
                    value={salesSearchTerm}
                    onChange={(e) => setSalesSearchTerm(e.target.value)}
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
                {/* Note: Sales returns are created from the Sales page */}
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Return #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Refund Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reason
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedSalesReturns.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                          No sales returns found
                        </td>
                      </tr>
                    ) : (
                      paginatedSalesReturns.map((returnItem) => (
                        <tr key={returnItem.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {returnItem.returnNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {returnItem.customerName || 'Walk-in'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(returnItem.totalAmount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {getRefundStatusBadge(returnItem.refundStatus)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {returnItem.reason || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(returnItem.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleViewDetails(returnItem)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {filteredSalesReturns.length > 0 && (
                <div className="mt-4">
                  <Pagination
                    currentPage={salesCurrentPage}
                    totalPages={salesTotalPages}
                    totalItems={filteredSalesReturns.length}
                    itemsPerPage={salesItemsPerPage}
                    onPageChange={(page) => setSalesCurrentPage(page)}
                    onItemsPerPageChange={(items) => {
                      setSalesItemsPerPage(items)
                      setSalesCurrentPage(1)
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Purchase Returns Tab */}
          {activeTab === 'purchase-returns' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="relative flex-1 max-w-md">
                  <input
                    type="text"
                    placeholder="Search by return number, supplier, or reason..."
                    value={purchaseSearchTerm}
                    onChange={(e) => setPurchaseSearchTerm(e.target.value)}
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
                {/* Note: Purchase returns are created from the Purchases page */}
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Return #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Supplier
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Refund Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reason
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedPurchaseReturns.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                          No purchase returns found
                        </td>
                      </tr>
                    ) : (
                      paginatedPurchaseReturns.map((returnItem) => (
                        <tr key={returnItem.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {returnItem.returnNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {returnItem.supplierName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(returnItem.totalAmount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {getRefundStatusBadge(returnItem.refundStatus)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {returnItem.reason || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(returnItem.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleViewDetails(returnItem)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {filteredPurchaseReturns.length > 0 && (
                <div className="mt-4">
                  <Pagination
                    currentPage={purchaseCurrentPage}
                    totalPages={purchaseTotalPages}
                    totalItems={filteredPurchaseReturns.length}
                    itemsPerPage={purchaseItemsPerPage}
                    onPageChange={(page) => setPurchaseCurrentPage(page)}
                    onItemsPerPageChange={(items) => {
                      setPurchaseItemsPerPage(items)
                      setPurchaseCurrentPage(1)
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Damaged/Expired Items Tab */}
          {activeTab === 'damaged-expired' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="relative flex-1 max-w-md">
                  <input
                    type="text"
                    placeholder="Search by product, reason, or batch number..."
                    value={damagedSearchTerm}
                    onChange={(e) => setDamagedSearchTerm(e.target.value)}
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
                <button
                  onClick={() => setShowDamagedItemModal(true)}
                  className="ml-4 inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                >
                  <svg
                    className="w-5 h-5 mr-2"
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
                  Report Damaged/Expired Item
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reason
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Batch Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Expiry Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reported By
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date Reported
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedDamagedItems.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                          No damaged/expired items found
                        </td>
                      </tr>
                    ) : (
                      paginatedDamagedItems.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {item.productName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                item.reason === 'expired'
                                  ? 'bg-orange-100 text-orange-800'
                                  : item.reason === 'damaged'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {item.reason.charAt(0).toUpperCase() + item.reason.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.batchNumber || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.reportedBy}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(item.createdAt)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {filteredDamagedItems.length > 0 && (
                <div className="mt-4">
                  <Pagination
                    currentPage={damagedCurrentPage}
                    totalPages={damagedTotalPages}
                    totalItems={filteredDamagedItems.length}
                    itemsPerPage={damagedItemsPerPage}
                    onPageChange={(page) => setDamagedCurrentPage(page)}
                    onItemsPerPageChange={(items) => {
                      setDamagedItemsPerPage(items)
                      setDamagedCurrentPage(1)
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Damaged Item Modal */}
      {showDamagedItemModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Report Damaged/Expired Item</h2>
              <button
                onClick={() => {
                  setShowDamagedItemModal(false)
                  resetDamagedForm()
                }}
                className="text-gray-400 hover:text-gray-600"
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

            <div className="space-y-4">
              {/* Product Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                <div className="relative">
                  <input
                    type="text"
                    value={selectedProduct ? selectedProduct.name : productSearchTerm}
                    onChange={(e) => {
                      setProductSearchTerm(e.target.value)
                      if (selectedProduct) setSelectedProduct(null)
                    }}
                    placeholder="Search for product..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {showProductDropdown && products.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {products.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => {
                            setSelectedProduct(product)
                            setProductSearchTerm('')
                            setShowProductDropdown(false)
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {selectedProduct && (
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm text-blue-800 font-medium">{selectedProduct.name}</p>
                    <p className="text-xs text-blue-600">SKU: {selectedProduct.sku}</p>
                  </div>
                )}
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={damageQuantity}
                  onChange={(e) => setDamageQuantity(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <select
                  value={damageReason}
                  onChange={(e) =>
                    setDamageReason(e.target.value as 'expired' | 'damaged' | 'defective')
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="expired">Expired</option>
                  <option value="damaged">Damaged</option>
                  <option value="defective">Defective</option>
                </select>
              </div>

              {/* Batch Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batch Number (Optional)
                </label>
                <input
                  type="text"
                  value={damageBatchNumber}
                  onChange={(e) => setDamageBatchNumber(e.target.value)}
                  placeholder="Enter batch number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date (Optional)
                </label>
                <input
                  type="date"
                  value={damageExpiryDate}
                  onChange={(e) => setDamageExpiryDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={damageNotes}
                  onChange={(e) => setDamageNotes(e.target.value)}
                  placeholder="Add any additional notes..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowDamagedItemModal(false)
                    resetDamagedForm()
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateDamagedItem}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  Report Item
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedReturn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {'customerName' in selectedReturn
                  ? 'Sales Return Details'
                  : 'Purchase Return Details'}
              </h2>
              <button
                onClick={() => {
                  setShowDetailsModal(false)
                  setSelectedReturn(null)
                }}
                className="text-gray-400 hover:text-gray-600"
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

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">Return Number</p>
                <p className="font-medium">{selectedReturn.returnNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">
                  {'customerName' in selectedReturn ? 'Customer' : 'Supplier'}
                </p>
                <p className="font-medium">
                  {'customerName' in selectedReturn
                    ? selectedReturn.customerName || 'Walk-in'
                    : selectedReturn.supplierName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="font-medium">{formatCurrency(selectedReturn.totalAmount)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Refund Status</p>
                <div className="mt-1">{getRefundStatusBadge(selectedReturn.refundStatus)}</div>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Reason</p>
                <p className="font-medium">{selectedReturn.reason || '-'}</p>
              </div>
              {selectedReturn.notes && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Notes</p>
                  <p className="font-medium">{selectedReturn.notes}</p>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-semibold mb-3">Return Items</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Product
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Quantity
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Unit Price
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Subtotal
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Reason
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedReturn.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-2 text-sm text-gray-900">{item.productName}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{item.quantity}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {formatCurrency(item.subtotal)}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">{item.reason || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setShowDetailsModal(false)
                  setSelectedReturn(null)
                }}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
