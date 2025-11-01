import { Box, Container, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import InventoryDetailsModal from '../components/inventory/InventoryDetailsModal'
import InventoryFilters from '../components/inventory/InventoryFilters'
import InventoryStats from '../components/inventory/InventoryStats'
import InventoryTable from '../components/inventory/InventoryTable'
import StockAdjustmentModal from '../components/inventory/StockAdjustmentModal'
import { useSettingsStore } from '../store/settingsStore'
import {
  Category,
  InventoryItem,
  InventoryWithProduct,
  Product,
  StockAdjustmentFormData
} from '../types/inventory'

export default function Inventory(): React.JSX.Element {
  const currency = useSettingsStore((state) => state.currency)
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'low' | 'out'>('all')
  const [showModal, setShowModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [selectedItem, setSelectedItem] = useState<InventoryWithProduct | null>(null)
  const [loading, setLoading] = useState(false)

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

  const [formData, setFormData] = useState<StockAdjustmentFormData>({
    productId: '',
    quantity: 0,
    batchNumber: '',
    expiryDate: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async (): Promise<void> => {
    try {
      setLoading(true)
      const [inventoryData, productsData, categoriesData] = await Promise.all([
        window.api.inventory.getAll(),
        window.api.products.getAll(),
        window.api.categories.getAll()
      ])
      setInventory(inventoryData)
      setProducts(productsData)
      setCategories(categoriesData)
    } catch (error) {
      toast.error('Failed to load inventory data')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const inventoryWithProducts: InventoryWithProduct[] = inventory
    .map((item) => ({
      ...item,
      product: products.find((p) => p.id === item.productId)
    }))
    .filter((item) => item.product)

  const filteredInventory = inventoryWithProducts.filter((item) => {
    const product = item.product!
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.barcode && product.barcode.toLowerCase().includes(searchTerm.toLowerCase()))

    if (filterType === 'low') {
      return matchesSearch && item.quantity > 0 && item.quantity <= product.reorderLevel
    } else if (filterType === 'out') {
      return matchesSearch && item.quantity === 0
    }
    return matchesSearch
  })

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()

    if (!formData.productId || formData.quantity < 0) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      if (editingItem) {
        await window.api.inventory.updateQuantity(formData.productId, formData.quantity)
        toast.success('Inventory updated successfully')
      } else {
        await window.api.inventory.updateQuantity(formData.productId, formData.quantity)
        toast.success('Inventory added successfully')
      }
      handleCloseModal()
      loadData()
    } catch (error) {
      toast.error('Failed to save inventory')
      console.error(error)
    }
  }

  const handleEdit = (item: InventoryWithProduct): void => {
    setEditingItem(item)
    setFormData({
      productId: item.productId,
      quantity: item.quantity,
      batchNumber: item.batchNumber || '',
      expiryDate: item.expiryDate || ''
    })
    setShowModal(true)
  }

  const handleCloseModal = (): void => {
    setShowModal(false)
    setEditingItem(null)
    setFormData({
      productId: '',
      quantity: 0,
      batchNumber: '',
      expiryDate: ''
    })
  }

  const handleSearchChange = (value: string): void => {
    setSearchTerm(value)
  }

  const handleFilterChange = (value: 'all' | 'low' | 'out'): void => {
    setFilterType(value)
  }

  const handleViewDetails = (item: InventoryWithProduct): void => {
    setSelectedItem(item)
    setShowDetailsModal(true)
  }

  const handleCloseDetailsModal = (): void => {
    setShowDetailsModal(false)
    setSelectedItem(null)
  }

  // Calculate stats
  const lowStockCount = inventoryWithProducts.filter(
    (item) => item.product && item.quantity > 0 && item.quantity <= item.product.reorderLevel
  ).length

  const outOfStockCount = inventoryWithProducts.filter((item) => item.quantity === 0).length

  const totalValue = inventoryWithProducts.reduce((sum, item) => {
    return sum + (item.product?.costPrice || 0) * item.quantity
  }, 0)

  return (
    <Container maxWidth="xl" sx={{ py: 4, bgcolor: 'grey.100', minHeight: '100vh' }}>
      {/* Page Header */}
      <Box
        sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
      >
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Inventory Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track and manage stock levels across your pharmacy
          </Typography>
        </Box>
      </Box>

      {/* Stats Cards */}
      <InventoryStats
        totalItems={inventoryWithProducts.length}
        lowStockCount={lowStockCount}
        outOfStockCount={outOfStockCount}
        totalValue={totalValue}
        currencySymbol={getCurrencySymbol()}
      />

      {/* Action Bar */}
      <InventoryFilters
        searchTerm={searchTerm}
        filterType={filterType}
        onSearchChange={handleSearchChange}
        onFilterChange={handleFilterChange}
        onAdjustStock={() => setShowModal(true)}
      />

      {/* Inventory Table */}
      <InventoryTable
        inventory={filteredInventory}
        categories={categories}
        loading={loading}
        currencySymbol={getCurrencySymbol()}
        onEdit={handleEdit}
        onViewDetails={handleViewDetails}
      />

      {/* Stock Adjustment Modal */}
      <StockAdjustmentModal
        isOpen={showModal}
        onClose={handleCloseModal}
        editingItem={editingItem}
        products={products}
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={handleSubmit}
      />

      {/* Inventory Details Modal */}
      <InventoryDetailsModal
        isOpen={showDetailsModal}
        item={selectedItem}
        category={
          selectedItem?.product
            ? categories.find((c) => c.id === selectedItem.product?.categoryId) || null
            : null
        }
        currencySymbol={getCurrencySymbol()}
        onClose={handleCloseDetailsModal}
      />
    </Container>
  )
}
