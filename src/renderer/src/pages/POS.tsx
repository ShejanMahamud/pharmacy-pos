import { useCallback, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import CartPanel from '../components/pos/CartPanel'
import CartSummary from '../components/pos/CartSummary'
import CustomerBadge from '../components/pos/CustomerBadge'
import CustomerSelectModal from '../components/pos/CustomerSelectModal'
import PaymentModal from '../components/pos/PaymentModal'
import ProductSearch from '../components/pos/ProductSearch'
import ProductsGrid from '../components/pos/ProductsGrid'
import { useAuthStore } from '../store/authStore'
import { useCartStore } from '../store/cartStore'
import { useSettingsStore } from '../store/settingsStore'
import { BankAccount, Customer, InventoryItem, Product } from '../types/pos'

export default function POS(): React.JSX.Element {
  const [searchTerm, setSearchTerm] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [customerSearch, setCustomerSearch] = useState('')
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
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
    } catch {
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
    } catch {
      toast.error('Search failed')
    }
  }

  const loadInventory = async (): Promise<void> => {
    try {
      const inv = await window.api.inventory.getAll()
      setInventory(inv)
    } catch {
      console.error('Failed to load inventory')
    }
  }

  const loadAccounts = async (): Promise<void> => {
    try {
      const allAccounts = await window.api.bankAccounts.getAll()
      setAccounts(allAccounts.filter((acc) => acc.isActive))
    } catch {
      console.error('Failed to load accounts')
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      void searchProducts()
    }, 300)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      } catch {
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
    } catch {
      toast.error('Failed to search customers')
    }
  }

  const selectCustomer = (customer: Customer): void => {
    setSelectedCustomer(customer)
    cart.setCustomer(customer.id)
    setShowCustomerModal(false)
    toast.success(`Customer ${customer.name} selected`)
  }

  const removeCustomer = (): void => {
    setSelectedCustomer(null)
    cart.setCustomer(undefined)
    toast.success('Customer removed')
  }

  useEffect(() => {
    if (customerSearch) {
      const timer = setTimeout(() => {
        void searchCustomers()
      }, 300)
      return () => clearTimeout(timer)
    }
    return undefined
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerSearch])

  const handleCheckout = (): void => {
    if (cart.items.length === 0) {
      toast.error('Cart is empty')
      return
    }
    setShowPaymentModal(true)
  }

  const completeSale = async (
    paymentMethod: string,
    paidAmount: number,
    selectedAccount: string
  ): Promise<void> => {
    if (!user) return

    const total = cart.getTotal()

    if (paidAmount < total) {
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
        paidAmount,
        changeAmount: paidAmount - total,
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
      setShowPaymentModal(false)
      await loadProducts()
    } catch {
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
            <ProductSearch
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onBarcodeSearch={handleBarcodeSearch}
              isBarcodeScanning={isBarcodeScanning}
              onCustomerSelect={() => setShowCustomerModal(true)}
            />

            {/* Selected Customer Badge */}
            {selectedCustomer && (
              <CustomerBadge customer={selectedCustomer} onRemove={removeCustomer} />
            )}
          </div>

          {/* Products Grid */}
          <div className="flex-1 overflow-y-auto">
            <ProductsGrid
              products={products}
              inventory={inventory}
              loading={loading}
              currencySymbol={getCurrencySymbol()}
              onAddToCart={addToCart}
            />
          </div>
        </div>

        {/* Right Side - Cart */}
        <div className="flex flex-col">
          <CartPanel
            items={cart.items}
            customer={selectedCustomer}
            currencySymbol={getCurrencySymbol()}
            onUpdateQuantity={cart.updateQuantity}
            onRemoveItem={cart.removeItem}
          />
          <CartSummary
            subtotal={cart.getSubtotal()}
            discount={cart.getDiscountAmount()}
            tax={cart.getTaxAmount()}
            total={cart.getTotal()}
            itemCount={cart.items.length}
            currencySymbol={getCurrencySymbol()}
            onCheckout={handleCheckout}
            onClear={cart.clearCart}
          />
        </div>
      </div>

      {/* Customer Modal */}
      <CustomerSelectModal
        isOpen={showCustomerModal}
        customers={customers}
        searchTerm={customerSearch}
        onSearchChange={setCustomerSearch}
        onSelect={selectCustomer}
        onClose={() => setShowCustomerModal(false)}
      />

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        total={cart.getTotal()}
        accounts={accounts}
        currencySymbol={getCurrencySymbol()}
        onComplete={completeSale}
        onClose={() => setShowPaymentModal(false)}
      />
    </div>
  )
}
