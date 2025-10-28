import { useCallback, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import { useCartStore } from '../store/cartStore'
import { useSettingsStore } from '../store/settingsStore'

interface InventoryItem {
  id: string
  productId: string
  quantity: number
  reorderLevel: number
}

interface Product {
  id: string
  name: string
  genericName?: string
  barcode?: string
  sku: string
  sellingPrice: number
  costPrice: number
  taxRate: number
  discountPercent: number
  quantity?: number
}

interface Customer {
  id: string
  name: string
  phone: string
  email?: string
  loyaltyPoints: number
}

interface BankAccount {
  id: string
  name: string
  accountType: string
  currentBalance: number
  isActive: boolean
}

export default function POS(): React.JSX.Element {
  const [searchTerm, setSearchTerm] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [selectedAccount, setSelectedAccount] = useState('')
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [paidAmount, setPaidAmount] = useState('')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [customerSearch, setCustomerSearch] = useState('')
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [barcodeBuffer, setBarcodeBuffer] = useState('')
  const [isBarcodeScanning, setIsBarcodeScanning] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const barcodeTimerRef = useRef<NodeJS.Timeout | null>(null)

  const cart = useCartStore()
  const user = useAuthStore((state) => state.user)
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

  const loadProducts = async (): Promise<void> => {
    try {
      setLoading(true)
      const allProducts = await window.api.products.getAll()
      setProducts(allProducts)
    } catch (_error) {
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const searchProducts = async (): Promise<void> => {
    if (!searchTerm.trim()) {
      await loadProducts()
      return
    }

    try {
      const results = await window.api.products.getAll(searchTerm)
      setProducts(results)
    } catch (_error) {
      toast.error('Search failed')
    }
  }

  const loadInventory = async (): Promise<void> => {
    try {
      const inv = await window.api.inventory.getAll()
      setInventory(inv)
    } catch (_error) {
      console.error('Failed to load inventory')
    }
  }

  const loadAccounts = async (): Promise<void> => {
    try {
      const allAccounts = await window.api.bankAccounts.getAll()
      setAccounts(allAccounts.filter((acc) => acc.isActive))
    } catch (_error) {
      console.error('Failed to load accounts')
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      void searchProducts()
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    void loadProducts()
    void loadInventory()
    void loadAccounts()
    // Focus search input on mount for barcode scanner
    searchInputRef.current?.focus()
  }, [])

  const addToCart = useCallback(
    (product: Product): void => {
      // Check inventory
      const inventoryItem = inventory.find((inv) => inv.productId === product.id)
      if (inventoryItem && inventoryItem.quantity <= 0) {
        toast.error('Product out of stock')
        return
      }

      cart.addItem({
        productId: product.id,
        name: product.name,
        price: product.sellingPrice,
        quantity: 1,
        discount: product.discountPercent || 0,
        taxRate: product.taxRate || 0
      })
      toast.success(`${product.name} added to cart`)

      // Refocus search input for barcode scanner
      searchInputRef.current?.focus()
    },
    [cart, inventory]
  )

  const handleBarcodeSearch = useCallback(
    async (barcode: string): Promise<void> => {
      if (!barcode.trim()) return

      try {
        const product = await window.api.products.getByBarcode(barcode)
        if (product) {
          addToCart(product)
          setSearchTerm('')
        } else {
          toast.error('Product not found')
        }
      } catch (_error) {
        console.error('Barcode search error')
      }
    },
    [addToCart, setSearchTerm]
  )

  // Barcode scanner keyboard event listener
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent): void => {
      // Ignore if typing in input fields (except search input)
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return
      }

      // If Enter pressed and buffer has content, search
      if (e.key === 'Enter' && barcodeBuffer) {
        void handleBarcodeSearch(barcodeBuffer)
        setBarcodeBuffer('')
        setIsBarcodeScanning(false)
        return
      }

      // Accumulate printable characters (letters, numbers, symbols)
      if (e.key.length === 1) {
        setBarcodeBuffer((prev) => prev + e.key)
        setIsBarcodeScanning(true)

        // Clear buffer if no input for 100ms (indicates manual typing, not scanner)
        if (barcodeTimerRef.current) {
          clearTimeout(barcodeTimerRef.current)
        }
        barcodeTimerRef.current = setTimeout(() => {
          setBarcodeBuffer('')
          setIsBarcodeScanning(false)
        }, 100)
      }
    }

    window.addEventListener('keypress', handleKeyPress)
    return () => {
      window.removeEventListener('keypress', handleKeyPress)
      if (barcodeTimerRef.current) {
        clearTimeout(barcodeTimerRef.current)
      }
    }
  }, [barcodeBuffer, handleBarcodeSearch])

  const searchCustomers = async (): Promise<void> => {
    try {
      const results = await window.api.customers.getAll(customerSearch)
      setCustomers(results)
    } catch (_error) {
      toast.error('Failed to search customers')
    }
  }

  const selectCustomer = (customer: Customer): void => {
    setSelectedCustomer(customer)
    cart.setCustomer(customer.id)
    setShowCustomerModal(false)
    toast.success(`Customer ${customer.name} selected`)
  }

  useEffect(() => {
    if (customerSearch) {
      const timer = setTimeout(() => {
        void searchCustomers()
      }, 300)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [customerSearch])

  const handleCheckout = (): void => {
    if (cart.items.length === 0) {
      toast.error('Cart is empty')
      return
    }
    setShowPaymentModal(true)
  }

  const completeSale = async (): Promise<void> => {
    if (!user) return

    const paidAmountNum = parseFloat(paidAmount) || 0
    const total = cart.getTotal()

    if (paidAmountNum < total) {
      toast.error('Insufficient payment amount')
      return
    }

    try {
      const invoiceNumber = `INV-${Date.now()}`
      const sale = {
        invoiceNumber,
        userId: user.id,
        customerId: cart.customerId,
        accountId: selectedAccount || null,
        subtotal: cart.getSubtotal(),
        taxAmount: cart.getTaxAmount(),
        discountAmount: cart.getDiscountAmount(),
        totalAmount: total,
        paidAmount: paidAmountNum,
        changeAmount: paidAmountNum - total,
        paymentMethod,
        status: 'completed'
      }

      const items = cart.items.map((item) => ({
        productId: item.productId,
        productName: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        discountPercent: item.discount,
        taxRate: item.taxRate,
        subtotal: item.price * item.quantity
      }))

      await window.api.sales.create(sale, items)

      toast.success(`Sale completed! Invoice: ${invoiceNumber}`)
      cart.clearCart()
      setPaidAmount('')
      setSelectedAccount('')
      setShowPaymentModal(false)
      setNotes('')
      await loadProducts()
    } catch (_error) {
      toast.error('Failed to complete sale')
    }
  }

  return (
    <div className="p-6 h-full bg-gray-100">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Point of Sale</h1>
        <p className="text-sm text-gray-600 mt-1">Process customer transactions and manage sales</p>
      </div>

      <div className="flex h-[calc(100vh-180px)] gap-6">
        {/* Left Side - Products */}
        <div className="flex-1 flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Search and Customer Selection */}
          <div className="mb-6 space-y-3">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search products by name, barcode, or SKU (Press Enter to scan)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && searchTerm.trim()) {
                      handleBarcodeSearch(searchTerm)
                    }
                  }}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  autoFocus
                />
                <svg
                  className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
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
                {/* Barcode Scanning Indicator */}
                {isBarcodeScanning && (
                  <div className="absolute right-3 top-3 flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                      />
                    </svg>
                    <span>Scanning...</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowCustomerModal(true)}
                className="inline-flex items-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Select Customer
              </button>
            </div>

            {/* Selected Customer Badge */}
            {selectedCustomer && (
              <div className="flex items-center justify-between bg-blue-50 border border-blue-200 px-4 py-3 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
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
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-blue-900">{selectedCustomer.name}</p>
                    <p className="text-sm text-blue-700">
                      {selectedCustomer.phone} • {selectedCustomer.loyaltyPoints} pts
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedCustomer(null)
                    cart.setCustomer(undefined)
                    toast.success('Customer removed')
                  }}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Products Grid */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
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
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
                <p className="mt-1 text-sm text-gray-500">Try adjusting your search query</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {products.map((product) => {
                  const inventoryItem = inventory.find((inv) => inv.productId === product.id)
                  const stock = inventoryItem?.quantity || 0
                  const isLowStock = stock <= (product.quantity || 10)
                  const isOutOfStock = stock === 0

                  return (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product)}
                      disabled={isOutOfStock}
                      className={`group relative p-4 rounded-lg border-2 transition-all text-left ${
                        isOutOfStock
                          ? 'border-red-200 bg-red-50 opacity-60 cursor-not-allowed'
                          : 'border-gray-200 bg-white hover:border-blue-500 hover:shadow-lg'
                      }`}
                    >
                      {/* Stock Badge */}
                      <div className="absolute top-2 right-2">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            Out of Stock
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                            Low: {stock}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            {stock}
                          </span>
                        )}
                      </div>

                      {/* Product Icon */}
                      <div className="h-16 w-16 mx-auto mb-3 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg
                          className="h-8 w-8 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                          />
                        </svg>
                      </div>

                      {/* Product Info */}
                      <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">
                        {product.name}
                      </h3>
                      {product.genericName && (
                        <p className="text-xs text-gray-500 mb-2 truncate">{product.genericName}</p>
                      )}
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-lg font-bold text-blue-600">
                          {getCurrencySymbol()}
                          {product.sellingPrice.toFixed(2)}
                        </span>
                        {product.barcode && (
                          <span className="text-xs text-gray-400">{product.barcode.slice(-4)}</span>
                        )}
                      </div>

                      {/* Add Icon */}
                      {!isOutOfStock && (
                        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                            <svg
                              className="h-5 w-5 text-white"
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
                          </div>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Cart */}
        <div className="w-96 flex flex-col bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Cart Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-gray-800">Current Order</h2>
              {cart.items.length > 0 && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">
              {selectedCustomer ? `Customer: ${selectedCustomer.name}` : 'Walk-in customer'}
            </p>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {cart.items.length === 0 ? (
              <div className="text-center py-12">
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
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Cart is empty</h3>
                <p className="mt-1 text-sm text-gray-500">Add products to start an order</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
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
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm truncate">{item.name}</h4>
                      <p className="text-sm text-gray-600 mt-0.5">
                        {getCurrencySymbol()}
                        {item.price.toFixed(2)} each
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => cart.updateQuantity(item.id, item.quantity - 1)}
                          className="h-7 w-7 bg-white border border-gray-300 rounded hover:bg-gray-100 flex items-center justify-center transition-colors"
                        >
                          <svg
                            className="h-4 w-4 text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M20 12H4"
                            />
                          </svg>
                        </button>

                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                            const newQty = parseInt(e.target.value) || 0
                            if (newQty > 0) cart.updateQuantity(item.id, newQty)
                          }}
                          className="w-16 text-center border border-gray-300 rounded px-2 py-1 text-sm"
                          min="1"
                        />

                        <button
                          onClick={() => cart.updateQuantity(item.id, item.quantity + 1)}
                          className="h-7 w-7 bg-white border border-gray-300 rounded hover:bg-gray-100 flex items-center justify-center transition-colors"
                        >
                          <svg
                            className="h-4 w-4 text-gray-600"
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
                        </button>

                        <button
                          onClick={() => cart.removeItem(item.id)}
                          className="ml-auto h-7 w-7 bg-red-50 border border-red-200 rounded hover:bg-red-100 flex items-center justify-center transition-colors"
                        >
                          <svg
                            className="h-4 w-4 text-red-600"
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
                      </div>

                      <p className="text-sm font-semibold text-blue-600 mt-2">
                        {getCurrencySymbol()}
                        {(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary and Actions */}
          <div className="p-6 border-t border-gray-200 space-y-4">
            {/* Summary */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal:</span>
                <span className="font-medium">
                  {getCurrencySymbol()}
                  {cart.getSubtotal().toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Discount:</span>
                <span className="font-medium text-green-600">
                  -{getCurrencySymbol()}
                  {cart.getDiscountAmount().toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Tax:</span>
                <span className="font-medium">
                  {getCurrencySymbol()}
                  {cart.getTaxAmount().toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-gray-200">
                <span>Total:</span>
                <span className="text-blue-600">
                  {getCurrencySymbol()}
                  {cart.getTotal().toFixed(2)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={handleCheckout}
                disabled={cart.items.length === 0}
                className="w-full inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
                Checkout
              </button>
              <button
                onClick={() => cart.clearCart()}
                disabled={cart.items.length === 0}
                className="w-full inline-flex items-center justify-center px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-black/50  z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl shadow-xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Select Customer</h2>
                <button
                  onClick={() => setShowCustomerModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
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

              {/* Search Input */}
              <div className="relative mt-4">
                <input
                  type="text"
                  placeholder="Search by name or phone..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  autoFocus
                />
                <svg
                  className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
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
            </div>

            {/* Customer List */}
            <div className="p-6 max-h-96 overflow-y-auto">
              {customers.length === 0 ? (
                <div className="text-center py-12">
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
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No customers found</h3>
                  <p className="mt-1 text-sm text-gray-500">Try adjusting your search query</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {customers.map((customer) => (
                    <button
                      key={customer.id}
                      onClick={() => selectCustomer(customer)}
                      className="w-full p-4 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg text-left transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
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
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                            <p className="text-sm text-gray-600">{customer.phone}</p>
                            {customer.email && (
                              <p className="text-xs text-gray-500 mt-0.5">{customer.email}</p>
                            )}
                          </div>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {customer.loyaltyPoints} pts
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50  z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-lg shadow-xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Complete Payment</h2>
              <p className="text-sm text-gray-600 mt-1">
                Process the transaction and complete the sale
              </p>
            </div>

            <div className="p-6 space-y-4">
              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                      paymentMethod === 'cash'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    Cash
                  </button>
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                      paymentMethod === 'card'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                    Card
                  </button>
                  <button
                    onClick={() => setPaymentMethod('mobile')}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                      paymentMethod === 'mobile'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                    Mobile
                  </button>
                  <button
                    onClick={() => setPaymentMethod('credit')}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                      paymentMethod === 'credit'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    Credit
                  </button>
                </div>
              </div>

              {/* Account Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Account <span className="text-xs text-gray-500">(Optional)</span>
                </label>
                <select
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
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
                {selectedAccount && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ Money will be added to this account
                  </p>
                )}
              </div>

              {/* Total Amount */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Amount</label>
                <div className="text-3xl font-bold text-blue-600">
                  {getCurrencySymbol()}
                  {cart.getTotal().toFixed(2)}
                </div>
              </div>

              {/* Paid Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Paid Amount</label>
                <input
                  type="number"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                  placeholder="0.00"
                  step="0.01"
                  autoFocus
                />
              </div>

              {/* Quick Amount Buttons */}
              {paymentMethod === 'cash' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quick Amount
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[10, 20, 50, 100].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setPaidAmount(amount.toString())}
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-900 rounded-lg text-sm font-medium transition-colors"
                      >
                        ${amount}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setPaidAmount(cart.getTotal().toFixed(2))}
                    className="w-full mt-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    Exact Amount
                  </button>
                </div>
              )}

              {/* Change/Error Display */}
              {paidAmount && parseFloat(paidAmount) >= cart.getTotal() && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <svg
                      className="h-5 w-5 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <p className="text-sm font-medium text-green-800">Change to Return:</p>
                  </div>
                  <p className="text-2xl font-bold text-green-900">
                    {getCurrencySymbol()}
                    {(parseFloat(paidAmount) - cart.getTotal()).toFixed(2)}
                  </p>
                </div>
              )}

              {paidAmount && parseFloat(paidAmount) < cart.getTotal() && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <svg
                      className="h-5 w-5 text-red-600"
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
                    <p className="text-sm text-red-700">
                      Insufficient payment: {getCurrencySymbol()}
                      {(cart.getTotal() - parseFloat(paidAmount)).toFixed(2)} short
                    </p>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add any notes about this sale..."
                  rows={3}
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={completeSale}
                disabled={!paidAmount || parseFloat(paidAmount) < cart.getTotal()}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
              >
                Complete Sale
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
