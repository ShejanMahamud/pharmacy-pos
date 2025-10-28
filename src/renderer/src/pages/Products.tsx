import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
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
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(25)

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

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
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
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Products Management</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your pharmacy products inventory</p>
        </div>
        <Link
          to="/categories-units"
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
          Manage Categories & Units
        </Link>
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <ProductFilters
            searchTerm={searchTerm}
            categoryFilter={categoryFilter}
            categories={categories}
            onSearchChange={setSearchTerm}
            onCategoryFilterChange={setCategoryFilter}
          />
          <button
            onClick={() => {
              setEditingProduct(null)
              setShowModal(true)
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Product
          </button>
        </div>
      </div>

      {/* Products Table */}
      <ProductsTable
        products={paginatedProducts}
        categories={categories}
        inventory={inventory}
        currencySymbol={getCurrencySymbol()}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
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
    </div>
  )
}
