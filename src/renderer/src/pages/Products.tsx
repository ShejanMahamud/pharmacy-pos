import AddIcon from '@mui/icons-material/Add'
import CategoryIcon from '@mui/icons-material/Category'
import { Box, Button, Container, Paper, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import ProductFilters from '../components/products/ProductFilters'
import ProductFormModal from '../components/products/ProductFormModal'
import ProductsTable from '../components/products/ProductsTable'
import { useSettingsStore } from '../store/settingsStore'
import { Category, InventoryItem, Product, ProductFormData, Supplier, Unit } from '../types/product'

export default function Products(): React.JSX.Element {
  const currency = useSettingsStore((state) => state.currency)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [inventory, setInventory] = useState<Record<string, number>>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
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

  useEffect(() => {
    const loadData = async (): Promise<void> => {
      try {
        setLoading(true)
        const [productsData, categoriesData, suppliersData, unitsData, inventoryData] =
          await Promise.all([
            window.api.products.getAll(),
            window.api.categories.getAll(),
            window.api.suppliers.getAll(),
            window.api.units.getAll(),
            window.api.inventory.getAll()
          ])
        setProducts(productsData)
        setCategories(categoriesData)
        setSuppliers(suppliersData)
        setUnits(unitsData)

        // Create inventory map: productId -> total quantity
        const inventoryMap: Record<string, number> = {}
        inventoryData.forEach((item: InventoryItem) => {
          if (inventoryMap[item.productId]) {
            inventoryMap[item.productId] += item.quantity
          } else {
            inventoryMap[item.productId] = item.quantity
          }
        })
        setInventory(inventoryMap)
      } catch (error) {
        toast.error('Failed to load data')
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const reloadData = async (): Promise<void> => {
    try {
      setLoading(true)
      const [productsData, categoriesData, suppliersData, unitsData, inventoryData] =
        await Promise.all([
          window.api.products.getAll(),
          window.api.categories.getAll(),
          window.api.suppliers.getAll(),
          window.api.units.getAll(),
          window.api.inventory.getAll()
        ])
      setProducts(productsData)
      setCategories(categoriesData)
      setSuppliers(suppliersData)
      setUnits(unitsData)

      // Create inventory map: productId -> total quantity
      const inventoryMap: Record<string, number> = {}
      inventoryData.forEach((item: InventoryItem) => {
        if (inventoryMap[item.productId]) {
          inventoryMap[item.productId] += item.quantity
        } else {
          inventoryMap[item.productId] = item.quantity
        }
      })
      setInventory(inventoryMap)
    } catch (error) {
      toast.error('Failed to load data')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(
    (product) =>
      (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.barcode && product.barcode.toLowerCase().includes(searchTerm.toLowerCase()))) &&
      (categoryFilter === '' || product.categoryId === categoryFilter)
  )

  const handleSubmit = async (formData: ProductFormData): Promise<void> => {
    if (!formData.name || !formData.sku || formData.sellingPrice <= 0) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const productData = {
        ...formData,
        categoryId: formData.categoryId || null,
        supplierId: formData.supplierId || null,
        barcode: formData.barcode || null,
        genericName: formData.genericName || null,
        description: formData.description || null,
        manufacturer: formData.manufacturer || null,
        isActive: true
      }

      if (editingProduct) {
        await window.api.products.update(editingProduct.id, productData)
        // Update inventory quantity
        await window.api.inventory.updateQuantity(editingProduct.id, formData.stockQuantity)
        toast.success('Product updated successfully')
      } else {
        const newProduct = await window.api.products.create(productData)
        // Create initial inventory record
        await window.api.inventory.updateQuantity(newProduct.id, formData.stockQuantity)
        toast.success('Product created successfully')
      }
      handleCloseModal()
      reloadData()
    } catch (error) {
      console.error('Error saving product:', error)
      if (error instanceof Error) {
        toast.error(`Failed to save product: ${error.message}`)
      } else {
        toast.error('Failed to save product')
      }
    }
  }

  const handleEdit = (product: Product): void => {
    setEditingProduct(product)
    setShowModal(true)
  }

  const handleDelete = async (id: string): Promise<void> => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      await window.api.products.delete(id)
      toast.success('Product deleted successfully')
      reloadData()
    } catch (error) {
      toast.error('Failed to delete product')
      console.error(error)
    }
  }

  const handleCloseModal = (): void => {
    setShowModal(false)
    setEditingProduct(null)
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4, bgcolor: 'grey.100', minHeight: '100vh' }}>
      {/* Page Header */}
      <Box
        sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
      >
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Products Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your pharmacy products inventory
          </Typography>
        </Box>
      </Box>

      {/* Action Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap'
          }}
        >
          <ProductFilters
            searchTerm={searchTerm}
            categoryFilter={categoryFilter}
            categories={categories}
            onSearchChange={setSearchTerm}
            onCategoryFilterChange={setCategoryFilter}
          />
          <Box sx={{ display: 'flex', gap: 2, mt: { xs: 2, sm: 0 } }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditingProduct(null)
                setShowModal(true)
              }}
            >
              Add Product
            </Button>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<CategoryIcon />}
              component="a"
              href="#/categories-units"
            >
              Manage Categories & Units
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Products Table */}
      <ProductsTable
        products={filteredProducts}
        categories={categories}
        inventory={inventory}
        currencySymbol={getCurrencySymbol()}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Product Form Modal */}
      <ProductFormModal
        isOpen={showModal}
        editingProduct={editingProduct}
        suppliers={suppliers}
        categories={categories}
        units={units}
        currencySymbol={getCurrencySymbol()}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
      />
    </Container>
  )
}
