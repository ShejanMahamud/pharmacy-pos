import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import { Product, SalesReturn, PurchaseReturn, DamagedItem, TabType } from '../types/return'
import ReturnsTabs from '../components/returns/ReturnsTabs'
import SalesReturnsTable from '../components/returns/SalesReturnsTable'
import PurchaseReturnsTable from '../components/returns/PurchaseReturnsTable'
import DamagedItemsTable from '../components/returns/DamagedItemsTable'
import DamagedItemModal from '../components/returns/DamagedItemModal'
import ReturnDetailsModal from '../components/returns/ReturnDetailsModal'

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleProductSearchChange = (term: string): void => {
    setProductSearchTerm(term)
    if (selectedProduct) setSelectedProduct(null)
  }

  const handleProductSelect = (product: Product): void => {
    setSelectedProduct(product)
    setProductSearchTerm('')
    setShowProductDropdown(false)
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
      <ReturnsTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {activeTab === 'sales-returns' && (
          <SalesReturnsTable
            returns={paginatedSalesReturns}
            searchTerm={salesSearchTerm}
            onSearchChange={setSalesSearchTerm}
            currentPage={salesCurrentPage}
            totalPages={salesTotalPages}
            itemsPerPage={salesItemsPerPage}
            onPageChange={setSalesCurrentPage}
            onItemsPerPageChange={(items) => {
              setSalesItemsPerPage(items)
              setSalesCurrentPage(1)
            }}
            onViewDetails={handleViewDetails}
          />
        )}

        {activeTab === 'purchase-returns' && (
          <PurchaseReturnsTable
            returns={paginatedPurchaseReturns}
            searchTerm={purchaseSearchTerm}
            onSearchChange={setPurchaseSearchTerm}
            currentPage={purchaseCurrentPage}
            totalPages={purchaseTotalPages}
            itemsPerPage={purchaseItemsPerPage}
            onPageChange={setPurchaseCurrentPage}
            onItemsPerPageChange={(items) => {
              setPurchaseItemsPerPage(items)
              setPurchaseCurrentPage(1)
            }}
            onViewDetails={handleViewDetails}
          />
        )}

        {activeTab === 'damaged-expired' && (
          <DamagedItemsTable
            items={paginatedDamagedItems}
            searchTerm={damagedSearchTerm}
            onSearchChange={setDamagedSearchTerm}
            currentPage={damagedCurrentPage}
            totalPages={damagedTotalPages}
            itemsPerPage={damagedItemsPerPage}
            onPageChange={setDamagedCurrentPage}
            onItemsPerPageChange={(items) => {
              setDamagedItemsPerPage(items)
              setDamagedCurrentPage(1)
            }}
            onAddDamagedItem={() => setShowDamagedItemModal(true)}
          />
        )}
      </div>

      {/* Modals */}
      <DamagedItemModal
        isOpen={showDamagedItemModal}
        onClose={() => {
          setShowDamagedItemModal(false)
          resetDamagedForm()
        }}
        selectedProduct={selectedProduct}
        productSearchTerm={productSearchTerm}
        products={products}
        showProductDropdown={showProductDropdown}
        quantity={damageQuantity}
        reason={damageReason}
        batchNumber={damageBatchNumber}
        expiryDate={damageExpiryDate}
        notes={damageNotes}
        onProductSearchChange={handleProductSearchChange}
        onProductSelect={handleProductSelect}
        onQuantityChange={setDamageQuantity}
        onReasonChange={setDamageReason}
        onBatchNumberChange={setDamageBatchNumber}
        onExpiryDateChange={setDamageExpiryDate}
        onNotesChange={setDamageNotes}
        onSubmit={handleCreateDamagedItem}
      />

      <ReturnDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false)
          setSelectedReturn(null)
        }}
        returnItem={selectedReturn}
      />
    </div>
  )
}
